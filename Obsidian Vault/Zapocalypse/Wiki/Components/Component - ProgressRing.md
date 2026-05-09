---
type: entity
entity_kind: component
domain: ui
source_file: src/components/pipeline/ProgressRing.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - pipeline
related:
  - "[[Wiki/Pages/Page - Project Detail]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - ProgressRing

> SVG circular progress ring — the primary pipeline progress indicator on the project detail page.

## Props

```typescript
interface ProgressRingProps {
  status: PipelineStatus;
  errorMessage?: string;
}
```

## SVG Implementation

Circle `r=40`. Stroke dash offset = `circumference * (1 - percent/100)`. CSS transition `0.6s`.

## Status → Percent Map

| Status | Percent |
|--------|---------|
| `idle` | 0% |
| `ingesting` | 12% |
| `analyzing` | 25% |
| `extracting` | 37% |
| `synthesizing` | 50% |
| `scoring` | 62% |
| `authenticating` | 75% |
| `complete` | 100% |
| `error` / `budget_exceeded` | 37% (frozen) |

## Relationship to `AgentProgressPanel`

`ProgressRing` is the primary visible indicator. `AgentProgressPanel` is inside a collapsible `<details>` element — expanded by users who want step-by-step detail.

## Cross-References

- Used by: [[Wiki/Pages/Page - Project Detail]]
- Related: [[Component - AgentProgressPanel]]
