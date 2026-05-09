---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/TweetCarousel.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Data/Schema - Twitter Output]]"
  - "[[Wiki/Components/Component - Native Previews]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - TweetCarousel

> Carousel for displaying a Twitter thread. Shows one tweet at a time with navigation, per-tweet copy, and download actions.

## Props

```typescript
interface TweetCarouselProps {
  tweets: Tweet[];
  threadNarrative?: string;
  isNative?: boolean;
  hookScores?: HookScoreLookup;  // optional score overlay per tweet
}
```

## State

```typescript
activeIndex: number  // current carousel position
```

## Actions

- **CopyButton** (always visible) — copies current tweet text
- **OverflowMenu** → DownloadButton — downloads tweet as .txt

## `hookScores` Lookup

When passed, each tweet can show a `HookScoreBadge` overlay if a matching score exists.

## `isNative` Mode

When `isNative: true`, renders inside `NativeTwitterPreview` for a mock Twitter UI appearance.

## Cross-References

- Data schema: [[Wiki/Data/Schema - Twitter Output]]
- Native preview: [[Component - Native Previews]]
- Hook badge: [[Component - Scoring UI]] (`HookScoreBadge`)
