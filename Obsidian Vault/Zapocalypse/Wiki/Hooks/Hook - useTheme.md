---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useTheme.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
  - ui
related:
  - "[[Wiki/Components/Component - Layout]]"
  - "[[Wiki/Concepts/Glass Morphism Theme]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useTheme

> Re-export of the theme context hook from `ThemeProvider`. Provides light/dark mode state and toggle function.

## Signature

```typescript
// src/hooks/useTheme.ts — just a re-export:
export { useTheme } from "@/src/components/layout/ThemeProvider";

// Actual implementation in ThemeProvider.tsx:
export function useTheme(): {
  mode: "light" | "dark";
  toggleMode: () => void;
}
```

## Behavior

- `ThemeProvider` provides `ThemeContext` at the app root
- Persists mode in `localStorage`
- Hydration-safe: starts `"dark"` on server, corrects after mount
- `toggleMode()` flips between light and dark, persists to localStorage

## Used By

- [[Wiki/Components/Component - Layout]] (`ThemeToggle`) — the toggle button in the header
- Any component that needs to read or react to the current theme mode

## See Also

[[Wiki/Concepts/Glass Morphism Theme]] for the full CSS variable system that this hook's mode switch controls.
