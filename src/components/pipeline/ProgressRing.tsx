"use client";

import type { PipelineStatus } from "@/src/types/project";

interface ProgressRingProps {
  status: PipelineStatus;
  errorMessage?: string;
}

const STATUS_PERCENT: Record<PipelineStatus, number> = {
  idle: 0,
  ingesting: 12,
  analyzing: 25,
  extracting: 37,
  synthesizing: 50,
  scoring: 62,
  authenticating: 75,
  complete: 100,
  error: -1,
  budget_exceeded: -1,
};

const STATUS_LABEL: Record<PipelineStatus, string> = {
  idle: "Ready",
  ingesting: "Ingesting content…",
  analyzing: "Analyzing information gain…",
  extracting: "Extracting knowledge…",
  synthesizing: "Synthesizing platform outputs…",
  scoring: "Scoring hooks…",
  authenticating: "Authenticating outputs…",
  complete: "Content ready",
  error: "Pipeline failed",
  budget_exceeded: "Budget exceeded",
};

const STATUS_EMOJI: Record<PipelineStatus, string> = {
  idle: "⏸",
  ingesting: "📥",
  analyzing: "🔬",
  extracting: "🧠",
  synthesizing: "✍️",
  scoring: "🎯",
  authenticating: "🛡️",
  complete: "✅",
  error: "❌",
  budget_exceeded: "💸",
};

export function ProgressRing({ status, errorMessage }: ProgressRingProps) {
  const isError = status === "error" || status === "budget_exceeded";
  const percent = STATUS_PERCENT[status] === -1 ? 37 : STATUS_PERCENT[status]; // freeze at extract on error
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  const strokeColor = isError ? "var(--glass-danger)" : status === "complete" ? "var(--glass-accent)" : "var(--glass-text)";

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative w-28 h-28">
        <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
          {/* Track */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth="6"
          />
          {/* Progress */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-xl leading-none">{STATUS_EMOJI[status]}</span>
          <span className="text-xs font-bold text-[var(--glass-text)]">
            {percent}%
          </span>
        </div>
      </div>

      <p className="text-sm font-medium text-[var(--glass-text)] text-center">
        {STATUS_LABEL[status]}
      </p>

      {isError && errorMessage && (
        <p className="text-xs text-[var(--glass-danger)] text-center max-w-xs">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
