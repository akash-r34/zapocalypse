import type { PipelineStatus } from "@/src/types/project";

interface ProgressIndicatorProps {
  status: PipelineStatus;
}

const steps: { key: PipelineStatus; label: string; shortLabel: string }[] = [
  { key: "ingesting", label: "Ingesting", shortLabel: "Ing." },
  { key: "analyzing", label: "Analyzing", shortLabel: "Ana." },
  { key: "extracting", label: "Extracting", shortLabel: "Ext." },
  { key: "synthesizing", label: "Synthesizing", shortLabel: "Syn." },
  { key: "complete", label: "Complete", shortLabel: "Done" },
];

const statusOrder: PipelineStatus[] = [
  "idle",
  "ingesting",
  "analyzing",
  "extracting",
  "synthesizing",
  "complete",
];

export function ProgressIndicator({ status }: ProgressIndicatorProps) {
  const isError = status === "error" || status === "budget_exceeded";
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, i) => {
          const stepIndex = statusOrder.indexOf(step.key);
          const isActive = step.key === status && status !== "complete";
          const isDone = !isError && (currentIndex > stepIndex || status === "complete");
          const isPending = currentIndex < stepIndex;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isError
                    ? "bg-[var(--glass-danger)]/15 text-[var(--glass-danger)]"
                    : isDone
                    ? "bg-[var(--glass-accent)] text-[var(--glass-bg)]"
                    : isActive
                    ? "border-2 border-[var(--glass-accent)] text-[var(--glass-accent)]"
                    : "bg-[var(--glass-bg-secondary)] text-[var(--glass-text-tertiary)]"
                }`}
              >
                {isDone ? "✓" : i + 1}
                {isActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-[var(--glass-accent)] border-t-transparent animate-spin" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-xs tracking-tight sm:tracking-normal font-medium text-center transition-opacity duration-300 ${
                  isPending
                    ? "text-[var(--glass-text-tertiary)] opacity-50"
                    : "text-[var(--glass-text)]"
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-px rounded-full bg-[var(--glass-bg-secondary)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            backgroundColor: isError
              ? "var(--glass-danger)"
              : "var(--glass-accent)",
            width: isError
              ? "100%"
              : `${Math.max(0, ((currentIndex - 1) / (steps.length - 1)) * 100)}%`,
          }}
        />
      </div>

      {status === "budget_exceeded" && (
        <p className="text-xs text-center font-medium text-[var(--glass-danger)]">
          Monthly budget exceeded — pipeline stopped
        </p>
      )}
    </div>
  );
}
