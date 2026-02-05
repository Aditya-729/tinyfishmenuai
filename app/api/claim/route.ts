import { eventBus } from "../../../pipeline/eventBus";
import { runClaimPipeline } from "../../../pipeline/runClaimPipeline";
import { PipelineEvent } from "../../../lib/types";
import { createStreamEvent } from "../../../lib/streamEvents";
import { tokenize, hashToken } from "../../../lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

const streamFromRun = (stream: ReadableStream<PipelineEvent>) =>
  new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(`${JSON.stringify(value)}\n`));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              claimId: "system",
              stage: "post_processing",
              status: "failed",
              timestamp: Date.now(),
              message: error instanceof Error ? error.message : "Stream error",
            })}\n`,
          ),
        );
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

export async function POST(request: Request) {
  const body = (await request.json()) as { claimText?: string; claimId?: string };
  if (!body.claimText?.trim()) {
    return new Response(JSON.stringify({ error: "Missing claim text." }), {
      status: 400,
    });
  }

  const claimId = body.claimId ?? hashToken(body.claimText);
  const runId = crypto.randomUUID();
  eventBus.startRun(runId);

  runClaimPipeline({
    claim: { id: claimId, text: body.claimText, tokens: tokenize(body.claimText) },
    runId,
    emit: (event) => eventBus.append(runId, event),
  })
    .catch((error) => {
      eventBus.append(
        runId,
        createStreamEvent({
          runId,
          claimId,
          stage: "post_processing",
          status: "failed",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
      );
    })
    .finally(() => eventBus.close(runId));

  const stream = eventBus.createStream(runId, 0);
  if (!stream) {
    return new Response(JSON.stringify({ error: "Failed to create stream." }), {
      status: 500,
    });
  }

  return new Response(streamFromRun(stream), {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-run-id": runId,
    },
  });
}
