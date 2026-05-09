---
type: entity
entity_kind: page
domain: marketing
source_file: app/(marketing)/page.tsx
created: 2026-04-14
updated: 2026-04-14
status: current
tags:
  - entity
  - page
  - marketing
related:
  - "[[Wiki/Project/Current Status]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Page - Landing

> `app/(marketing)/page.tsx` — Public marketing landing page at `/`. Uses the `(marketing)` route group to avoid collision with the workspace dashboard.

## Route

`/` — Server component (no "use client"). Layout provided by `app/(marketing)/layout.tsx` (not `AppShell`).

## Section Composition

| Component | Copy Headline |
|-----------|--------------|
| `Hero` | "Stop generating volume. Start generating influence." |
| `Problem` | "The era of generic 'AI Slop' is over." |
| `Features` | "A system built for your brand's DNA." |
| `Output` | "One Input. An Entire Week of Strategy." |
| `Pricing` | "Honest billing that protects your wallet." |
| `FAQ` | "FAQ" — 4 objection-handling items |

## Marketing Layout

`app/(marketing)/layout.tsx` provides:
- Sticky header: logo + "Built for the creator economy" wordmark + ThemeToggle + "Open app" CTA → `/dashboard`
- Footer: copyright + GitHub, Workspace, Status links
- `BackgroundElements` for ambient orbs (same as AppShell)
- `main` max-width `7xl`, full-width footer

## Copywriting Notes

Written with the `copywriting` skill. Key principles applied:
- **Benefits over features**: leads with outcome ("influence") not process ("pipeline")
- **Specificity**: "52% of consumers reduce engagement" not "generic AI penalized"
- **Objection handling**: FAQ addresses Credit Trap, YouTube support (coming soon), Not My Voice, C2PA proof

## Cross-References

- Layout: `app/(marketing)/layout.tsx`
- Dashboard (post-login): [[Wiki/Pages/Page - Dashboard]]
- Design system: [[Wiki/Concepts/Glass Morphism Theme]]
