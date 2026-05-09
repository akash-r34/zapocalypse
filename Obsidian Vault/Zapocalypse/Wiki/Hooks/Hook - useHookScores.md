---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useHookScores.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - HookLeaderboard]]"
  - "[[Wiki/Data/Schema - Hook Score]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useHookScores

> Subscribes to the hook scoring results document.

## Signature

```typescript
export function useHookScores(projectId: string): {
  data: DocumentData | null;
  loading: boolean;
}
```

## Firestore Path

`projects/{id}/hook_scores/current`

## Used By

[[Wiki/Components/Component - HookLeaderboard]] — renders the ranked hook list with scores and A/B variants.

## Notes

Returns `DocumentData` (untyped) — the consuming component casts to `HookScoreResult` from [[Wiki/Data/Schema - Hook Score]].
