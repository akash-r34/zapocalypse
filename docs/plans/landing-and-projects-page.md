# Plan: Landing Page + All-Projects Page + Dashboard Redesign

## Context

Zapocalypse today has a single-user workspace with no public marketing surface. `/` is a *workspace* Dashboard that leads with a marketing-style hero ("One piece of content. Ten platforms worth of output.") — useful for positioning but out of place in a returning-user dashboard. There is also no dedicated "All Projects" view — the Dashboard shows only the last 10 projects (`useRecentProjects(10)`) with no browse/search/filter.

We are about to ship the project as an MVP publicly, releasing completed phases and layering in later phases over time. That requires:

1. A **Landing page** at `/` with full marketing copy (hero, how-it-works, pricing/FAQ, final CTA) so first-time visitors understand the product before entering the app.
2. A **workspace Dashboard** at `/dashboard` that mirrors OpusClip's pattern — a prominent "new project" bar, a recent-projects grid, and usage/budget context — with no marketing hero.
3. An **All Projects** page at `/projects` with a scrollable/searchable list of every project, since the current 10-item cap isn't enough for real use.

This lands on a new branch `feat/landing-and-projects-page` so that incomplete marketing work does not block fixes on `main`.

## Routing changes

| Route | Before | After |
|---|---|---|
| `/` | Workspace Dashboard | **Landing page** (public marketing) |
| `/dashboard` | — | **Workspace Dashboard** (OpusClip-style) |
| `/projects` | — | **All Projects** (paginated list + search/filter) |
| `/create` | Input form | unchanged |
| `/project/[projectId]` | Detail | unchanged |
| `/project/[projectId]/output/[platform]` | Platform output | unchanged |

`AppShell` (`src/components/layout/AppShell.tsx:19`) currently links the logo to `/`. After this change the logo should link to `/dashboard` when rendered inside the app shell, and the shell header should gain a "Projects" nav link to `/projects`. The Landing page will NOT use `AppShell` — it gets its own marketing-oriented layout (simpler top bar with logo + "Open app" CTA, marketing footer).

## Branch & preparation

1. `git checkout -b feat/landing-and-projects-page`
2. Install the copywriting skill the user referenced: `npx skills add https://github.com/coreyhaines31/marketingskills --skill copywriting` — load it while writing landing copy. (Run this step interactively; skill invocation writes to `~/.claude/skills/`.)

## Files to create

### Landing page — `app/(marketing)/page.tsx` (route group, no AppShell)
- Structure with one component per section, colocated under `src/components/marketing/`:
  - `MarketingHeader.tsx` — minimal: wordmark left, "Open app" link to `/dashboard` right.
  - `Hero.tsx` — headline, subhead, primary CTA "Start for free" → `/create`, secondary "See how it works" anchor. Hero visual uses existing glass morphism + gradient orbs (`BackgroundElements` from `src/components/layout/BackgroundElements.tsx`).
  - `HowItWorks.tsx` — 3-step flow mirroring the 7-agent pipeline compressed to user-facing steps: (1) Paste input, (2) AI runs the pipeline, (3) Ship to 5 platforms. Reference the agents from [[Wiki/Pipeline/Pipeline Overview]] but present in end-user language.
  - `Features.tsx` — grid of 4–6 feature cards: SKO-driven reuse, brand-tone fingerprinting, hook scoring, C2PA authenticity, budget protection, native platform previews. Pull concepts from `Obsidian Vault/Zapocalypse/Wiki/Concepts/`.
  - `Pricing.tsx` — single "MVP — free while in beta" tier card with bullet list of what's included (5 platforms, 10 projects/mo cap derived from $100 monthly budget). Label the paid tiers as "Coming soon" so expectations are set without promising dates.
  - `FAQ.tsx` — accordion with ~6 questions (What do I need? Do you store my content? How does the AI work? What platforms? What happens if the budget runs out? Is my content signed?).
  - `FinalCTA.tsx` — closing CTA band → `/create`.
  - `MarketingFooter.tsx` — copyright, links to GitHub repo, wiki, status.
- Copy is drafted using the `copywriting` skill installed above — follow its headline/benefit/proof/CTA patterns. Keep voice consistent with existing hero ("One piece of content. Ten platforms worth of output.") — that line can move into `Hero.tsx`.

### Workspace Dashboard — `app/dashboard/page.tsx`
- **No marketing hero.** Replace with OpusClip-style "quick start" bar at top: a compact input (URL / paste text) that immediately routes to `/create` with prefilled input OR directly to `runPipeline`. Start by linking to `/create` — reuse `InputForm` logic later (out of scope for this plan).
- Restructure the main grid:
  - Left column: **Recent projects grid** (cards, not rows) — keep the same data from `useRecentProjects(10)` + `useArtifactPreviews`. Each card gets a platform-chip row (Twitter / LinkedIn / Newsletter / Veo / Dark Social) reflecting `useOutputExistence`-style availability, status chip, cost, refunded badge, `createdAt`. "See all projects →" link at the bottom of the grid → `/projects`.
  - Right column: keep existing `BudgetMeter` + `SpendChart` sidebar from the current Dashboard (`app/page.tsx:189-204`). Add a small "This month" stats block (projects completed, total spent, refunds).
