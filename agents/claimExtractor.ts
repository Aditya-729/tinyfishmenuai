import { MinoClient } from "../lib/mino";
import { Claim } from "../lib/types";
import { tokenize, hashToken } from "../lib/utils";

const splitClaims = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 12)
    .slice(0, 12);

export const extractClaims = async (
  text: string,
  mino: MinoClient,
): Promise<Claim[]> => {
  const fallbackClaims = splitClaims(text).map((sentence, index) => ({
    id: hashToken(`${sentence}-${index}`),
    text: sentence,
    tokens: tokenize(sentence),
  }));

  try {
    const response = await mino.runAgent({
      role: "Claim Extractor Agent",
      task: "Extract atomic factual claims from the document as a JSON array.",
      context: { document: text },
    });

    const claimsFromAgent = Array.isArray(response.structured?.claims)
      ? (response.structured?.claims as string[])
      : [];

    if (claimsFromAgent.length > 0) {
      return claimsFromAgent.slice(0, 12).map((claim, index) => ({
        id: hashToken(`${claim}-${index}`),
        text: claim,
        tokens: tokenize(claim),
      }));
    }
  } catch (error) {
    console.warn("Mino claim extraction failed, falling back.", error);
  }

  return fallbackClaims;
};
