import { MinoClient } from "../lib/mino";
import { ClaimAssessment } from "../lib/types";
import { clamp } from "../lib/utils";

const resolveRiskLabel = (score: number, freshness: number) => {
  if (freshness < 0.35) return "Possibly outdated";
  if (score > 0.75) return "Strong";
  if (score > 0.55) return "Medium";
  if (score > 0.35) return "Weak";
  return "Possibly misleading";
};

export const assessRiskIntegrity = async (
  assessment: ClaimAssessment,
  mino: MinoClient,
) => {
  const normalizedScore = clamp(assessment.strengthScore);
  const normalizedFreshness = clamp(assessment.freshnessScore);

  try {
    await mino.runAgent({
      role: "Risk & Integrity Agent",
      task: "Determine the risk label for the claim assessment.",
      context: assessment,
    });
  } catch (error) {
    console.warn("Mino risk agent failed.", error);
    throw error;
  }

  return {
    ...assessment,
    riskLabel: resolveRiskLabel(normalizedScore, normalizedFreshness),
  };
};
