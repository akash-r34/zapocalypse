---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/HookLeaderboard.tsx
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
  - "[[Wiki/Data/Schema - Hook Score]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - HookLeaderboard

> Ranked list of all hooks across all platforms, sorted by composite score descending. Shows platform pill, grade badge, and expandable A/B variants.

## Props

```typescript
interface HookLeaderboardProps {
  projectId: string;
}
```

## Behavior

Uses [[Hook - useHookScores]]. Sorts `hooks[]` by `composite_score` descending. Each hook row shows:
- Platform pill (color-coded)
- Grade badge (A-F)
- Hook text
- Composite score percentage
- Expandable A/B variants (if `ab_variants` present — only for score ≥ 0.70)

## Gating

Leaderboard tab is only enabled in `OutputTabs` once `ready.includes("twitter")` — requires at least one platform output to score.

## Cross-References

- Hook: [[Hook - useHookScores]]
- Schema: [[Wiki/Data/Schema - Hook Score]]
- Badge: [[Component - Scoring UI]] (`HookScoreBadge`)
