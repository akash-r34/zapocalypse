---
type: index
updated: 2026-04-11
tags:
  - index
  - meta
---

# Zapocalypse LLM Wiki

> **Single-user vertical AI content factory.** Next.js 16.2.1 + Gemini AI.
> One input (URL / text / file) → 5 platform outputs via a 7-agent pipeline.
> **Version:** V3.5 | **Status:** Phase 5 complete, Phase 6 next

---

## Semantic Lookup

> Fast navigation for LLMs: jump directly from intent to the right wiki page.

| Question / Intent | Go to |
|-------------------|-------|
| How does the pipeline work end-to-end? | [[Wiki/Pipeline/Pipeline Overview]] |
| What agents exist and what do they do? | [[Wiki/Pipeline/Pipeline Overview]] (agent table) |
| What is the SKO and what fields does it have? | [[Wiki/Data/Schema - SKO]] + [[Wiki/Architecture/Hub and Spoke via SKO]] |
| How does budget tracking / cost protection work? | [[Wiki/Concepts/Budget Protection Layers]] |
| How is tone fingerprinting implemented? | [[Wiki/Concepts/Additive Tone Fingerprinting]] |
| What is C2PA signing and how does it work? | [[Wiki/Concepts/C2PA Signing]] |
| What are all the Firestore collection paths? | [[Wiki/Data/Data Model Overview]] |
| How are Gemini API calls structured? | [[Wiki/Data/Gemini Client]] |
| What CSS tokens / glass morphism vars exist? | [[Wiki/Concepts/Glass Morphism Theme]] |
| What is the current project phase and next work? | [[Wiki/Project/Current Status]] |
| What phases are coming next? | [[Wiki/Project/Roadmap]] |
| How is the app deployed to Firebase / Cloud Run? | [[Wiki/Infrastructure/Deployment]] |
| What env vars are required? | [[Wiki/Infrastructure/Environment Variables]] |
| How does auth work? Who can sign in? How are API routes protected? | [[Wiki/Infrastructure/Auth & Firestore Security]] |
| How does the fire-and-forget async pattern work? | [[Wiki/Architecture/Fire and Forget Pattern]] |
| What were the key architectural decisions? | [[Wiki/Decisions/Decisions - Pipeline Architecture]] |
| How do Claude and Gemini share context? | [[Wiki/Architecture/Dual Agent Collaboration]] |
| How do I delete old project data from Firestore? | [[Wiki/Infrastructure/Maintenance Scripts]] |

---

## Start Here

| Quick links | |
|---|---|
| [[Wiki/Project/Current Status]] | Active branch, GCP links, next work |
| [[Wiki/Project/Phase History]] | Full build history V1 → V3.5 |
| [[Wiki/Project/Roadmap]] | Phases 6–8 pending |
| [[Wiki/Architecture/Architecture Overview]] | Stack, system design, key principles |
| [[Wiki/Pipeline/Pipeline Overview]] | State machine, agent sequence, fault tolerance |

---

## Architecture

- [[Wiki/Architecture/Architecture Overview]] — Stack, system diagram, key principles
- [[Wiki/Architecture/Tech Stack]] — Next.js 16.2.1, React 19, Tailwind v4, Zod v4, Firebase, exact versions
- [[Wiki/Architecture/Hub and Spoke via SKO]] — SKO as the central data artifact connecting all agents
- [[Wiki/Architecture/Fire and Forget Pattern]] — 202 Accepted, async orchestration, state machine
- [[Wiki/Architecture/Dual Agent Collaboration]] — Claude + Gemini shared memory, handover protocol

---

## Pipeline

- [[Wiki/Pipeline/Pipeline Overview]] — State machine, agent sequence, fault tolerance patterns
- [[Wiki/Pipeline/Orchestrator]] — `runPipeline()`, state transitions, error handling, refund logic
- [[Wiki/Pipeline/Agent - Ingest]] — `runIngestionAgent()`, input validation, URL extraction
- [[Wiki/Pipeline/Agent - Analyst]] — `runAnalysisAgent()`, 5-signal scoring, NEUTRAL fallback
- [[Wiki/Pipeline/Agent - Extract]] — `runExtractionAgent()`, SKO production, analysis-weighted prompting
- [[Wiki/Pipeline/Agent - Synthesize]] — `runSynthesisAgent()`, 5 platforms, `Promise.allSettled`
- [[Wiki/Pipeline/Agent - Hook Scorer]] — `runHookScoringAgent()`, 4-dimension composite, A/B variants
- [[Wiki/Pipeline/Agent - Authenticator]] — `runAuthenticatorAgent()`, tone check + C2PA signing
- [[Wiki/Pipeline/Agent - Refine Tone]] — `runRefineToneAgent()`, additive fingerprint strengthening

