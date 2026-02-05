import { ClaimResult, PipelineEvent, PipelineSummary } from "./types";

export const buildResults = (events: PipelineEvent[]) => {
  const map = new Map<string, ClaimResult>();

  events.forEach((event) => {
    if (event.claimId === "document" || event.claimId === "summary") return;
    const current = map.get(event.claimId) ?? {
      claim: { id: event.claimId, text: "", tokens: [] },
      supporting: [],
      contradicting: [],
      assessment: {
        claimId: event.claimId,
        strengthScore: 0,
        freshnessScore: 0,
        indiaRelevanceScore: 0,
        riskLabel: "Medium",
        notes: [],
      },
      timingMs: 0,
    };

    map.set(event.claimId, {
      ...current,
      ...event.payload,
      claim: event.payload?.claim ?? current.claim,
      supporting: event.payload?.supporting ?? current.supporting,
      contradicting: event.payload?.contradicting ?? current.contradicting,
      assessment: event.payload?.assessment ?? current.assessment,
      duplicatesWith: event.payload?.duplicatesWith ?? current.duplicatesWith,
      clusterId: event.payload?.clusterId ?? current.clusterId,
      temporalDrift: event.payload?.temporalDrift ?? current.temporalDrift,
      conflictDetected: event.payload?.conflictDetected ?? current.conflictDetected,
    });
  });

  return Array.from(map.values());
};

export const extractSummary = (events: PipelineEvent[]) => {
  const summaryEvent = events.find((event) => event.claimId === "summary");
  if (!summaryEvent?.message) return undefined;
  try {
    return JSON.parse(summaryEvent.message) as PipelineSummary;
  } catch {
    return undefined;
  }
};
