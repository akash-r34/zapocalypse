interface RefundBadgeProps {
  stage: "full" | "synthesis_only";
  amount: number;
}

export function RefundBadge({ stage, amount }: RefundBadgeProps) {
  const isFull = stage === "full";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isFull
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-amber-500/15 text-amber-400"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {isFull ? "Full refund" : "Partial refund"} — ${amount.toFixed(4)} returned
    </span>
  );
}