---

## Data Model

- [[Wiki/Data/Data Model Overview]] — All Firestore collections, relationships, access patterns
- [[Wiki/Data/Gemini Client]] — `generateStructured()`, `generateText()`, retry, cost tracking
- [[Wiki/Data/Firestore Helpers]] — All typed helper functions from `helpers.ts`

### Zod Schemas

- [[Wiki/Data/Schema - SKO]] — `SKOSchema`: core_thesis, audience_persona, viral_hooks, semantic_chunks, brand_tone_fingerprint
- [[Wiki/Data/Schema - Ingested Content]] — `IngestedContentSchema`
- [[Wiki/Data/Schema - Information Gain]] — `InformationGainScoreSchema`, 5 signals, grade A-F
- [[Wiki/Data/Schema - Twitter Output]] — `TwitterOutputSchema`, thread structure
- [[Wiki/Data/Schema - LinkedIn Output]] — `LinkedInOutputSchema`, carousel format
- [[Wiki/Data/Schema - Newsletter Output]] — `NewsletterOutputSchema`
- [[Wiki/Data/Schema - Veo Output]] — `VeoOutputSchema`, JSON script structure
- [[Wiki/Data/Schema - Dark Social Output]] — `DarkSocialOutputSchema`
- [[Wiki/Data/Schema - Hook Score]] — `HookScoreResultSchema`, 4 dimensions, A/B variants
- [[Wiki/Data/Schema - Tone Check]] — `ToneCheckResultSchema`, slop flags
- [[Wiki/Data/Schema - C2PA Manifest]] — `C2PAManifestSchema`, `SignedC2PAManifest`

---

## React Hooks

- [[Wiki/Hooks/Hooks Overview]] — Architecture: all Firestore `onSnapshot`-based, real-time
- [[Wiki/Hooks/Hook - useProject]] — Project doc + subcollection polling
- [[Wiki/Hooks/Hook - useOutput]] — Single platform output subscription
- [[Wiki/Hooks/Hook - useOutputExistence]] — Which platforms have output ready
- [[Wiki/Hooks/Hook - useArtifactPreviews]] — Dashboard preview cards (one-shot)
- [[Wiki/Hooks/Hook - useHookScores]] — Hook scoring results subscription
- [[Wiki/Hooks/Hook - useToneCheck]] — Tone check results subscription
- [[Wiki/Hooks/Hook - useBudget]] — Budget state subscription
- [[Wiki/Hooks/Hook - useRecentProjects]] — Dashboard recent projects list
- [[Wiki/Hooks/Hook - useCopyToClipboard]] — Clipboard state with 2s auto-clear
- [[Wiki/Hooks/Hook - useProjectCost]] — Per-project cost log subscription
- [[Wiki/Hooks/Hook - useMonthlyRefunds]] — Monthly refund total subscription
- [[Wiki/Hooks/Hook - useC2PAManifests]] — `useC2PAManifest(projectId, platform)` + `useC2PAManifests(projectId)` — both in same file
- [[Wiki/Hooks/Hook - useSourceContent]] — Source content retrieval
- [[Wiki/Hooks/Hook - useTheme]] — Light/dark theme context

---

## UI Components

- [[Wiki/Components/UI System Overview]] — Component hierarchy, design system, progressive disclosure
- [[Wiki/Components/Component - OutputTabs]] — Tab switching, progressive reveal during synthesis
- [[Wiki/Components/Component - TweetCarousel]] — 10-tweet carousel with native preview
- [[Wiki/Components/Component - LinkedInPreview]] — LinkedIn posts + carousel preview
- [[Wiki/Components/Component - NewsletterPreview]] — Newsletter sections + CTA
- [[Wiki/Components/Component - VeoPreview]] — Veo JSON script visualization
- [[Wiki/Components/Component - DarkSocialPreview]] — Slack/Discord native previews
- [[Wiki/Components/Component - HookLeaderboard]] — Hook score ranking with A/B variants
- [[Wiki/Components/Component - FeedbackForm]] — Tone refinement UI with dynamic trait pills
- [[Wiki/Components/Component - InputForm]] — URL/text/file input with validation
- [[Wiki/Components/Component - ProgressRing]] — SVG ring progress indicator
- [[Wiki/Components/Component - AgentProgressPanel]] — Agent step list with status states
- [[Wiki/Components/Component - Native Previews]] — 5 native preview components (Twitter, LinkedIn, Newsletter, Slack, Discord)
- [[Wiki/Components/Component - Budget UI]] — BudgetIndicator, BudgetMeter, CostBreakdown, RefundBadge, SpendChart
- [[Wiki/Components/Component - Scoring UI]] — ScoreBadge, HookScoreBadge, ToneCheckBadge
- [[Wiki/Components/Component - C2PA UI]] — C2PABadge, C2PAManifestViewer
- [[Wiki/Components/Component - Layout]] — AppShell, BackgroundElements, ThemeProvider, ThemeToggle
- [[Wiki/Components/Component - UI Kit]] — Button, Card, Chip, ErrorBoundary, OverflowMenu, ProgressIndicator, TextField

