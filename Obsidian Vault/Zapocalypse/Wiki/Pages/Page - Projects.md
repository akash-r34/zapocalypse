---
type: entity
entity_kind: page
domain: ui
source_file: app/projects/page.tsx
created: 2026-04-14
updated: 2026-04-14
status: current
tags:
  - entity
  - page
  - ui
related:
  - "[[Wiki/Components/Component - Layout]]"
  - "[[Wiki/Hooks/Hook - useRecentProjects]]"
  - "[[Wiki/Hooks/Hook - useArtifactPreviews]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Page - Projects

> `app/projects/page.tsx` — All-projects view with client-side filtering and infinite-scroll-style load more. Route is `/projects`.

## Route

`/projects` — `"use client"` component.

## Hooks Used

```typescript
const { projects, loading, loadMore } = useAllProjects(50);
const previews = useArtifactPreviews(completedIds);
```

## Layout

### Filter Bar
- Text search (title or ID)
- Status filter dropdown (all / complete / error / budget_exceeded / idle)
- Source type filter dropdown (all / url / text / file)
- Implemented as client-side filter over the full project list

### Project Grid
- 3-col on `xl`, 2-col on `md`, 1-col on mobile
- Renders `ProjectCard` (same component as dashboard)
- Empty state when filters match nothing

### Load More
- Shown when `projects.length >= 50`
- `loadMore()` increments the Firestore limit by 50; triggers new `onSnapshot`

## Cross-References

- `useAllProjects` hook: [[Wiki/Hooks/Hooks Overview]]
- Project card component: [[Wiki/Components/Component - Layout]]
- Dashboard (recent 10): [[Wiki/Pages/Page - Dashboard]]