- Extract the recent-projects card into `src/components/dashboard/ProjectCard.tsx` so it can be reused by `/projects`.

### All Projects page — `app/projects/page.tsx`
- New hook: `src/hooks/useAllProjects.ts` modeled on `useRecentProjects.ts` (same `ProjectSummary` shape) but without the `limit(count)` clause — add client-side pagination (load first 50, "Load more" button bumps `limit` by 50). Keep the existing `onSnapshot` realtime pattern and silent-fail behavior.
- Page layout: filter bar at top (status filter: all / complete / error / in-progress; source-type filter: url / text / file; text search over `title`), then a grid of `ProjectCard` (shared with Dashboard). Empty and loading states reuse the existing Dashboard skeletons.
- **Do not** change the Firestore query shape — continue ordering by `createdAt desc`. Filters are applied client-side.

## Files to modify

- `app/page.tsx` — replace current Dashboard content with the Landing page. Delete the existing Dashboard code from this file (it moves to `app/dashboard/page.tsx`).
- `src/components/layout/AppShell.tsx:19` — change logo `Link` href to `/dashboard`; add a "Projects" nav link next to "New Project" that routes to `/projects`.
- `app/layout.tsx:17` — update `metadata.description` to match the new marketing positioning (copy sourced from the copywriting skill).

## Files/patterns to reuse (do not reimplement)

- `useRecentProjects` — `src/hooks/useRecentProjects.ts`
- `useArtifactPreviews` — `src/hooks/useArtifactPreviews.ts`
- `useBudget`, `useMonthlyRefunds` — `src/hooks/useBudget.ts`, `src/hooks/useMonthlyRefunds.ts`
- `BudgetMeter`, `SpendChart` — `src/components/budget/`
- `SKOAssetCard` — `src/components/dashboard/SKOAssetCard.tsx` (still rendered for `skoRetained` projects in both Dashboard and All Projects)
- `BackgroundElements`, glass-morphism `--glass-*` tokens — per [[Wiki/Concepts/Glass Morphism Theme]]
- `STATUS_LABEL` / `STATUS_COLOR` maps in `app/page.tsx:14-38` — move these into a small shared module `src/components/dashboard/projectStatus.ts` so Dashboard, `/projects`, and `ProjectCard` can all import them.

## Wiki / memory updates (per CLAUDE.md Rule 1 & 3)

Because this change touches multiple wiki-documented surfaces, do these at the end of implementation (not during planning):

1. Mark stale: `Obsidian Vault/Zapocalypse/Wiki/Pages/Page - Dashboard.md` (source_file now `app/dashboard/page.tsx`), plus `Wiki/Components/UI System Overview.md` and `Wiki/Hooks/Hook - useRecentProjects.md` (list of consumers changes).
2. Append new page stubs — at minimum `Wiki/Pages/Page - Landing.md` and `Wiki/Pages/Page - All Projects.md`.
3. After the user confirms the branch is working, run the Rule 3 memory sync (`.claude/memory/sync-checklist.md`).

## Verification

- `npm run typecheck` — must pass; all new hooks/components typed.
- `npm run lint` — must pass.
- `npm run build` — must succeed (new routes compile).
- `npm run dev`:
  - Visit `/` → see Landing page; Hero CTA routes to `/create`; "Open app" routes to `/dashboard`.
  - Visit `/dashboard` → workspace view, no marketing hero, recent-projects grid renders (or skeleton/empty state), "See all projects" routes to `/projects`.
  - Visit `/projects` → grid renders; filters and text search work against seeded projects; "Load more" extends the list.
  - Visit `/create` and `/project/[id]` → unchanged behavior.
  - AppShell logo now links to `/dashboard`; "Projects" nav link present.
- Responsive check at 375px / 768px / 1280px.
- Accessibility: landing sections have proper heading hierarchy (one `<h1>`, `<h2>` per section), FAQ accordion is keyboard-navigable, all CTAs are `<Link>` or `<button>` with visible focus rings.

## Out of scope (explicit)

- No auth wiring — project remains single-user per CLAUDE.md hard constraint.
- No real "quick start" input on the Dashboard that runs the pipeline inline; Dashboard's input bar links to `/create` for this iteration.
- No Firestore schema changes; no new agent/pipeline work.
- Testimonials/social-proof section deliberately omitted (user selected Hero + Features/How-it-works + Pricing/FAQ/Final CTA only).
