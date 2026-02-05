import { ClaimResult, PipelineEvent, PipelineStage, PipelineStatus } from "./types";

type StreamEventInput = {
  runId: string;
  claimId: string;
  stage: PipelineStage;
  status: PipelineStatus;
  payload?: Partial<ClaimResult>;
  message?: string;
  timestamp?: number;
};

export const createStreamEvent = ({
  runId,
  claimId,
  stage,
  status,
  payload,
  message,
  timestamp = Date.now(),
}: StreamEventInput): Omit<PipelineEvent, "sequence"> => ({
  runId,
  claimId,
  stage,
  status,
  payload,
  message,
  timestamp,
});
