import { PipelineEvent } from "../lib/types";

type PipelineLogProps = {
  events: PipelineEvent[];
};

export function PipelineLog({ events }: PipelineLogProps) {
  return (
    <details className="glass-panel rounded-3xl border border-white/10 p-4 text-xs text-slate-200">
      <summary className="cursor-pointer text-xs uppercase tracking-[0.2em] text-cyan-200">
        Live pipeline log
      </summary>
      <div className="mt-3 max-h-[220px] space-y-2 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-slate-400">Awaiting events...</p>
        ) : (
          events.slice(-16).map((event, index) => (
            <div
              key={`${event.claimId}-${event.stage}-${index}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/5 px-3 py-1"
            >
              <span className="text-cyan-200">{event.stage}</span>
              <span className="text-slate-300">{event.claimId}</span>
              <span className="text-emerald-200">{event.status}</span>
            </div>
          ))
        )}
      </div>
    </details>
  );
}
