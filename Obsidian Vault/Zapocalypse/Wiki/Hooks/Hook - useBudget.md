---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useBudget.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - Budget UI]]"
  - "[[Wiki/Concepts/Budget Protection Layers]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useBudget

> Subscribes to the budget singleton document in real-time. Used by the dashboard and AppShell header.

## Signature

```typescript
export interface BudgetState {
  spent: number;
  limit: number;        // always 100
  killSwitch: boolean;
  budgetMonth: string;  // "YYYY-MM"
}

export function useBudget(): {
  budget: BudgetState | null;
  loading: boolean;
}
```

## Fallback

If Firestore is not configured or on snapshot error, returns `FALLBACK`:
```typescript
const FALLBACK: BudgetState = { spent: 0, limit: 100, killSwitch: false, budgetMonth: "" };
```

This prevents the UI from crashing during local development or on first deploy.

## Firestore Path

`budget/current`

## Used By

- [[Wiki/Components/Component - Budget UI]] (`BudgetMeter`, `BudgetIndicator`) — header and dashboard sidebar
- [[Wiki/Pages/Page - Dashboard]] — passes `budget.killSwitch` to the kill-switch warning banner
