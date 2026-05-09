import type { PipelineStatus } from "@/src/types/project";

export const STATUS_LABEL: Record<PipelineStatus, string> = {
  idle: "Idle",
  ingesting: "Ingesting…",
  analyzing: "Analyzing…",
  extracting: "Extracting…",
  synthesizing: "Synthesizing…",
  scoring: "Scoring hooks…",
  authenticating: "Authenticating…",
  complete: "Complete",
  error: "Error",
  budget_exceeded: "Budget exceeded",
};

export const STATUS_COLOR: Record<PipelineStatus, string> = {
  idle: "var(--glass-text-tertiary)",
  ingesting: "var(--glass-text)",
  analyzing: "var(--glass-text)",
  extracting: "var(--glass-text)",
  synthesizing: "var(--glass-text)",
  scoring: "var(--glass-text)",
  authenticating: "var(--glass-text)",
  complete: "var(--glass-accent)",
  error: "var(--glass-danger)",
  budget_exceeded: "var(--glass-danger)",
};
