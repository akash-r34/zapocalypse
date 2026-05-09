---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useProject.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Pages/Page - Project Detail]]"
  - "[[Wiki/Components/Component - OutputTabs]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useProject

> The primary project state hook. Subscribes to the project document and conditionally fetches outputs + SKO subcollections when the pipeline reaches synthesis or later stages.

## Signature

```typescript
// src/hooks/useProject.ts

export interface ProjectData {
  id: string;
  status: PipelineStatus;
  sourceType: "url" | "text" | "file";
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
  outputs?: Partial<Record<Platform, DocumentData>>;
  outputErrors?: Record<string, string>;
  regenerationCount?: number;
  regenerationState?: Record<string, RegenerationEntry>;
  sko?: SKO;
  refunded?: boolean;
  refundedAmount?: number;
  refundStage?: "full" | "synthesis_only";
  skoRetained?: boolean;
  title?: string;
  sourcePreview?: string;
  totalCost?: number;
}

export function useProject(projectId: string): {
  project: ProjectData | null;
  loading: boolean;
  error: string | null;
}
```

## Behavior

1. `onSnapshot` on `projects/{id}` — fires on every status change
2. When `status` is `synthesizing | scoring | authenticating | complete`: additionally calls `getDocs` on `outputs/` and `sko/` subcollections
3. Subcollection fetches are async inside the snapshot callback — they are NOT separate subscriptions
4. Converts Firestore `Timestamp` → `Date` for `createdAt`, `updatedAt`, regeneration timestamps

## Status-Gated Subcollection Fetching

```typescript
const statusesWithData = ["synthesizing", "scoring", "authenticating", "complete"];
if (statusesWithData.includes(data.status)) {
  const [outputsSnap, skoSnap] = await Promise.all([
    getDocs(collection(db, "projects", projectId, "outputs")),
    getDocs(collection(db, "projects", projectId, "sko")),
  ]);
  // attach to projectData.outputs and projectData.sko
}
```

This ensures `project.sko` and `project.outputs` are populated before components try to render them.

## Used By

- [[Wiki/Pages/Page - Project Detail]] — primary status monitor
- [[Wiki/Components/Component - OutputTabs]] — reads `project.regenerationState`, `project.sko`, `project.outputErrors`
- [[Wiki/Components/Component - FeedbackForm]] — reads `project.sko.brand_tone_fingerprint`

## Firestore Path

`projects/{id}` (primary subscription) + `projects/{id}/outputs/` + `projects/{id}/sko/current` (conditional)
