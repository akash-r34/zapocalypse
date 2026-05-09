---
type: overview
domain: ui
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - overview
  - ui
  - components
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/ui_redesign_gemini]]"
---

# UI System Overview

> Zapocalypse's UI is built on a glass morphism design system with progressive disclosure — output tabs appear during synthesis and gradually reveal content as each platform completes.

## Component Hierarchy

```
app/layout.tsx
  └── ThemeProvider (light/dark context)
      └── AppShell (header + main + background)
          ├── Header: logo + BudgetIndicator + ThemeToggle + "New Project" button
          ├── BackgroundElements (floating adaptive orbs)
          └── <children>
              ├── app/page.tsx (Dashboard)
              ├── app/create/page.tsx (Create)
              └── app/project/[id]/page.tsx (Project Detail)
                  ├── ProgressRing (primary progress indicator)
                  ├── AgentProgressPanel (collapsible detail)
                  ├── ScoreBadge (analysis score)
                  ├── OutputTabs (progressive reveal)
                  │   ├── TweetCarousel / LinkedInPreview / etc.
                  │   ├── HookLeaderboard
                  │   ├── FeedbackForm (tone refinement)
                  │   └── C2PABadge (per platform)
                  ├── ToneCheckBadge
                  ├── C2PAManifestViewer
                  ├── CostBreakdown (collapsible)
                  └── RefundBadge
```

## Design System

See [[Wiki/Concepts/Glass Morphism Theme]] for the full CSS variable system. Key classes:
- `glass` — standard frosted card
- `glass-elevated` — raised card with deeper shadow
- All color references via `--glass-*` CSS variables — never hardcoded colors

## Progressive Disclosure

The output UI reveals progressively as the pipeline advances:

| Pipeline status | What appears |
|----------------|-------------|
| `ingesting` | Progress ring only |
| `analyzing` | `ScoreBadge` (once analysis doc appears) |
| `synthesizing` | `OutputTabs` appears; tabs dim/pulse while pending |
| `scoring` | Hook leaderboard tab activates |
| `authenticating` | C2PA badges appear on each tab |
| `complete` | `ToneCheckBadge` + `C2PAManifestViewer` + `CostBreakdown` |

## Pages in This Section

- [[UI System Overview]] (this page)
- [[Component - OutputTabs]]
- [[Component - TweetCarousel]]
- [[Component - LinkedInPreview]]
- [[Component - NewsletterPreview]]
- [[Component - VeoPreview]]
- [[Component - DarkSocialPreview]]
- [[Component - HookLeaderboard]]
- [[Component - FeedbackForm]]
- [[Component - InputForm]]
- [[Component - ProgressRing]]
- [[Component - AgentProgressPanel]]
- [[Component - Native Previews]]
- [[Component - Budget UI]]
- [[Component - Scoring UI]]
- [[Component - C2PA UI]]
- [[Component - Layout]]
- [[Component - UI Kit]]
