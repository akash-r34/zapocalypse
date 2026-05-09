---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useCopyToClipboard.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - UI Kit]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useCopyToClipboard

> Clipboard state management with automatic 2-second reset. No Firestore dependency.

## Signature

```typescript
export function useCopyToClipboard(): {
  copy: (text: string, id?: string) => void;
  isCopied: (id?: string) => boolean;
}
```

## Behavior

- `copy(text, id?)` — writes to clipboard, sets copied state for `id` (or a default key)
- `isCopied(id?)` — returns `true` for 2 seconds after `copy()` was called with that `id`
- Multiple copy targets can be tracked simultaneously via different `id` values (e.g., per-tweet copy state in a carousel)

## Used By

`CopyButton` component in [[Wiki/Components/Component - UI Kit]] and output preview components.
