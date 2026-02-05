import { PipelineEvent } from "../lib/types";

const stages = [
  "claim_extractor",
  "evidence_finder",
  "counter_evidence",
  "evidence_judge",
  "risk_integrity",
];

type ClaimPipelineTrackerProps = {
  claimId: string;
  events: PipelineEvent[];
};

export function ClaimPipelineTracker({
  claimId,
  events,
}: ClaimPipelineTrackerProps) {
  const claimEvents = events.filter((event) => event.claimId === claimId);

  return (
    <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200">
        Pipeline tracker
      </p>
      <div className="grid gap-2">
        {stages.map((stage) => {
          const event = claimEvents.find((entry) => entry.stage === stage);
          const status = event?.status ?? "pending";
          return (
            <div
              key={stage}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-1 text-[11px] text-slate-200"
            >
              <span>{stage.replace("_", " ")}</span>
              <span
                className={
                  status === "failed"
                    ? "text-rose-200"
                    : status === "completed"
                      ? "text-emerald-200"
                      : "text-cyan-200"
                }
              >
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
