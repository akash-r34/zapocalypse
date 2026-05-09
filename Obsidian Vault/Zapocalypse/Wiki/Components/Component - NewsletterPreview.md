---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/NewsletterPreview.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Data/Schema - Newsletter Output]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - NewsletterPreview

> Stateless display of a newsletter with subject, preview text, sections, CTA, and read time estimate.

## Props

```typescript
interface NewsletterPreviewProps {
  subjectLine: string;
  previewText?: string;
  sections: Array<{ heading: string; content: string }>;
  cta?: { text: string; context: string };
  estimatedReadTimeMinutes?: number;
  isNative?: boolean;
}
```

## Actions

- **"Copy text"** (always visible) — copies full newsletter as plain text
- **OverflowMenu** → "Copy markdown" + DownloadButton

## Cross-References

- Data schema: [[Wiki/Data/Schema - Newsletter Output]]
