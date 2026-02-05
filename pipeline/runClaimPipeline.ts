import { MinoClient } from "../lib/mino";
import { PerplexityClient } from "../lib/perplexity";
import {
  Claim,
  ClaimAssessment,
  ClaimResult,
  PipelineEvent,
  PipelineStage,
  PipelineStatus,
} from "../lib/types";
import { findEvidence } from "../agents/evidenceFinder";
import { findCounterEvidence } from "../agents/counterEvidence";
import { judgeEvidence } from "../agents/evidenceJudge";
import { assessRiskIntegrity } from "../agents/riskIntegrity";
import { createStreamEvent } from "../lib/streamEvents";

type ClaimPipelineInput = {
  claim: Claim;
  runId: string;
  emit: (event: Omit<PipelineEvent, "sequence">) => void;
};

export async function runClaimPipeline({
  claim,
  runId,
  emit,
}: ClaimPipelineInput): Promise<ClaimResult> {
  const mino = new MinoClient({ apiKey: process.env.MINO_API_KEY });
  const perplexity = new PerplexityClient({ apiKey: process.env.PERPLEXITY_API_KEY });
  const startedAt = Date.now();

  const emitStage = (
    stage: PipelineStage,
    status: PipelineStatus,
    payload?: Partial<ClaimResult>,
    message?: string,
  ) => {
    emit(
      createStreamEvent({
        runId,
        claimId: claim.id,
        stage,
        status,
        payload,
        message,
      }),
    );
  };

  emitStage("claim_extractor", "completed", { claim });

  emitStage("evidence_finder", "started");
  let supporting: ClaimResult["supporting"] = [];
  try {
    supporting = await findEvidence(claim.text, mino, perplexity);
    emitStage("evidence_finder", "completed", { supporting });
  } catch (error) {
    emitStage(
      "evidence_finder",
      "failed",
      undefined,
      error instanceof Error ? error.message : "Evidence finder failed",
    );
  }

  emitStage("counter_evidence", "started");
  let contradicting: ClaimResult["contradicting"] = [];
  try {
    contradicting = await findCounterEvidence(claim.text, mino, perplexity);
    emitStage("counter_evidence", "completed", { contradicting });
  } catch (error) {
    emitStage(
      "counter_evidence",
      "failed",
      undefined,
      error instanceof Error ? error.message : "Counter-evidence failed",
    );
  }

  emitStage("evidence_judge", "started");
  let assessment: ClaimAssessment = {
    claimId: claim.id,
    strengthScore: 0.4,
    freshnessScore: 0.5,
    indiaRelevanceScore: 0.5,
    riskLabel: "Weak",
    notes: ["Judge stage fallback."],
  };
  try {
    assessment = await judgeEvidence(
      claim.id,
      claim.text,
      supporting,
      contradicting,
      mino,
    );
    emitStage("evidence_judge", "completed", { assessment });
  } catch (error) {
    emitStage(
      "evidence_judge",
      "failed",
      { assessment },
      error instanceof Error ? error.message : "Evidence judge failed",
    );
  }

  emitStage("risk_integrity", "started");
  try {
    assessment = await assessRiskIntegrity(assessment, mino);
    emitStage("risk_integrity", "completed", { assessment });
  } catch (error) {
    emitStage(
      "risk_integrity",
      "failed",
      { assessment },
      error instanceof Error ? error.message : "Risk integrity failed",
    );
  }

  return {
    claim,
    supporting,
    contradicting,
    assessment,
    timingMs: Date.now() - startedAt,
  };
}
