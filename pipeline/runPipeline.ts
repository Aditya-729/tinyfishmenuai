import { MinoClient } from "../lib/mino";
import { PerplexityClient } from "../lib/perplexity";
import { summarizePipeline } from "../lib/analysis";
import {
  ClaimAssessment,
  ClaimResult,
  PipelineEvent,
  PipelineStage,
  PipelineStatus,
} from "../lib/types";
import { extractClaims } from "../agents/claimExtractor";
import { findEvidence } from "../agents/evidenceFinder";
import { findCounterEvidence } from "../agents/counterEvidence";
import { judgeEvidence } from "../agents/evidenceJudge";
import { assessRiskIntegrity } from "../agents/riskIntegrity";
import { createStreamEvent } from "../lib/streamEvents";

type PipelineInput = {
  text: string;
  runId: string;
  emit: (event: Omit<PipelineEvent, "sequence">) => void;
};

export async function runPipeline({ text, runId, emit }: PipelineInput) {
  const mino = new MinoClient({ apiKey: process.env.MINO_API_KEY });
  const perplexity = new PerplexityClient({ apiKey: process.env.PERPLEXITY_API_KEY });
  const startAll = Date.now();

  const emitStage = (
    claimId: string,
    stage: PipelineStage,
    status: PipelineStatus,
    payload?: Partial<ClaimResult>,
    message?: string,
  ) => {
    emit(
      createStreamEvent({
        runId,
        claimId,
        stage,
        status,
        payload,
        message,
      }),
    );
  };

  const claims = await extractClaims(text, mino);

  emitStage("document", "claim_extractor", "completed", {
    assessment: {
      claimId: "document",
      strengthScore: 0,
      freshnessScore: 0,
      indiaRelevanceScore: 0,
      riskLabel: "Medium",
      notes: [`Extracted ${claims.length} claims.`],
    },
  });

  const results: ClaimResult[] = [];

  await Promise.all(
    claims.map(async (claim) => {
      const claimStart = Date.now();
      emitStage(claim.id, "claim_extractor", "completed", { claim });

      emitStage(claim.id, "evidence_finder", "started");
      let supporting: ClaimResult["supporting"] = [];
      try {
        supporting = await findEvidence(claim.text, mino, perplexity);
        emitStage(claim.id, "evidence_finder", "completed", { supporting });
      } catch (error) {
        emitStage(
          claim.id,
          "evidence_finder",
          "failed",
          undefined,
          error instanceof Error ? error.message : "Evidence finder failed",
        );
      }

      emitStage(claim.id, "counter_evidence", "started");
      let contradicting: ClaimResult["contradicting"] = [];
      try {
        contradicting = await findCounterEvidence(claim.text, mino, perplexity);
        emitStage(claim.id, "counter_evidence", "completed", { contradicting });
      } catch (error) {
        emitStage(
          claim.id,
          "counter_evidence",
          "failed",
          undefined,
          error instanceof Error ? error.message : "Counter-evidence failed",
        );
      }

      emitStage(claim.id, "evidence_judge", "started");
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
        emitStage(claim.id, "evidence_judge", "completed", { assessment });
      } catch (error) {
        emitStage(
          claim.id,
          "evidence_judge",
          "failed",
          { assessment },
          error instanceof Error ? error.message : "Evidence judge failed",
        );
      }

      emitStage(claim.id, "risk_integrity", "started");
      try {
        assessment = await assessRiskIntegrity(assessment, mino);
        emitStage(claim.id, "risk_integrity", "completed", { assessment });
      } catch (error) {
        emitStage(
          claim.id,
          "risk_integrity",
          "failed",
          { assessment },
          error instanceof Error ? error.message : "Risk integrity failed",
        );
      }

      results.push({
        claim,
        supporting,
        contradicting,
        assessment,
        timingMs: Date.now() - claimStart,
      });
    }),
  );

  const summary = summarizePipeline(results);

  for (const result of results) {
    const clusterId = Object.entries(summary.clusters).find(([, ids]) =>
      ids.includes(result.claim.id),
    )?.[0];
    emitStage(result.claim.id, "post_processing", "completed", {
        duplicatesWith: summary.duplicates[result.claim.id] ?? [],
        clusterId,
        temporalDrift: summary.temporalDrift.includes(result.claim.id),
        conflictDetected: summary.conflicts.includes(result.claim.id),
    });
  }

  emitStage("summary", "post_processing", "completed", {
    assessment: {
      claimId: "summary",
      strengthScore: 0,
      freshnessScore: 0,
      indiaRelevanceScore: 0,
      riskLabel: "Medium",
      notes: ["Pipeline post-processing complete."],
    },
  }, JSON.stringify(summary));
}
