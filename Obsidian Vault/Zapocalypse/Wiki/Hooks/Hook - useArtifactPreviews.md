---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useArtifactPreviews.ts
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

# Hook - useArtifactPreviews

> One-shot `getDoc` for dashboard preview cards. Fetches the first tweet, first LinkedIn hook, and newsletter subject for a batch of project IDs.

## Signature

```typescript
export interface ArtifactPreview {
  firstTweet?: string;        // first tweet text, ≤100 chars (truncated with "…")
  linkedInHook?: string;      // first LinkedIn post hook, ≤80 chars
  newsletterSubject?: string; // newsletter subject line (full)
}

export function useArtifactPreviews(projectIds: string[]): Record<string, ArtifactPreview>
```

## Behavior

- Uses `getDoc` (one-shot), NOT `onSnapshot` — previews don't need real-time updates
- `fetchedRef` prevents re-fetching the same set of IDs across re-renders (sorted key deduplication)
- `Promise.allSettled` for all project fetches — one failure doesn't block others
- Returns empty object `{}` initially, fills in as fetches complete

## Deduplication

```typescript
const key = projectIds.slice().sort().join(",");
// Only fetches if fetchedRef.current !== key
```

## Used By

[[Wiki/Pages/Page - Dashboard]] — shows artifact preview cards for completed projects in the recent list.

## Firestore Paths

- `projects/{id}/outputs/twitter` → `tweets[0].text`
- `projects/{id}/outputs/linkedin` → `posts[0].hook`
- `projects/{id}/outputs/newsletter` → `subject_line`
