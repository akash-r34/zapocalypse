---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useProjectRefunds.ts
created: 2026-04-14
updated: 2026-04-14
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

# Hook - useProjectRefunds

> Subscribes to the per-project refund log and provides structured refund data for `CostBreakdown`.

## Signature

```typescript
export interface RefundLogEntry {
  id: string;
  platform: string;
  amount: number;
  reason: "synthesis_failed" | "regen_failed";
  attempt: number;       // 0 = synthesis failure; N = regen attempt (1-based)
  agentNames: string[];
  createdAt: Date | null;
}

export function useProjectRefunds(projectId: string): {
  refunds: RefundLogEntry[];
  totalRefunded: number;
  loading: boolean;
}
```

## Firestore Query

`projects/{id}/refund_log/` ordered by `createdAt` ascending.

## How `CostBreakdown` Uses This

**Initial generation strikethrough** — refunds where `attempt === 0 && reason === "synthesis_failed"` build `initialRefundedAgents` (a Set of `agentName` strings). Any initial-generation row matching one of these names is struck-through.

**Regen group strikethrough** — refunds where `attempt > 0 && reason === "regen_failed"` build `regenRefundedKeys` (a Set of `"platform:attemptIndex"` strings). Any regen group whose `platform:attemptIndex` is in this set is fully struck-through.

## Attempt Number Contract

`attempt` in refund_log is written by `processRegenRefund` as: `(count of prior regenerate_{platform} cost_log entries before regenStartTimeMs) + 1`. This directly matches `CostBreakdown`'s `attemptIndex = idx + 1` for the corresponding cost group.

## Related

- [[Wiki/Concepts/Budget Protection Layers]] — refund system architecture
- [[Wiki/Components/Component - Budget UI]] — `CostBreakdown` consumer
- [[Wiki/Hooks/Hook - useProjectCost]] — provides `costLog` used alongside refunds
