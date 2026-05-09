"use client";

import type { PipelineStatus } from "@/src/types/project";

interface AgentStep {
  key: PipelineStatus;
  label: string;
  description: string;
  icon: string;
}

const AGENT_STEPS: AgentStep[] = [
  { key: "ingesting", label: "Ingest", description: "Parsing source content", icon: "📥" },
  { key: "analyzing", label: "Analyst", description: "Scoring originality (5 signals)", icon: "🔬" },
  { key: "extracting", label: "Extract", description: "Building Structured Knowledge Object", icon: "🧠" },
  { key: "synthesizing", label: "GEO Strategist", description: "Generating 5 platform outputs", icon: "✍️" },
  { key: "scoring", label: "Hook Scorer", description: "Scoring virality & generating A/B variants", icon: "🎯" },
  { key: "authenticating", label: "Authenticator", description: "Tone check + C2PA credentials", icon: "🔐" },
];

const STATUS_ORDER: PipelineStatus[] = [
  "idle",
  "ingesting",
  "analyzing",
  "extracting",
  "synthesizing",
  "scoring",
  "authenticating",
  "complete",
];

function getStepState(
  stepKey: PipelineStatus,
  currentStatus: PipelineStatus
): "pending" | "active" | "done" | "error" {
  const isError = currentStatus === "error" || currentStatus === "budget_exceeded";
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const stepIndex = STATUS_ORDER.indexOf(stepKey);

  if (isError) return "error";
  if (currentStatus === "complete") return "done";
  if (stepIndex < currentIndex) return "done";
  if (stepKey === currentStatus) return "active";
  return "pending";
}

interface AgentProgressPanelProps {
  status: PipelineStatus;
  errorMessage?: string;
}

export function AgentProgressPanel({ status, errorMessage }: AgentProgressPanelProps) {
  const isError = status === "error" || status === "budget_exceeded";

  return (
    <div className="rounded-2xl p-6 glass space-y-1">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest">
          Pipeline
        </p>
        {status === "complete" && (
          <span className="text-xs font-medium text-green-400">All done</span>
        )}
        {isError && (
          <span className="text-xs font-medium text-[var(--glass-danger)]">Failed</span>
        )}
      </div>

      {AGENT_STEPS.map((step) => {
        const state = getStepState(step.key, status);

        return (
          <div
            key={step.key}
            className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-300 ${
              state === "active"
                ? "bg-[var(--glass-accent)]/8 border border-[var(--glass-accent)]/15"
                : state === "done"
                ? "opacity-60"
                : "opacity-30"
            }`}
          >
            {/* Status indicator */}
            <div className="relative shrink-0 w-6 h-6 flex items-center justify-center">
              {state === "active" && (
                <>
                  <span className="absolute inset-0 rounded-full border-2 border-[var(--glass-accent)] border-t-transparent animate-spin" />
                  <span className="text-[10px]">{step.icon}</span>
                </>
              )}
              {state === "done" && (
                <span className="text-sm text-[var(--glass-accent)]">✓</span>
              )}
              {state === "error" && (
                <span className="text-sm text-[var(--glass-danger)]">✗</span>
              )}
              {state === "pending" && (
                <span className="text-[10px] opacity-40">{step.icon}</span>
              )}
            </div>

            {/* Label */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium leading-none ${
                state === "active"
                  ? "text-[var(--glass-text)]"
                  : state === "done"
                  ? "text-[var(--glass-text-secondary)]"
                  : "text-[var(--glass-text-tertiary)]"
              }`}>
                {step.label}
              </p>
              <p className="text-[11px] text-[var(--glass-text-tertiary)] mt-0.5">
                {step.description}
              </p>
            </div>

            {/* Active pulse */}
            {state === "active" && (
              <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--glass-accent)] animate-pulse" />
            )}
          </div>
        );
      })}

      {/* Error message */}
      {isError && errorMessage && (
        <div className="mt-3 pt-3 border-t border-[var(--glass-danger)]/20">
          <p className="text-xs text-[var(--glass-danger)]">{errorMessage}</p>
          {status === "budget_exceeded" && (
            <p className="text-xs text-[var(--glass-text-tertiary)] mt-1">
              Monthly budget exceeded — pipeline stopped
            </p>
          )}
        </div>
      )}
    </div>
  );
}
