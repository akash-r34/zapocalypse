---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useProjectCost.ts
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - Budget UI]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useProjectCost

> Subscribes to the per-project cost log and computes total cost in real-time.

## Signature

```typescript
export interface CostLogEntry {
  agentName: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  costUsd: number;
  timestamp: Date | null;
  regenPlatform?: string;  // set for all costs during a regen cascade; absent for initial pipeline
}

export function useProjectCost(projectId: string): {
  costLog: CostLogEntry[];
  totalCost: number;
  loading: boolean;
  error: string | null;
}
```

## Firestore Query

`projects/{id}/cost_log/` ordered by `timestamp` ascending.

`totalCost` is `costLog.reduce((sum, e) => sum + e.costUsd, 0)`.

## `regenPlatform` Field

Entries written during a regen cascade (refine_tone, regenerate_*, authenticate, score_hooks) carry `regenPlatform: "twitter"` etc. `CostBreakdown` uses this field to group entries into "Regeneration N · {platform}" sections. Never infer platform from agent name — agent names like "authenticate" appear in both the initial pipeline and the regen cascade.

## Used By

[[Wiki/Components/Component - Budget UI]] (`CostBreakdown`)

## Related Hook

`src/hooks/useProjectRefunds.ts` — subscribes to `projects/{id}/refund_log` and provides which entries are struck-through in `CostBreakdown`.
