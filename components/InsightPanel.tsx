import { PipelineSummary } from "../lib/types";

type InsightPanelProps = {
  summary?: PipelineSummary;
};

export function InsightPanel({ summary }: InsightPanelProps) {
  return (
    <div className="clay-card rounded-3xl border border-white/10 p-6 text-xs text-slate-200">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-cyan-200">
        Integrity signals
      </p>
      {!summary ? (
        <p className="text-slate-400">Signals will populate post-analysis.</p>
      ) : (
        <div className="space-y-3">
          <p>Clusters: {Object.keys(summary.clusters).length}</p>
          <p>Duplicate claims: {Object.keys(summary.duplicates).length}</p>
          <p>Temporal drift: {summary.temporalDrift.length}</p>
          <p>Evidence conflicts: {summary.conflicts.length}</p>
        </div>
      )}
    </div>
  );
}
