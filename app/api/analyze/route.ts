import { runPipeline } from "../../../pipeline/runPipeline";
import { eventBus } from "../../../pipeline/eventBus";
import { PipelineEvent } from "../../../lib/types";
import { createStreamEvent } from "../../../lib/streamEvents";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  const from = Number(searchParams.get("from") ?? 0);
  if (!runId) {
    return new Response(JSON.stringify({ error: "Missing runId." }), {
      status: 400,
    });
  }

  const stream = eventBus.createStream(runId, Number.isNaN(from) ? 0 : from);
  if (!stream) {
    return new Response(JSON.stringify({ error: "Run not found." }), {
      status: 404,
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

export async function POST(request: Request) {
  let text = "";

  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = (await request.json()) as { text?: string };
    text = body.text ?? "";
  } else {
    const form = await request.formData();
    const file = form.get("file");
    const bodyText = form.get("text");
    if (typeof bodyText === "string") {
      text = bodyText;
    } else if (file instanceof File) {
      text = await file.text();
    }
  }

  if (!text.trim()) {
    return new Response(
      JSON.stringify({ error: "No document text provided." }),
      { status: 400 },
    );
  }

  const runId = crypto.randomUUID();
  eventBus.startRun(runId);

  runPipeline({
    text,
    runId,
    emit: (event) => eventBus.append(runId, event),
  })
    .catch((error) => {
      eventBus.append(
        runId,
        createStreamEvent({
          runId,
          claimId: "system",
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
