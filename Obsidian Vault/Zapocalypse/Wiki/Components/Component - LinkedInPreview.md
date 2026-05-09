---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/LinkedInPreview.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Data/Schema - LinkedIn Output]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - LinkedInPreview

> Accordion list of LinkedIn posts with an optional document carousel. Per-post copy, bulk copy, and download actions.

## Props

```typescript
interface LinkedInPreviewProps {
  posts: LinkedInPost[];
  document_carousel?: LinkedInOutput["document_carousel"];
  isNative?: boolean;
  hookScores?: HookScoreLookup;
}
```

## State

```typescript
expandedIndex: number | null  // which accordion item is expanded
```

## Actions

- **CopyButton per post** (always visible) — copies individual post
- **"Copy all"** CopyButton — copies all posts concatenated
- **OverflowMenu** → DownloadButton — downloads as .md

## Document Carousel

When `document_carousel` is present, renders `CarouselPreview` below the post list with slide navigation.

## Cross-References

- Data schema: [[Wiki/Data/Schema - LinkedIn Output]]
- Carousel: `CarouselPreview` component in `src/components/output/CarouselPreview.tsx`
