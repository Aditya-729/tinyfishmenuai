import { useCallback, useEffect, useRef, useState } from "react";
import { PipelineEvent } from "../lib/types";

type StreamState = {
  events: PipelineEvent[];
  running: boolean;
  error?: string;
  runId?: string;
  stalled?: boolean;
};

export function useNdjsonStream() {
  const [state, setState] = useState<StreamState>({
    events: [],
    running: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const lastEventAt = useRef<number>(Date.now());
  const appendEvent = useCallback((event: PipelineEvent) => {
    lastEventAt.current = Date.now();
    setState((prev) => ({
      ...prev,
      events: [...prev.events, event],
    }));
  }, []);

  const parseStream = useCallback(async (response: Response) => {
    if (!response.ok || !response.body) {
      throw new Error("Pipeline stream failed.");
    }

    const runId = response.headers.get("x-run-id") ?? undefined;
    if (runId) {
      setState((prev) => ({ ...prev, runId }));
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      lines.forEach((line) => {
        if (!line.trim()) return;
        try {
          const event = JSON.parse(line) as PipelineEvent;
          appendEvent({
            ...event,
            timestamp: event.timestamp ?? Date.now(),
          });
        } catch (error) {
          console.warn("Failed to parse NDJSON line", error);
        }
      });
    }
  }, [appendEvent]);

  const run = useCallback(
    async (body: FormData | { text: string }) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ events: [], running: true, stalled: false, error: undefined });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: body instanceof FormData ? body : JSON.stringify(body),
        headers:
          body instanceof FormData
            ? undefined
            : { "Content-Type": "application/json" },
        signal: controller.signal,
      });
      await parseStream(response);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        running: false,
        error: error instanceof Error ? error.message : "Stream error",
      }));
      return;
    }

    setState((prev) => ({ ...prev, running: false }));
  }, [parseStream]);

  const resume = useCallback(async () => {
    if (!state.runId) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setState((prev) => ({ ...prev, running: true, stalled: false, error: undefined }));
    try {
      const response = await fetch(
        `/api/analyze?runId=${state.runId}&from=${state.events.length}`,
        { signal: controller.signal },
      );
      await parseStream(response);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        running: false,
        error: error instanceof Error ? error.message : "Resume failed",
      }));
      return;
    }
    setState((prev) => ({ ...prev, running: false }));
  }, [parseStream, state.events.length, state.runId]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((prev) => ({ ...prev, running: false, stalled: false }));
  }, []);

  useEffect(() => {
    if (!state.running) return;
    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastEventAt.current;
      setState((prev) => ({
        ...prev,
        stalled: idleMs > 12000,
      }));
    }, 3000);
    return () => window.clearInterval(interval);
  }, [state.running]);

  return { ...state, run, stop, resume, appendEvent };
}
