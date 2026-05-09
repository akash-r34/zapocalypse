---
type: entity
entity_kind: page
domain: ui
source_file: app/project/[projectId]/page.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - page
  - ui
related:
  - "[[Wiki/Components/Component - Layout]]"
  - "[[Wiki/Components/Component - OutputTabs]]"
  - "[[Wiki/Components/Component - Scoring UI]]"
  - "[[Wiki/Components/Component - C2PA UI]]"
  - "[[Wiki/Components/Component - Budget UI]]"
  - "[[Wiki/Hooks/Hook - useProject]]"
  - "[[Wiki/Hooks/Hook - useSourceContent]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Page - Project Detail

> `app/project/[projectId]/page.tsx` — Live project view. Shows pipeline progress, scores, output tabs. Updates in real time via Firestore `onSnapshot`.

## Route

`/project/[projectId]` — `"use client"` component. Uses React 19 `use()` to unwrap the async `params` Promise.

```typescript
interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const { project, loading, error } = useProject(projectId);
  ...
}
```

## Section Render Order

All sections are conditionally rendered based on `project.status`:

### 1. Header (always shown)
- Project ID in `font-mono` (small, tertiary text)
- Title (`project.title`) if available, otherwise status label
- `RefundBadge` if `project.refunded === true`

**Status label logic:**
```typescript
const statusLabel = loading
  ? "Processing your content"
  : error
    ? "Project Error"
    : project?.status === "complete"
      ? "Content Ready"
      : ["synthesizing", "scoring", "authenticating"].includes(project?.status ?? "")
        ? "Generating outputs…"
        : "Processing your content";
```

### 2. Source Preview (shown when `project.sourcePreview` exists)
`SourcePreviewSection` — a lazy `<details>` component:
- Collapsed: "Source content" label
- Expanded: shows first 199 chars of `project.sourcePreview`
- "Show full content" button triggers `useSourceContent(projectId)` to fetch the full `sources/{projectId}` document

### 3. SKO-Retained Warning (shown when `project.skoRetained && status === "error"`)
Amber-tinted info box: "Source material saved — synthesis failed on one or more platforms. You can regenerate."

### 4. Error State (non-SKO errors)
Red-bordered card showing `error` message.

### 5. Pipeline Progress (shown when `status !== "complete"`)
- `ProgressRing` — circular SVG progress based on status
- `<details>` with `AgentProgressPanel` (shows per-agent step completion)

### 6. Loading Skeleton (shown while `loading === true`)
Pulse animated placeholder card.

### 7. Cost Breakdown (shown when `status !== "idle"`)
`CostBreakdown` with computed total refunds:
```typescript
const synthesisRefund = project.refundedAmount ?? 0;
const regenRefund = Object.values(project.regenerationState ?? {}).reduce(
  (s, e) => s + (e.status === "error" && e.refundedAmount ? e.refundedAmount : 0),
  0
);
const totalRefunded = synthesisRefund + regenRefund;
```

### 8. Score Badge (shown when `status !== "idle"`)
`ScoreBadge` — subscribes independently to `analysis/current`. Appears once analysis is written (after `analyzing` state).

### 9. Output Area (shown when status is `synthesizing | scoring | authenticating | complete`)
- `ToneCheckBadge` — only when `complete`
- `C2PAManifestViewer` — only when `complete`
- `OutputTabs` — shown progressively starting at `synthesizing`; individual tabs appear as each platform's Firestore doc is written

## Cross-References

- Output tabs: [[Component - OutputTabs]]
- Progress: [[Wiki/Components/Component - ProgressRing]], [[Wiki/Components/Component - AgentProgressPanel]]
- Scores: [[Component - Scoring UI]] (`ScoreBadge`, `ToneCheckBadge`)
- Provenance: [[Component - C2PA UI]] (`C2PAManifestViewer`)
- Budget: [[Component - Budget UI]] (`CostBreakdown`, `RefundBadge`)
- Primary hook: [[Hook - useProject]]
- Source content: [[Hook - useSourceContent]]
- Layout: [[Component - Layout]] (`AppShell`)
