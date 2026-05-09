---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useOutputExistence.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - OutputTabs]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useOutputExistence

> Subscribes to the entire outputs subcollection to know which platforms have completed synthesis — used by `OutputTabs` to drive progressive reveal.

## Signature

```typescript
export function useOutputExistence(projectId: string): {
  ready: Platform[];
  loading: boolean;
}
```

## Behavior

`onSnapshot` on the `outputs/` collection. Returns an array of platform IDs that have a document: `["twitter", "linkedin"]` means only those two have finished.

On error or Firestore not configured: returns `[]` silently.

## Used By

[[Wiki/Components/Component - OutputTabs]] — the `ready` array drives which tabs are active vs dimmed/pulsing.

## Firestore Path

`projects/{id}/outputs/` (collection-level snapshot)
