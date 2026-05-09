---
type: status
domain: architecture
source_file: src/docs/V3 Development Plan.md
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - status
  - project
  - roadmap
related:
  - "[[Wiki/Project/Phase History]]"
  - "[[Wiki/Project/Current Status]]"
sources:
  - "[[Sources/Memory/phase_status]]"
  - "[[Sources/Docs/V3 Development Plan.md]]"
  - "[[Sources/Docs/V3 Market research.md]]"
---

# Roadmap

> Pending V3 phases and known technical debt.

## V3 Phases Remaining

### V3 Phase 6 — Multimodal Input & YouTube Support ⏳
**Status:** Pending. Not yet started.

Planned scope:
- YouTube URL support (currently blocked — users shown friendly error asking for transcript)
- Video file processing (multimodal Gemini vision for frame extraction)
- Audio transcription for screen recordings
- Pre-flight expanded to handle video/audio content types
- Heavy input path: 10 vision frames + audio transcription → SKO

**Why deferred:** Pre-flight infrastructure needed to ship first (V3 Phase 4) so expensive multimodal calls have cost protection.

### V3 Phase 7 — Authentication, Monetization & Retention ⏳
**Status:** Pending.

Planned scope:
- Firebase Auth (currently disabled — single-user app)
- Per-user project isolation (Firestore security rules)
- Credit/token system for monetization
- User profile + brand voice persistence across sessions
- Retention mechanics (email digest, saved templates)

**Why deferred:** All intelligence and interface phases must be stable first. No point adding auth to an MVP that hasn't proven output quality.

### V3 Phase 8 — Social Publishing & Scheduling ⏳
**Status:** Pending.

Planned scope:
- Direct publishing: Twitter/X API, LinkedIn API, newsletter (ConvertKit/Mailchimp)
- Scheduling queue
- Published content tracking
- Analytics ingestion (engagement → trains virality model)

---

## Known Technical Debt

### No GitHub CI
Auto-deploy from `main` branch to Firebase App Hosting is configured but GitHub repo CI (linting, type-checking on PR) is not set up. Flagged as optional in Phase 6 checklist.

### Firestore Security Rules
`firestore.rules` is open access. Intentional for single-user MVP — must be tightened before V3 Phase 7 (auth).

### `app/project/[projectId]/output/[platform]/page.tsx`
Full-page per-platform view exists but `OutputTabs` on the project detail page provides inline preview. The standalone page is maintained but not prominently linked.

### Veo Output is a Script, Not Video
`veo-client.ts` is a placeholder. The pipeline generates a structured JSON video script (scenes, voiceover, overlays) — not an actual Veo API call. Real Veo integration is future work.

### `localStorage` Brand Color
User-configured brand color stored in `localStorage("zapocalypse-brand-color")` globally. Not per-user or per-project. Must migrate to Firestore in Phase 7.

---

## Market Research Origins

> From [[Sources/Docs/V3 Market research.md]] — which pain points and recommendations were implemented vs. still pending.

| Research Recommendation | Status | Implemented As |
|------------------------|--------|----------------|
| "Credit Trap" — regenerations consuming credits for bad output | ✅ Built | Tiered refunds (V3 Phase 4) — [[Wiki/Concepts/Budget Protection Layers]] |
| "AI Slop" penalty from algorithms + audiences | ✅ Built | Additive tone fingerprinting (V3 Phase 2) — [[Wiki/Concepts/Additive Tone Fingerprinting]] |
| Information Gain Auditor — flag low-originality content | ✅ Built | Analyst Agent (V2 Phase 1) — [[Wiki/Pipeline/Agent - Analyst]] |
| "Fair-Play" Credit System — refund errors automatically | ✅ Built | Pre-flight + tiered refunds (V3 Phase 4) — [[Wiki/Concepts/Budget Protection Layers]] |
| C2PA "Digital Proof" Signer — EU AI Act compliance | ✅ Built | ECDSA P-256 signing (V3 Phase 5) — [[Wiki/Concepts/C2PA Signing]] |
| Dark Social Optimization — Discord/Slack snippets | ✅ Built | 5th platform output (V2 Phase 2) — [[Wiki/Data/Schema - Dark Social Output]] |
| Predictive Virality — niche-specific hook scoring | ✅ Built | Hook Scoring (V3 Phase 1) — [[Wiki/Pipeline/Agent - Hook Scorer]] |
| GEO "Answer Blocks" — AI search engine optimization | ✅ Built | `answer_block` field (V2 Phase 2) — [[Wiki/Data/Schema - Twitter Output]] |
| Progressive Disclosure — "invisible player" interface | ✅ Built | V3 Phase 3 UX — [[Wiki/Components/UI System Overview]] |
| "Reflexion" Loop — one-click "This isn't my voice" | ✅ Built | Tone refinement (V3 Phase 2) — [[Wiki/Pipeline/Agent - Refine Tone]] |
| Multimodal Scene-Aware Clipping (vision + transcripts) | ⏳ Pending | V3 Phase 6 |
| Hibernation Plan — $5/mo to preserve brand voice models | ⏳ Pending | V3 Phase 7 |
| Agentic Multi-Account Scheduler (TikTok/Instagram) | ⏳ Pending | V3 Phase 8 |
| Loyalty Loops / Streaks for retention | ⏳ Pending | V3 Phase 7 |

## Cross-References

- Completed phases: [[Wiki/Project/Phase History]]
- Current state: [[Wiki/Project/Current Status]]
- V3 plan: [[Sources/Docs/V3 Development Plan.md]]
- Market research: [[Sources/Docs/V3 Market research.md]]
