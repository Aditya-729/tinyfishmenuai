import { PipelineEvent, ClaimResult } from "../lib/types";

type ClaimRailProps = {
  results: ClaimResult[];
  events: PipelineEvent[];
};

const stageOrder = [
  "claim_extractor",
  "evidence_finder",
  "counter_evidence",
  "evidence_judge",
  "risk_integrity",
];

export function ClaimRail({ results, events }: ClaimRailProps) {
  return (
    <div className="sticky top-24 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-3 text-[11px] text-slate-200">
      <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">
        Claims
      </p>
      {results.length === 0 ? (
        <p className="text-slate-400">No claims yet.</p>
      ) : (
        results.map((result) => {
          const claimEvents = events.filter(
            (event) => event.claimId === result.claim.id,
          );
          const latestStage =
            claimEvents
              .slice()
              .sort(
                (a, b) =>
                  stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage),
              )
              .pop()?.stage ?? "claim_extractor";
          return (
            <a
              key={result.claim.id}
              href={`#claim-${result.claim.id}`}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-1 hover:border-cyan-300/40"
            >
              <span className="max-w-[110px] truncate">
                {result.claim.text}
              </span>
              <span className="text-[10px] text-cyan-200">{latestStage}</span>
            </a>
          );
        })
      )}
    </div>
  );
}
