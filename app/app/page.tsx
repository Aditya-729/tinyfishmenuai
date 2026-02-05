"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { UploadPanel } from "../../components/UploadPanel";
import { PipelineLog } from "../../components/PipelineLog";
import { ClaimCard } from "../../components/ClaimCard";
import { ClaimPipelineTracker } from "../../components/ClaimPipelineTracker";
import { SourceGraph } from "../../components/SourceGraph";
import { InsightPanel } from "../../components/InsightPanel";
import { ClaimRail } from "../../components/ClaimRail";
import { useNdjsonStream } from "../../hooks/useNdjsonStream";
import { PipelineEvent } from "../../lib/types";
import { Skeleton } from "../../ui/Skeleton";
import { buildResults, extractSummary } from "../../lib/pipelineClient";

export default function AppPage() {
  const { events, running, run, stop, error, stalled, resume, appendEvent } =
    useNdjsonStream();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [now, setNow] = useState(Date.now());
  const [retryingClaims, setRetryingClaims] = useState<Record<string, boolean>>(
    {},
  );

  const results = useMemo(() => buildResults(events), [events]);
  const summary = useMemo(() => extractSummary(events), [events]);
  const claimHealth = useMemo(() => {
    const stageOrder = [
      "claim_extractor",
      "evidence_finder",
      "counter_evidence",
      "evidence_judge",
      "risk_integrity",
    ];
    const retryable = new Set([
      "evidence_finder",
      "counter_evidence",
      "evidence_judge",
      "risk_integrity",
    ]);
    const map = new Map<
      string,
      { lastEventAt: number; stage: string; isFinal: boolean; retryable: boolean }
    >();
    events.forEach((event) => {
      if (event.claimId === "document" || event.claimId === "summary") return;
      const last = map.get(event.claimId);
      const incomingAt = event.timestamp ?? Date.now();
      const lastEventAt = last
        ? Math.max(last.lastEventAt, incomingAt)
        : incomingAt;
      const isFinal =
        event.stage === "risk_integrity" &&
        (event.status === "completed" || event.status === "failed");
      const stageIndex = stageOrder.indexOf(event.stage);
      const currentIndex = last ? stageOrder.indexOf(last.stage) : -1;
      const stage = !last || stageIndex >= currentIndex ? event.stage : last.stage;
      const retryableStage = retryable.has(stage);
      map.set(event.claimId, {
        lastEventAt,
        stage,
        isFinal: last ? last.isFinal || isFinal : isFinal,
        retryable: retryableStage,
      });
    });
    return map;
  }, [events]);

  const handleSubmit = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      if (text) formData.append("text", text);
      run(formData);
      return;
    }
    if (!text.trim()) return;
    run({ text });
  };

  const handleRetry = (claimId: string, claimText: string) => {
    fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, claimText }),
    }).then(async (response) => {
      if (!response.ok || !response.body) return;
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
            appendEvent(event);
          } catch {
            return;
          }
        });
      }
    });
  };

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 4000);
    return () => window.clearInterval(interval);
  }, []);

  const handleRetryStage = async (
    claimId: string,
    claimText: string,
    stage: string,
  ) => {
    if (retryingClaims[claimId]) return;
    setRetryingClaims((prev) => ({ ...prev, [claimId]: true }));
    const claimResult = results.find((result) => result.claim.id === claimId);
    const response = await fetch("/api/claim-stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: events[0]?.runId,
        claimId,
        claimText,
        stage,
        supporting: claimResult?.supporting,
        contradicting: claimResult?.contradicting,
        assessment: claimResult?.assessment,
      }),
    });
    if (response.ok) {
      const event = (await response.json()) as PipelineEvent;
      appendEvent({ ...event, sequence: events.length });
    }
    setRetryingClaims((prev) => ({ ...prev, [claimId]: false }));
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ClaimRail results={results} events={events} />
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
            <UploadPanel
              text={text}
              onTextChange={setText}
              onFileChange={setFile}
              onSubmit={handleSubmit}
              onStop={stop}
              running={running}
            />
            <PipelineLog events={events} />
            <InsightPanel summary={summary} />
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
              Pipeline error: {error}{" "}
              <button
                onClick={resume}
                className="font-semibold text-rose-200 hover:text-rose-100"
              >
                Resume stream
              </button>
            </div>
          ) : null}
          {stalled ? (
            <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              Pipeline stalled.{" "}
              <button
                onClick={resume}
                className="font-semibold text-amber-200 hover:text-amber-100"
              >
                Resume stream
              </button>
            </div>
          ) : null}

          <SourceGraph summary={summary} />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {results.length === 0 && running ? (
              <div className="min-w-[320px] space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                No claims yet. Paste a document to begin.
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.claim.id}
                  id={`claim-${result.claim.id}`}
                  className="min-w-[320px] space-y-3"
                >
                  <ClaimPipelineTracker
                    claimId={result.claim.id}
                    events={events}
                  />
                  <ClaimCard
                    result={result}
                    onRetry={handleRetry}
                    slow={(() => {
                      const health = claimHealth.get(result.claim.id);
                      if (!health || health.isFinal || !health.retryable) {
                        return false;
                      }
                      const idleMs = now - health.lastEventAt;
                      return idleMs > 15000 && idleMs <= 25000;
                    })()}
                    stalled={(() => {
                      const health = claimHealth.get(result.claim.id);
                      if (!health || health.isFinal || !health.retryable) {
                        return false;
                      }
                      return now - health.lastEventAt > 25000;
                    })()}
                    stalledStage={claimHealth.get(result.claim.id)?.stage}
                    retrying={Boolean(retryingClaims[result.claim.id])}
                    onRetryStage={(stage) =>
                      handleRetryStage(result.claim.id, result.claim.text, stage)
                    }
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
