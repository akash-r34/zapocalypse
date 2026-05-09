---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/DarkSocialPreview.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Data/Schema - Dark Social Output]]"
  - "[[Wiki/Components/Component - Native Previews]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - DarkSocialPreview

> Three-mode display for Dark Social content: native Slack, native Discord, or default (both + shareable quote card).

## Props

```typescript
interface DarkSocialPreviewProps {
  data: DarkSocialSnippet;
  nativePlatform?: "slack" | "discord" | null;
}
```

## Render Modes

| `nativePlatform` | What renders |
|-----------------|-------------|
| `"slack"` | `NativeSlackPreview` only |
| `"discord"` | `NativeDiscordPreview` only |
| `null` / `undefined` | Slack card + Discord card + shareable quote card |

One copy action per section — no OverflowMenu needed (simpler than other platforms).

## Cross-References

- Data schema: [[Wiki/Data/Schema - Dark Social Output]]
- Native previews: [[Component - Native Previews]]
