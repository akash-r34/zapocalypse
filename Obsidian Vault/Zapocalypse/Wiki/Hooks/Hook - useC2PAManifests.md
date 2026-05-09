---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useC2PAManifests.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - C2PA UI]]"
  - "[[Wiki/Data/Schema - C2PA Manifest]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useC2PAManifests

> Two hooks in one file: `useC2PAManifest` (single platform) and `useC2PAManifests` (all platforms).

## `useC2PAManifest` — Single Platform

```typescript
export function useC2PAManifest(projectId: string, platform: string): {
  data: DocumentData | null;
  loading: boolean;
}
```

`onSnapshot` on `projects/{id}/c2pa/{platform}`. Used by `C2PABadge` to show per-tab credentials.

## `useC2PAManifests` — All Platforms

```typescript
export function useC2PAManifests(projectId: string): {
  manifests: Record<string, DocumentData>;  // keyed by platform
  loading: boolean;
}
```

`onSnapshot` on the entire `c2pa/` collection. Used by `C2PAManifestViewer` for the "N/M signed" summary + download-all button.

On error: returns `{}` silently.

## Firestore Paths

- Single: `projects/{id}/c2pa/{platform}`
- All: `projects/{id}/c2pa/` (collection, max 5 docs)

## Used By

- `useC2PAManifest` → [[Wiki/Components/Component - C2PA UI]] (`C2PABadge`) — per-tab badge under each platform's output
- `useC2PAManifests` → [[Wiki/Components/Component - C2PA UI]] (`C2PAManifestViewer`) — full provenance panel on complete status
