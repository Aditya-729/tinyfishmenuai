"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ClaimResult } from "../lib/types";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";
import { useFocusMode } from "../hooks/useFocusMode";

type ClaimCardProps = {
  result: ClaimResult;
  onRetry?: (claimId: string, claimText: string) => void;
  stalled?: boolean;
  stalledStage?: string;
  onRetryStage?: (stage: string) => void;
  slow?: boolean;
  retrying?: boolean;
};

const riskTone = (label: ClaimResult["assessment"]["riskLabel"]) => {
  if (label === "Strong") return "strong";
  if (label === "Medium") return "medium";
  return "weak";
};

export function ClaimCard({
  result,
  onRetry,
  stalled,
  stalledStage,
  onRetryStage,
  slow,
  retrying,
}: ClaimCardProps) {
  const { focusMode } = useFocusMode();
  const [activeTab, setActiveTab] = useState<"supporting" | "contradicting">(
    "supporting",
  );
  const [expanded, setExpanded] = useState(false);
  const evidence =
    activeTab === "supporting" ? result.supporting : result.contradicting;
  const shownEvidence = useMemo(() => {
    if (focusMode) return evidence.slice(0, 2);
    return expanded ? evidence : evidence.slice(0, 3);
  }, [evidence, expanded, focusMode]);

  return (
    <motion.div
      className={
        focusMode
          ? "rounded-3xl border border-white/10 bg-white/5 p-3 text-white"
          : "clay-card group rounded-3xl border border-white/10 p-4 text-white transition-transform hover:-translate-y-1 focus-within:-translate-y-1 focus-within:scale-[1.01]"
      }
      initial={focusMode ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: focusMode ? 0 : 0.4 }}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold">{result.claim.text}</p>
        <div className="flex flex-wrap items-center gap-2">
          {!focusMode && slow ? (
            <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-slate-300">
              Slow…
            </span>
          ) : null}
          {!focusMode && stalled ? (
            <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] text-amber-200">
              Stalled – retry stage
            </span>
          ) : null}
          <Badge
            label={result.assessment.riskLabel}
            tone={riskTone(result.assessment.riskLabel)}
          />
        </div>
      </div>
      {!focusMode && onRetry ? (
        <button
          type="button"
          onClick={() => onRetry(result.claim.id, result.claim.text)}
          className="mt-1 text-[11px] text-cyan-200 hover:text-cyan-100"
        >
          Retry claim
        </button>
      ) : null}
      {!focusMode && stalled && stalledStage && onRetryStage ? (
        <button
          type="button"
          onClick={() => onRetryStage(stalledStage)}
          className="mt-1 flex items-center gap-2 text-[11px] text-amber-200 hover:text-amber-100 disabled:cursor-not-allowed disabled:text-amber-200/60"
          disabled={retrying}
        >
          {retrying ? (
            <span className="inline-flex h-3 w-3 animate-spin rounded-full border border-amber-200/40 border-t-amber-200" />
          ) : null}
          Retry stage
        </button>
      ) : null}
      <div className="mt-2 space-y-2 text-[11px] text-slate-300">
        <div>
          <p>Evidence strength</p>
          <ProgressBar value={result.assessment.strengthScore} />
        </div>
        {!focusMode ? (
          <>
            <div>
              <p>Freshness indicator</p>
              <ProgressBar value={result.assessment.freshnessScore} />
            </div>
            <div>
              <p>World relevance</p>
              <ProgressBar value={result.assessment.worldRelevanceScore} />
            </div>
          </>
        ) : null}
      </div>
      <div className="mt-3 grid gap-3 text-xs text-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("supporting")}
              className={`rounded-full px-3 py-1 text-[10px] ${
                activeTab === "supporting"
                  ? "bg-cyan-400/20 text-cyan-200"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              Supporting
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contradicting")}
              className={`rounded-full px-3 py-1 text-[10px] ${
                activeTab === "contradicting"
                  ? "bg-rose-400/20 text-rose-200"
                  : "bg-white/5 text-slate-300"
              }`}
            >
              Contradicting
            </button>
          </div>
          <ul className="mt-3 space-y-2 text-[11px]">
            {shownEvidence.map((item) => (
              <li key={item.id} className="text-slate-200">
                <a
                  className="hover:text-cyan-200"
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          {!focusMode && evidence.length > 3 ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-2 text-[11px] text-slate-300 hover:text-white"
            >
              {expanded ? "Show less" : "Show all"}
            </button>
          ) : null}
        </div>
      </div>
      {!focusMode ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
          {result.clusterId ? (
            <span className="rounded-full bg-white/10 px-3 py-1">
              Cluster: {result.clusterId}
            </span>
          ) : null}
          {result.duplicatesWith && result.duplicatesWith.length > 0 ? (
            <span className="rounded-full bg-white/10 px-3 py-1">
              Duplicates: {result.duplicatesWith.length}
            </span>
          ) : null}
          {result.temporalDrift ? (
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-200">
              Temporal drift
            </span>
          ) : null}
          {result.conflictDetected ? (
            <span className="rounded-full bg-rose-400/10 px-3 py-1 text-rose-200">
              Evidence conflict
            </span>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
