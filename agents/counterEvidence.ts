import { MinoClient } from "../lib/mino";
import { PerplexityClient } from "../lib/perplexity";
import { EvidenceItem } from "../lib/types";
import { hashToken } from "../lib/utils";

export const findCounterEvidence = async (
  claimText: string,
  mino: MinoClient,
  perplexity: PerplexityClient,
): Promise<EvidenceItem[]> => {
  let adversarialPrompt = `counter evidence for ${claimText}`;

  try {
    const response = await mino.runAgent({
      role: "Counter-Evidence Agent",
      task: "Generate adversarial search query for contradicting evidence.",
      context: { claim: claimText },
    });
    if (response.text) {
      adversarialPrompt = response.text;
    }
  } catch (error) {
    console.warn("Mino counter-evidence prompt failed.", error);
  }

  const sources = await perplexity.search(adversarialPrompt);
  return sources.slice(0, 6).map((source, index) => ({
    id: hashToken(`${source.url ?? source.title}-${index}-contradicting`),
    title: source.title ?? "Source",
    url: source.url ?? "#",
    snippet: source.snippet ?? "No snippet available.",
    source: "Perplexity",
    relevanceScore: 0.7 - index * 0.04,
    stance: "contradicting",
  }));
};
