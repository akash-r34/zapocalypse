---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/VeoPreview.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Data/Schema - Veo Output]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - VeoPreview

> Stateless visualization of a Veo video script. Shows a timeline bar and scene cards with visual descriptions, voiceover, and on-screen text.

## Props

```typescript
interface VeoPreviewProps {
  title: string;
  hookSeconds?: number;
  scenes: VeoScript["scenes"];
  totalDurationSeconds: number;
  aspectRatio: string;
  styleNotes?: string;
}
```

## Actions

- **"Copy JSON"** (always visible) — copies the raw script JSON
- **OverflowMenu** → "Copy voiceover" + DownloadButton

## Note

No actual video is generated. This is a script viewer only. See [[Wiki/Data/Schema - Veo Output]] for the placeholder-only constraint.

## Cross-References

- Data schema: [[Wiki/Data/Schema - Veo Output]]
