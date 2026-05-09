---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Hooks/Hook - useHookScores]]"
  - "[[Wiki/Hooks/Hook - useToneCheck]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - Scoring UI

> Three scoring display components: analysis score badge, per-hook score badge, and tone check badge.

## Components

### `ScoreBadge`
- File: `src/components/output/ScoreBadge.tsx`
- Props: `{ projectId: string }`
- Uses `onSnapshot` on `analysis/current` directly (not via `useProject`)
- Shows: circular grade letter, score/10, content classification, strongest asset + biggest gap (expandable via `ExpandableText`)
- Appears: on project detail page after `analyzing` status

### `HookScoreBadge`
- File: `src/components/output/HookScoreBadge.tsx`
- Props: `{ grade: string, compositeScore: number, dimensions?: HookDimensionScores }`
- Shows: inline pill with grade letter + percentage
- Hover tooltip: 4-dimension score breakdown (novelty, emotional_resonance, niche_relevance, shareability)

### `ToneCheckBadge`
- File: `src/components/output/ToneCheckBadge.tsx`
- Props: `{ projectId: string }`
- Hook: `useToneCheck(projectId)`
- Shows: pass/fail indicator, overall match score %, slop flag count
- Appears: on project detail page after `complete` status, above `OutputTabs`

## Cross-References

- Analysis schema: [[Wiki/Data/Schema - Information Gain]]
- Hook score schema: [[Wiki/Data/Schema - Hook Score]]
- Tone check schema: [[Wiki/Data/Schema - Tone Check]]
- Hooks: [[Hook - useHookScores]], [[Hook - useToneCheck]]
