export type PipelineStage =
  | "claim_extractor"
  | "evidence_finder"
  | "counter_evidence"
  | "evidence_judge"
  | "risk_integrity"
  | "post_processing";

export type PipelineStatus =
  | "started"
  | "in_progress"
  | "completed"
  | "warning"
  | "failed";

export type EvidenceItem = {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedAt?: string;
  relevanceScore: number;
  stance: "supporting" | "contradicting" | "neutral";
};

export type Claim = {
  id: string;
  text: string;
  tokens: string[];
};

export type ClaimAssessment = {
  claimId: string;
  strengthScore: number;
  freshnessScore: number;
  indiaRelevanceScore: number;
  riskLabel:
    | "Strong"
    | "Medium"
    | "Weak"
    | "Possibly misleading"
    | "Possibly outdated";
  notes: string[];
};

export type ClaimResult = {
  claim: Claim;
  supporting: EvidenceItem[];
  contradicting: EvidenceItem[];
  assessment: ClaimAssessment;
  timingMs: number;
  duplicatesWith?: string[];
  clusterId?: string;
  temporalDrift?: boolean;
  conflictDetected?: boolean;
};

export type PipelineEvent = {
  runId: string;
  sequence: number;
  claimId: string;
  stage: PipelineStage;
  status: PipelineStatus;
  timestamp: number;
  payload?: Partial<ClaimResult>;
  message?: string;
};

export type PipelineSummary = {
  sourceGraph: Record<string, string[]>;
  clusters: Record<string, string[]>;
  duplicates: Record<string, string[]>;
  temporalDrift: string[];
  conflicts: string[];
};
