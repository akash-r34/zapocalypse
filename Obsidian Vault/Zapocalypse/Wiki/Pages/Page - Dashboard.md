---
type: entity
entity_kind: page
domain: ui
source_file: app/dashboard/page.tsx
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - page
  - ui
related:
  - "[[Wiki/Components/Component - Layout]]"
  - "[[Wiki/Components/Component - Budget UI]]"
  - "[[Wiki/Hooks/Hook - useBudget]]"
  - "[[Wiki/Hooks/Hook - useRecentProjects]]"
  - "[[Wiki/Hooks/Hook - useArtifactPreviews]]"
  - "[[Wiki/Hooks/Hook - useMonthlyRefunds]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Page - Dashboard

> `app/dashboard/page.tsx` — Workspace home screen (OpusClip-style): quick-start banner, recent projects grid, budget/stats sidebar. Route is `/dashboard`. **NOTE:** Old `app/page.tsx` (which resolved to `/`) has been deleted and replaced by `app/(marketing)/page.tsx` for the public landing page.

## Route

`/dashboard` — `"use client"` component.

## Hooks Used

```typescript
const { budget } = useBudget();
const { projects, loading } = useRecentProjects(10);
const { refundedTotal } = useMonthlyRefunds();
const completedIds = projects.filter((p) => p.status === "complete").map((p) => p.id);
const previews = useArtifactPreviews(completedIds);
```

## Layout

### Quick-Start Banner
- Glass-elevated card with "Create something new" headline + "New Project" pill CTA
- CTA: `<Link href="/create">New Project</Link>` — uses `text-[var(--glass-bg)]` (not `text-white`, theme-safe)

### Main Content Grid
`grid-cols-1` on mobile, `grid-cols-[1fr_300px]` on large screens.

**Left: Recent Projects grid (2-col on sm+)**
- `useRecentProjects(10)` — last 10 projects by `createdAt` descending
- Loading: 4 skeleton pulse cards
- Empty state: "No projects yet — create your first one above"
- Projects rendered via `ProjectCard` component (DRY — also used on `/projects`)
- "See all projects →" link to `/projects` if projects.length > 0

**Right: Sidebar**
- Stats block: Completed count + Spent this month (2-cell grid)
- `BudgetMeter` with `{ spent, limit, refundedTotal }`
- `SpendChart` with all project IDs
- Kill-switch warning banner if `budget.killSwitch === true`

## Status Color Map

Now extracted to `src/components/dashboard/projectStatus.ts`:

```typescript
export const STATUS_COLOR: Record<PipelineStatus, string> = { ... };
export const STATUS_LABEL: Record<PipelineStatus, string> = { ... };
```

## Cross-References

- Layout wrapper: [[Component - Layout]] (`AppShell`)
- Budget components: [[Component - Budget UI]] (`BudgetMeter`, `SpendChart`)
- Data hooks: [[Hook - useRecentProjects]], [[Hook - useBudget]], [[Hook - useArtifactPreviews]], [[Hook - useMonthlyRefunds]]
- Navigation target: [[Wiki/Pages/Page - Project Detail]]
- See also: [[Wiki/Pages/Page - Projects]] (all-projects view at `/projects`)
