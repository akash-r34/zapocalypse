---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useRecentProjects.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Pages/Page - Dashboard]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useRecentProjects

> Subscribes to the N most recent projects ordered by `createdAt` descending.

## Signature

```typescript
export interface ProjectSummary {
  id: string;
  status: PipelineStatus;
  sourceType: "url" | "text" | "file";
  createdAt: Date | null;
  refunded?: boolean;
  refundedAmount?: number;
  skoRetained?: boolean;
  title?: string;
  totalCost?: number;
}

export function useRecentProjects(count = 10): {
  projects: ProjectSummary[];
  loading: boolean;
}
```

## Firestore Query

```typescript
query(
  collection(db, "projects"),
  orderBy("createdAt", "desc"),
  limit(count)
)
```

On error: returns `[]` silently (Firestore not yet configured).

## Used By

[[Wiki/Pages/Page - Dashboard]] — drives the recent projects list. Completed projects with a title → `SKOAssetCard`; others → status card.

## Firestore Path

`projects/` (collection query, ordered + limited)
