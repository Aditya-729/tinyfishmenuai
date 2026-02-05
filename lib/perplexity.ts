import { fetchWithTimeout } from "./http";

type PerplexityOptions = {
  apiKey?: string;
  baseUrl?: string;
};

type PerplexitySource = {
  title?: string;
  url?: string;
  snippet?: string;
};

type PerplexityResponse = {
  results?: PerplexitySource[];
};

const defaultBaseUrl = "https://api.perplexity.ai";
const maxConcurrent = 3;
const queue: Array<() => void> = [];
let active = 0;

const acquire = async () => {
  if (active < maxConcurrent) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => queue.push(resolve));
  active += 1;
};

const release = () => {
  active = Math.max(0, active - 1);
  const next = queue.shift();
  if (next) next();
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class PerplexityClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: PerplexityOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? defaultBaseUrl;
  }

  async search(query: string): Promise<PerplexitySource[]> {
    if (!this.apiKey) {
      return [];
    }

    await acquire();
    try {
      const maxRetries = 3;
      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        try {
          const response = await fetchWithTimeout(`${this.baseUrl}/search`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({ query }),
            timeoutMs: 12000,
          });

          if (response.status === 429) {
            const retryAfter = Number(response.headers.get("retry-after") ?? 0);
            const backoff = retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
            await sleep(backoff);
            continue;
          }

          if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
          }

          const data = (await response.json()) as PerplexityResponse;
          return data.results ?? [];
        } catch (error) {
          if (attempt === maxRetries) throw error;
          await sleep(300 * 2 ** attempt);
        }
      }
    } finally {
      release();
    }

    return [];
  }
}
