import { MinoClient } from "../lib/mino";
import { PerplexityClient } from "../lib/perplexity";
import { EvidenceItem } from "../lib/types";
import { hashToken } from "../lib/utils";

export const findEvidence = async (
  claimText: string,
  mino: MinoClient,
  perplexity: PerplexityClient,
): Promise<EvidenceItem[]> => {
  let query = claimText;
  try {
    const response = await mino.runAgent({
      role: "Evidence Finder Agent",
      task: "Generate concise search prompts for evidence.",
      context: { claim: claimText },
    });
    if (response.structured?.query && typeof response.structured.query === "string") {
      query = response.structured.query;
    } else if (response.text) {
      query = response.text;
    }
  } catch (error) {
    console.warn("Mino evidence prompt failed, continuing.", error);
  }

  const sources = await perplexity.search(query);
  return sources.slice(0, 6).map((source, index) => ({
    id: hashToken(`${source.url ?? source.title}-${index}-supporting`),
    title: source.title ?? "Source",
    url: source.url ?? "#",
    snippet: source.snippet ?? "No snippet available.",
    source: "Perplexity",
    relevanceScore: Math.max(0.55, 0.85 - index * 0.05),
    stance: "supporting",
  }));
};
