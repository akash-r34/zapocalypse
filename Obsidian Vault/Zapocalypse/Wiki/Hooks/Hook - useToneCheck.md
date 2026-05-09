---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useToneCheck.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - Scoring UI]]"
  - "[[Wiki/Data/Schema - Tone Check]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useToneCheck

> Subscribes to the tone check results document.

## Signature

```typescript
export function useToneCheck(projectId: string): {
  data: DocumentData | null;
  loading: boolean;
}
```

## Firestore Path

`projects/{id}/tone_check/current`

## Used By

[[Wiki/Components/Component - Scoring UI]] (`ToneCheckBadge`) — shows overall tone match score, pass/fail, and AI slop flag count.
