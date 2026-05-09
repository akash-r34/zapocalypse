---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/native/
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/ui_redesign_gemini]]"
---

# Component - Native Previews

> Five components that mimic the native UI of each platform. Built from reference screenshots in `Native previews/`.

## Components

| Component | File | Mimics |
|-----------|------|--------|
| `NativeTwitterPreview` | `native/NativeTwitterPreview.tsx` | Twitter/X tweet card |
| `NativeLinkedInPreview` | `native/NativeLinkedInPreview.tsx` | LinkedIn post card |
| `NativeNewsletterPreview` | `native/NativeNewsletterPreview.tsx` | Email client preview |
| `NativeSlackPreview` | `native/NativeSlackPreview.tsx` | Slack message |
| `NativeDiscordPreview` | `native/NativeDiscordPreview.tsx` | Discord embed |

## Design Philosophy

These are pixel-close replications of real platform UIs — not generic cards. They help users visualize how content will actually look when published.

**Warning (from Gemini handover notes):** Do NOT alter CSS opacities on glass panels in native previews — they are precisely calibrated. Do NOT remove these components — they are the primary value-add of V3.3.

## `RegenerationIndicator` / `RegenerationBadge`

Also in `src/components/output/RegenerationIndicator.tsx`:

```typescript
// Spinner + "Regenerating [Platform]..." label
function RegenerationIndicator({ platform?: string })

// "Regenerated (v2)" pill badge
function RegenerationBadge()
```

These are rendered by [[Component - OutputTabs]] on `regenerationState[platform].status === "processing"` or on regenerated outputs.

## Cross-References

- Rendered by: [[Component - TweetCarousel]], [[Component - LinkedInPreview]], [[Component - DarkSocialPreview]], [[Component - OutputTabs]]
