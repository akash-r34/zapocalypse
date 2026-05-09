---
type: entity
entity_kind: component
domain: ui
source_file: src/components/budget/
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - component
  - ui
  - budget
related:
  - "[[Wiki/Hooks/Hook - useBudget]]"
  - "[[Wiki/Hooks/Hook - useProjectCost]]"
  - "[[Wiki/Concepts/Budget Protection Layers]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - Budget UI

> Five budget-related display components. All read from `useBudget()`, `useProjectCost()`, or `useProjectRefunds()`.

## Components

### `BudgetIndicator`
- Location: `src/components/budget/BudgetIndicator.tsx`
- Used in: `AppShell` header
- Shows compact spent/limit (e.g., "$2.34 / $100") with kill-switch warning
- Hook: `useBudget()`

### `BudgetMeter`
- Location: `src/components/budget/BudgetMeter.tsx`
- Props: `{ budget: BudgetState, refundedTotal?: number }`
- Shows visual progress bar; effective spent = `spent - refundedTotal`

### `CostBreakdown`
- Location: `src/components/budget/CostBreakdown.tsx`
- Props: `{ projectId, refundedAmount?: number, refundStage? }`
- Hooks: `useProjectCost(projectId)` + `useProjectRefunds(projectId)`
- Shows per-agent cost table grouped into two sections:

**Initial generation** — entries with no `regenPlatform`. Rows where `agentName` appears in `initialRefundedAgents` (from refund_log `attempt=0, synthesis_failed` entries) are struck-through and emerald-tinted; excluded from Gross.

**Regeneration N · {platform}** — entries tagged with `regenPlatform`. Groups split into attempt buckets: a new attempt starts when the current entry is `refine_tone` or `regenerate_*` AND the previous group already contains a `regenerate_*` entry. Groups where the `platform:attemptIndex` key appears in `regenRefundedKeys` (refund_log `regen_failed` entries) are fully struck-through.

Footer shows Gross → optional "Credits returned" → "You paid" (pipeline-wide refund only).

### `RefundBadge`
- Shown when `project.refunded === true`
- Shows refund amount + stage

### `SpendChart`
- Location: `src/components/budget/SpendChart.tsx`
- Props: `{ projectIds: string[] }`
- `loading` initialises as `projectIds.length > 0` — no synchronous `setState` in the effect body for the empty-array early-return
- Queries each project's `cost_log` subcollection for the current month individually (no collection-group index needed); aggregates cost by day; renders recharts `BarChart`

## Cross-References

- Budget state: [[Hook - useBudget]]
- Per-project cost: [[Hook - useProjectCost]]
- Refunds: `src/hooks/useProjectRefunds.ts`
- Budget system: [[Wiki/Concepts/Budget Protection Layers]]
