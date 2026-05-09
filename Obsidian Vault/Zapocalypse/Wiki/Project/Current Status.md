---
type: status
domain: architecture
source_file: .claude/memory/phase_status.md
created: 2026-04-11
updated: 2026-04-18
status: current
tags:
  - status
  - project
related:
  - "[[Wiki/Project/Phase History]]"
  - "[[Wiki/Project/Roadmap]]"
sources:
  - "[[Sources/Memory/phase_status]]"
  - "[[Sources/Memory/project_state]]"
---

# Current Status

> Snapshot as of 2026-04-18. Update this page after each phase merge.

## Version

**V3.9.1** — Firebase Auth + Firestore rules locked down, on `main` (2026-04-18).

## Active Branch

`main` — all V3 phases + landing page + mobile optimizations + single-user auth merged.

## Live URL

`https://zapocalypse--your-firebase-project-id.us-central1.hosted.app`

## GCP Resources

| Resource | Value |
|---------|-------|
| GCP Project | `your-firebase-project-id` |
| Firestore | Native mode, `us-central1` |
| App Hosting | Firebase App Hosting on Cloud Run |
| Gemini Model | `gemini-2.5-flash` |
| Monthly Budget | $100 (kill-switch at $95) |

## Pipeline State Machine (current)

```
idle → ingesting → analyzing → extracting → synthesizing → scoring → authenticating → complete | error | budget_exceeded
```

8 active states. `analyzing` and `authenticating` are non-fatal — failures produce `NEUTRAL_ANALYSIS_SCORE` and missing C2PA manifests respectively, then continue.

## What's Complete

- ✅ 7-agent pipeline (ingest, analyze, extract, synthesize×5, score-hooks, authenticate)
- ✅ Real-time Firestore → React UI via `onSnapshot`
- ✅ Additive tone fingerprinting + reflexion loop (V3 Phase 2)
- ✅ Hook virality scoring + leaderboard (V3 Phase 1)
- ✅ Progressive disclosure UI — outputs appear tab-by-tab as synthesis completes (V3 Phase 3)
- ✅ Tiered refunds + pre-flight validation (V3 Phase 4)
- ✅ ECDSA P-256 C2PA cryptographic signing (V3 Phase 5)
- ✅ Glass morphism design system (`--glass-*` CSS vars, CSS spring animations)
- ✅ 4-layer budget protection ($100 limit, kill-switch, per-call tracking, pre-flight)
- ✅ Coworking Alignment (Antigravity/Gemini parity, emulated hooks, mandatory sync)
- ✅ Landing page at `/` (marketing route group `(marketing)`) — Hero, Problem, Features, Output, Pricing, FAQ
- ✅ Workspace dashboard at `/dashboard` — OpusClip-style, 2-col grid with `ProjectCard`, stats sidebar
- ✅ All-projects view at `/projects` — client-side filter (search/status/source), Load More (50 at a time)
- ✅ `ProjectCard` extracted and DRY (shared by dashboard + all-projects)
- ✅ `useAllProjects` hook — paginated Firestore onSnapshot (50-per-batch loadMore)
- ✅ Mobile optimization audit — AppShell header condensed on `<sm` (folder icon, `+` CTA, tight sub-wordmark tracking); `overflow-x-hidden` guard; projects filter stacks vertically on mobile
- ✅ **Firebase Auth + Firestore rules (V3.9.1)** — single-user Google sign-in; `AuthProvider`/`AuthGate`; per-route layout gating (dashboard/create/projects/project); `requireAllowedUser` on both API routes; `authedFetch` client helper; `firestore.rules` locked to `isOwner()` email + `email_verified`

## What's Pending

- ⏳ V3 Phase 6: Multimodal input + YouTube support
- ⏳ V3 Phase 7: Multi-user auth + monetization (single-user auth done in V3.9.1; Phase 7 extends to full signup/login)
- ⏳ V3 Phase 8: Social publishing + scheduling

## Next Work

V3 Phase 6 — Multimodal Input + YouTube Support. Branch: `v3/phase-6-multimodal` (not yet created).

## Key Files (handle with care)

| File | Risk |
|------|------|
| `src/lib/pipeline/orchestrator.ts` | Backbone — all state transitions |
| `src/lib/ai/schemas/sko.ts` | Changing this breaks all downstream agents |
| `src/lib/ai/gemini-client.ts` | All AI calls flow through here |
| `src/lib/budget/tracker.ts` | Cost protection — always test changes |

## Cross-References

- Full history: [[Wiki/Project/Phase History]]
- Upcoming: [[Wiki/Project/Roadmap]]
- Architecture: [[Wiki/Architecture/Architecture Overview]]
