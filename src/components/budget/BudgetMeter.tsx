interface BudgetMeterProps {
  spent: number;
  limit: number;
  refundedTotal?: number;
}

export function BudgetMeter({ spent, limit, refundedTotal }: BudgetMeterProps) {
  const pct = Math.min((spent / limit) * 100, 100);
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  const barColor = isCritical
    ? "var(--glass-danger)"
    : isWarning
    ? "var(--glass-warning)"
    : "var(--glass-accent)";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[var(--glass-text-secondary)]">
          Monthly Budget
        </span>
        <span className={`font-bold ${isCritical ? "text-[var(--glass-danger)]" : "text-[var(--glass-text)]"}`}>
          ${spent.toFixed(2)} / ${limit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden bg-[var(--glass-bg-secondary)]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
      {refundedTotal !== undefined && refundedTotal > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--glass-text-secondary)]">Refunded this month</span>
          <span className="font-medium text-emerald-400">
            +${refundedTotal.toFixed(4)}
          </span>
        </div>
      )}
      {isCritical && (
        <p className="text-xs font-medium text-[var(--glass-danger)]">
          ⚠ Approaching budget limit — pipeline may be paused
        </p>
      )}
    </div>
  );
}
