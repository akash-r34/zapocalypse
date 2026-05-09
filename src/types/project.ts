export type PipelineStatus =
  | "idle"
  | "ingesting"
  | "analyzing"
  | "extracting"
  | "synthesizing"
  | "scoring"
  | "authenticating"
  | "complete"
  | "error"
  | "budget_exceeded";

export interface RegenerationEntry {
  status: "processing" | "complete" | "error";
  intent?: "retry" | "refine";
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  refundedAmount?: number;
}

export interface Project {
  id: string;
  status: PipelineStatus;
  sourceType: "url" | "text" | "file";
  sourceUrl?: string;
  sourcePreview?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  regenerationCount?: number;
  regenerationState?: Record<string, RegenerationEntry>;
  agentTimings?: {
    ingest?: number;
    analyze?: number;
    extract?: number;
    synthesize?: number;
    score_hooks?: number;
    authenticate?: number;
  };
  refunded?: boolean;
  refundedAmount?: number;
  refundStage?: "full" | "synthesis_only";
  skoRetained?: boolean;
  totalCost?: number;
}

export interface AdditiveFingerprint {
  analogy_style?: string;          // e.g. "explains technical concepts using mechanical metaphors"
  sentence_cadence?: "low" | "medium" | "high"; // variance spectrum, NOT word counts
  signature_phrases?: string[];     // recurring expressions unique to this creator
  storytelling_structure?: string;  // e.g. "opens with personal anecdote, pivots to data"
  humor_type?: string;             // e.g. "dry self-deprecation with industry in-jokes"
  colloquialisms?: string[];       // niche-specific informal terms they use
  explanation_pattern?: string;    // how they break down complex topics
}

export interface ToneRefinement {
  id: string;
  timestamp: Date;
  platform: string;
  feedback: string;
  original_fingerprint: AdditiveFingerprint;
  refined_fingerprint: AdditiveFingerprint;
  cost?: number;
}