---

## App Pages & API Routes

- [[Wiki/Pages/Page - Dashboard]] — `app/page.tsx`, recent projects, budget sidebar
- [[Wiki/Pages/Page - Create]] — `app/create/page.tsx`, input form
- [[Wiki/Pages/Page - Project Detail]] — `app/project/[projectId]/page.tsx`, live progress + output tabs
- [[Wiki/Pages/API Routes]] — `/api/pipeline/run`, `/api/pipeline/regenerate`

---

## Concepts

- [[Wiki/Concepts/Glass Morphism Theme]] — `--glass-*` CSS vars, dark/light modes, background orbs, motion presets
- [[Wiki/Concepts/Additive Tone Fingerprinting]] — Positive markers vs slop filters, reflexion loop
- [[Wiki/Concepts/Budget Protection Layers]] — $100/mo cap, kill-switch, per-call tracking, tiered refunds, pre-flight
- [[Wiki/Concepts/C2PA Signing]] — ECDSA P-256, key generation, metadata-only fallback, provenance chain

---

## Infrastructure

- [[Wiki/Infrastructure/Deployment]] — Firebase App Hosting, Cloud Run, `apphosting.yaml`, scale-to-zero
- [[Wiki/Infrastructure/Environment Variables]] — All env vars, where they're used, defaults
- [[Wiki/Infrastructure/API Endpoints]] — Route handlers, request/response shapes, status codes
- [[Wiki/Infrastructure/Auth & Firestore Security]] — Single-user Google Auth, AuthProvider/AuthGate, requireAllowedUser, authedFetch, Firestore rules
- [[Wiki/Infrastructure/Maintenance Scripts]] — `purge-old-projects.mjs`: delete project trees before current month

---

## Architectural Decisions

- [[Wiki/Decisions/Decisions - AI and Model Selection]] — Google AI vs Vertex, SDK choice, Zod v4, model pricing
- [[Wiki/Decisions/Decisions - Pipeline Architecture]] — Agents as imports, fire-and-forget, fault tolerance, SKO immutability
- [[Wiki/Decisions/Decisions - V3 Expert Critique]] — Additive fingerprinting, tiered refunds, pre-flight, phase ordering

---

## Project Status

- [[Wiki/Project/Current Status]] — Version (V3.5), active branch, GCP/GitHub links, next work
- [[Wiki/Project/Phase History]] — V1 Phases 0–6, V2.0, V3 Phases 1–5 with dates and file lists
- [[Wiki/Project/Roadmap]] — Phases 6–8 pending, known constraints, future directions

---

## Sources (Immutable Originals)

> These files are synced from the repo. Never edit them here — they are overwritten by `sync-vault.sh`.

- `Sources/Memory/` — `.claude/memory/` snapshots (codebase_architecture, decisions, phase_status, project_context, etc.)
- `Sources/Rules/` — `.claude/rules/` snapshots (ai-gemini, firestore-schema, pipeline-safety)
- `Sources/Docs/` — Root docs (CLAUDE.md, GEMINI.md, AGENTS.md) + src/docs (V3 Development Plan, V3 Critique, V3 Market Research)

---

## Meta

- [[schema]] — LLM maintenance instructions (read this to understand the wiki)
- [[log]] — Chronological activity log (ingests, queries, lints)
- [[Wiki/_Health]] — Live health dashboard: stale pages, orphans, schema violations
- `Wiki/_Queries/` — Pre-baked Dataview lookups (by domain, recently updated)
- `Templates/` — Templater page templates

---

```dataview
TABLE updated, status FROM "Wiki"
WHERE type = "entity" AND status = "stale"
SORT updated ASC
```
*Dataview: shows stale entity pages needing update (requires Dataview plugin)*
