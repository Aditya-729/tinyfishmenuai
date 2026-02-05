import { MinoClient } from "../lib/mino";
import { ClaimAssessment, EvidenceItem } from "../lib/types";
import { average, clamp } from "../lib/utils";
import { scoreWorldRelevance } from "../lib/analysis";

export const judgeEvidence = async (
  claimId: string,
  claimText: string,
  supporting: EvidenceItem[],
  contradicting: EvidenceItem[],
  mino: MinoClient,
): Promise<ClaimAssessment> => {
  const supportScore = average(
    supporting.map((item) => item.relevanceScore),
  );
  const contradictScore = average(
    contradicting.map((item) => item.relevanceScore),
  );
  const freshnessScore = clamp(1 - contradictScore * 0.4);
  const worldRelevanceScore = scoreWorldRelevance(claimText);
  const strengthScore = clamp(supportScore * 1.15 - contradictScore * 0.85 + 0.35);

  try {
    await mino.runAgent({
      role: "Evidence Judge Agent",
      task: "Review evidence strength and provide a short assessment note.",
      context: { claim: claimText, supporting, contradicting },
    });
  } catch (error) {
    console.warn("Mino evidence judge failed.", error);
    throw error;
  }

  return {
    claimId,
    strengthScore,
    freshnessScore,
    worldRelevanceScore,
    riskLabel: "Medium",
    notes: [
      supportScore > contradictScore
        ? "Supporting evidence appears stronger."
        : "Contradicting evidence needs review.",
    ],
  };
};
