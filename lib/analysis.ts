import { ClaimResult, PipelineSummary } from "./types";
import { average, clamp, tokenize } from "./utils";

const similarity = (a: string[], b: string[]) => {
  const aSet = new Set(a);
  const bSet = new Set(b);
  const intersection = [...aSet].filter((token) => bSet.has(token)).length;
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
};

export const detectDuplicates = (results: ClaimResult[]) => {
  const duplicates: Record<string, string[]> = {};
  results.forEach((result, index) => {
    for (let j = index + 1; j < results.length; j += 1) {
      const target = results[j];
      const score = similarity(result.claim.tokens, target.claim.tokens);
      if (score > 0.78) {
        duplicates[result.claim.id] = [
          ...(duplicates[result.claim.id] ?? []),
          target.claim.id,
        ];
      }
    }
  });
  return duplicates;
};

export const clusterClaims = (results: ClaimResult[]) => {
  const clusters: Record<string, string[]> = {};
  const assigned = new Set<string>();

  results.forEach((result) => {
    if (assigned.has(result.claim.id)) return;
    const clusterId = `cluster-${result.claim.id.slice(0, 6)}`;
    clusters[clusterId] = [result.claim.id];
    assigned.add(result.claim.id);

    results.forEach((candidate) => {
      if (assigned.has(candidate.claim.id)) return;
      const score = similarity(result.claim.tokens, candidate.claim.tokens);
      if (score > 0.4) {
        clusters[clusterId].push(candidate.claim.id);
        assigned.add(candidate.claim.id);
      }
    });
  });

  return clusters;
};

export const buildSourceGraph = (results: ClaimResult[]) => {
  const graph: Record<string, string[]> = {};
  results.forEach((result) => {
    const allSources = [
      ...result.supporting,
      ...result.contradicting,
    ].map((source) => source.url);
    allSources.forEach((url) => {
      graph[url] = graph[url] ?? [];
      if (!graph[url].includes(result.claim.id)) {
        graph[url].push(result.claim.id);
      }
    });
  });
  return graph;
};

export const detectTemporalDrift = (results: ClaimResult[]) => {
  return results
    .filter((result) => {
      const dates = [
        ...result.supporting,
        ...result.contradicting,
      ]
        .map((item) => item.publishedAt)
        .filter(Boolean) as string[];

      if (dates.length < 2) return false;
      const timestamps = dates.map((date) => new Date(date).getTime());
      const spread = Math.max(...timestamps) - Math.min(...timestamps);
      return spread > 1000 * 60 * 60 * 24 * 365;
    })
    .map((result) => result.claim.id);
};

export const detectEvidenceConflict = (results: ClaimResult[]) => {
  return results
    .filter((result) => {
      if (result.supporting.length === 0 || result.contradicting.length === 0) {
        return false;
      }
      const supportScore = average(
        result.supporting.map((item) => item.relevanceScore),
      );
      const contradictScore = average(
        result.contradicting.map((item) => item.relevanceScore),
      );
      return clamp(contradictScore - supportScore) > 0.15;
    })
    .map((result) => result.claim.id);
};

export const summarizePipeline = (results: ClaimResult[]): PipelineSummary => {
  const duplicates = detectDuplicates(results);
  const clusters = clusterClaims(results);
  const sourceGraph = buildSourceGraph(results);
  const temporalDrift = detectTemporalDrift(results);
  const conflicts = detectEvidenceConflict(results);

  return {
    sourceGraph,
    clusters,
    duplicates,
    temporalDrift,
    conflicts,
  };
};

export const scoreWorldRelevance = (text: string) => {
  const tokens = tokenize(text);
  const keywords = [
    "global",
    "world",
    "international",
    "worldwide",
    "united",
    "nations",
    "g7",
    "g20",
    "oecd",
    "climate",
  ];
  const hits = tokens.filter((token) => keywords.includes(token)).length;
  return clamp(hits / 6);
};
