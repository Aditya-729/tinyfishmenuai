import { PipelineSummary } from "../lib/types";

type SourceGraphProps = {
  summary?: PipelineSummary;
};

export function SourceGraph({ summary }: SourceGraphProps) {
  if (!summary) {
    return (
      <div className="glass-panel rounded-3xl border border-white/10 p-6 text-xs text-slate-300">
        Source graph will render after pipeline completion.
      </div>
    );
  }

  const entries = Object.entries(summary.sourceGraph);

  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-6 text-xs text-slate-200">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-cyan-200">
        Source dependency graph
      </p>
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-slate-400">No shared sources detected.</p>
        ) : (
          entries.slice(0, 6).map(([url, claims]) => (
            <div
              key={url}
              className="rounded-2xl border border-white/5 bg-white/5 p-3"
            >
              <p className="truncate text-cyan-200">{url}</p>
              <p className="mt-1 text-slate-300">
                Linked claims: {claims.join(", ")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
