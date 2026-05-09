"use client";

import { useBudget } from "@/src/hooks/useBudget";

export function BudgetIndicator() {
  const { budget, loading } = useBudget();

  if (loading || !budget) return null;

  const pct = Math.min((budget.spent / budget.limit) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 95 || budget.killSwitch;

  const barColor = isCritical
    ? "var(--glass-danger)"
    : isWarning
    ? "var(--glass-warning)"
    : "var(--glass-accent)";

  return (
    <div className="flex items-center gap-3 min-w-0 sm:min-w-[160px]">
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[10px] sm:text-xs">
          <span className="text-[var(--glass-text-tertiary)] hidden sm:inline">Budget</span>
          <span className={`font-semibold ${isCritical ? "text-[var(--glass-danger)]" : "text-[var(--glass-text)]"}`}>
            ${budget.spent.toFixed(2)}
            <span className="text-[var(--glass-text-tertiary)] hidden sm:inline">/{budget.limit}</span>
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-[var(--glass-bg-secondary)]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      {isCritical && (
        <span
          className="text-xs font-bold text-[var(--glass-danger)]"
          title="Budget critical — pipeline may be paused"
        >
          ⚠
        </span>
      )}
    </div>
  );
}
