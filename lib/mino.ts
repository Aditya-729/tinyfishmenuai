import { fetchWithTimeout, withRetry } from "./http";
type MinoOptions = {
  apiKey?: string;
  baseUrl?: string;
};

export type MinoAgentInput = {
  role: string;
  task: string;
  context?: Record<string, unknown>;
};

export type MinoAgentOutput = {
  text: string;
  structured?: Record<string, unknown>;
};

const defaultBaseUrl = "https://api.mino.ai";

export class MinoClient {
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: MinoOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? defaultBaseUrl;
  }

  async runAgent(input: MinoAgentInput): Promise<MinoAgentOutput> {
    if (!this.apiKey) {
      return {
        text: "Fallback mode: Mino API key not configured.",
        structured: input.context ?? {},
      };
    }

    const response = await withRetry(() =>
      fetchWithTimeout(`${this.baseUrl}/v1/agents/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(input),
        timeoutMs: 15000,
      }),
    );

    if (!response.ok) {
      throw new Error(`Mino API error: ${response.status}`);
    }

    return (await response.json()) as MinoAgentOutput;
  }
}
