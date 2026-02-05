import { MinoClient } from "../../../lib/mino";
import { PerplexityClient } from "../../../lib/perplexity";
import { createStreamEvent } from "../../../lib/streamEvents";
import { ClaimAssessment, EvidenceItem, PipelineEvent, PipelineStage } from "../../../lib/types";
import { findEvidence } from "../../../agents/evidenceFinder";
import { findCounterEvidence } from "../../../agents/counterEvidence";
import { judgeEvidence } from "../../../agents/evidenceJudge";
import { assessRiskIntegrity } from "../../../agents/riskIntegrity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClaimStageBody = {
  runId?: string;
  claimId: string;
  claimText: string;
  stage: PipelineStage;
  supporting?: EvidenceItem[];
  contradicting?: EvidenceItem[];
  assessment?: ClaimAssessment;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ClaimStageBody;
  if (!body.claimId || !body.claimText || !body.stage) {
    return new Response(JSON.stringify({ error: "Missing claim payload." }), {
      status: 400,
    });
  }

  const runId = body.runId ?? "local";
  const mino = new MinoClient({ apiKey: process.env.MINO_API_KEY });
  const perplexity = new PerplexityClient({ apiKey: process.env.PERPLEXITY_API_KEY });

  try {
    if (body.stage === "evidence_finder") {
      const supporting = await findEvidence(body.claimText, mino, perplexity);
      const event: PipelineEvent = {
        ...createStreamEvent({
          runId,
          claimId: body.claimId,
          stage: "evidence_finder",
          status: "completed",
          payload: { supporting },
        }),
        sequence: 0,
      };
      return Response.json(event);
    }

    if (body.stage === "counter_evidence") {
      const contradicting = await findCounterEvidence(
        body.claimText,
        mino,
        perplexity,
      );
      const event: PipelineEvent = {
        ...createStreamEvent({
          runId,
          claimId: body.claimId,
          stage: "counter_evidence",
          status: "completed",
          payload: { contradicting },
        }),
        sequence: 0,
      };
      return Response.json(event);
    }

    if (body.stage === "evidence_judge") {
      if (!body.supporting || !body.contradicting) {
        return new Response(
          JSON.stringify({ error: "Missing evidence for judge stage." }),
          { status: 400 },
        );
      }
      const assessment = await judgeEvidence(
        body.claimId,
        body.claimText,
        body.supporting,
        body.contradicting,
        mino,
      );
      const event: PipelineEvent = {
        ...createStreamEvent({
          runId,
          claimId: body.claimId,
          stage: "evidence_judge",
          status: "completed",
          payload: { assessment },
        }),
        sequence: 0,
      };
      return Response.json(event);
    }

    if (body.stage === "risk_integrity") {
      if (!body.assessment) {
        return new Response(
          JSON.stringify({ error: "Missing assessment for risk stage." }),
          { status: 400 },
        );
      }
      const assessment = await assessRiskIntegrity(body.assessment, mino);
      const event: PipelineEvent = {
        ...createStreamEvent({
          runId,
          claimId: body.claimId,
          stage: "risk_integrity",
          status: "completed",
          payload: { assessment },
        }),
        sequence: 0,
      };
      return Response.json(event);
    }

    return new Response(JSON.stringify({ error: "Unsupported stage." }), {
      status: 400,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Stage retry failed",
      }),
      { status: 500 },
    );
  }
}
