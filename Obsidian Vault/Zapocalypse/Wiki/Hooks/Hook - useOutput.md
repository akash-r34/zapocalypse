---
type: entity
entity_kind: hook
domain: hooks
source_file: src/hooks/useOutput.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - hook
  - hooks
related:
  - "[[Wiki/Components/Component - OutputTabs]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hook - useOutput

> Subscribes to a single platform's output document in real-time.

## Signature

```typescript
export function useOutput(projectId: string, platform: Platform): {
  data: DocumentData | null;
  loading: boolean;
  error: string | null;
}
```

`Platform = "twitter" | "linkedin" | "newsletter" | "veo" | "dark_social"`

## Behavior

`onSnapshot` on `projects/{id}/outputs/{platform}`. Returns `null` if the doc doesn't exist yet (platform still synthesizing).

## Firestore Path

`projects/{id}/outputs/{platform}`

## Used By

Individual platform preview components (e.g., [[Wiki/Components/Component - TweetCarousel]], [[Wiki/Components/Component - LinkedInPreview]]) when they need platform-specific real-time data independently of `useProject`.
