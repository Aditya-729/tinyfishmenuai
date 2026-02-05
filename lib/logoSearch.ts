const extractVqd = (html: string) => {
  const match = html.match(/vqd=["']?([\d-]+)["']?/);
  return match?.[1];
};

export const fetchLogoUrl = async (query: string) => {
  try {
    const searchPage = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    );
    if (!searchPage.ok) return null;
    const html = await searchPage.text();
    const vqd = extractVqd(html);
    if (!vqd) return null;

    const response = await fetch(
      `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(
        query,
      )}&vqd=${vqd}`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      results?: Array<{ image: string }>;
    };
    return data.results?.[0]?.image ?? null;
  } catch {
    return null;
  }
};
