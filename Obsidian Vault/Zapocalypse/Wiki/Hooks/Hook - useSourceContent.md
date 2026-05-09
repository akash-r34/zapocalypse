---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useSourceContent.ts
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - hook
  - hooks
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useSourceContent

> On-demand one-shot fetch of the full raw source content for a project. Pass `null` to skip the fetch.

## Signature

```typescript
export function useSourceContent(projectId: string | null): {
  rawContent: string | null;
  loading: boolean;
}
```

## Behavior

- Accepts `null` as `projectId` — when null, does nothing (`loading` initialises as `false`)
- When `projectId` is non-null, `loading` initialises as `true` (`useState(!!projectId)`) — no synchronous `setState` call inside the effect body
- Uses `getDoc` (one-shot), NOT `onSnapshot`
- Non-fatal: errors are caught and ignored; user just won't see full content
- Reads `rawContent` field from the source subcollection doc

## Firestore Path

`projects/{id}/source/current`

## Notes

This hook provides the full raw content (stored by `writeSourceContent` after ingestion) for display purposes. It's only fetched when explicitly triggered — passing `null` until the user requests the full source view.
