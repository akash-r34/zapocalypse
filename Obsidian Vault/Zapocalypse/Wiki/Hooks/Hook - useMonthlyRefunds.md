---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useMonthlyRefunds.ts
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

# Hook - useMonthlyRefunds

> Subscribes to the total amount refunded this calendar month across all projects.

## Signature

```typescript
export function useMonthlyRefunds(): {
  refundedTotal: number;
  loading: boolean;
}
```

## Firestore Query

```typescript
query(
  collection(db, "projects"),
  where("refunded", "==", true),
  where("updatedAt", ">=", startOfMonth)  // computed from new Date(), setDate(1), setHours(0,0,0,0)
)
```

Sums `refundedAmount` across all matching documents client-side.

On error (index not yet built): returns `0` silently.

## Firestore Path

`projects/` (collection query with compound filter)

## Used By

[[Wiki/Pages/Page - Dashboard]] — passes `refundedTotal` to `BudgetMeter` so the displayed "remaining budget" accounts for refunds.
