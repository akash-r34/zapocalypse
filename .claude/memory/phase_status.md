---
name: phase_status
description: Current build phase, completed steps, and what's pending
type: project
---

# Phase Status

## Current Phase: Phase 6 — Deploy & Test

**Status:** Blocked on Phase 0 (GCP/Firebase setup — manual browser steps required)

---

## Phase 0 Checklist ✅ COMPLETE

- [x] GCP project: `your-firebase-project-id`
- [x] Billing enabled
- [x] APIs enabled: Vertex AI, Cloud Firestore, Cloud Run, Cloud Build, Generative Language
- [x] Firebase project linked to GCP (`your-firebase-project-id`)
- [x] Firestore enabled (Native mode, `us-central1`)
- [x] CLI tools installed: `firebase-tools`, gcloud CLI
- [x] Authenticated: `firebase login`, `gcloud auth login`, `gcloud auth application-default login`
- [x] `.env.local` created with all required vars
- [x] GCP budget alert at $95 threshold

---

## Phase 1 — Foundation ✅ COMPLETE

- [x] Scaffold Next.js 16 + TypeScript strict + Tailwind v4 (Turbopack)
- [x] `apphosting.yaml` — `timeoutSeconds: 300`, `GEMINI_MODEL=gemini-2.0-flash`
- [x] `.gitignore`
- [x] `firestore.rules` (open access, TODO: auth later)
- [x] `CLAUDE.md` + rules + memory + slash commands
- [x] Full directory structure + `src/__fixtures__/` (blog post, ingested JSON, SKO JSON)
- [x] Tailwind v4 `@theme` with M3 CSS custom properties — no plugin
- [x] `ThemeProvider` (runtime CSS var injection), `AppShell`, UI components (Button, Card, Chip, TextField, ProgressIndicator)
- [x] `InputForm` component (URL/text/file modes), `BudgetMeter`
- [x] `/` dashboard, `/create`, `/project/[id]`, `/project/[id]/output/[platform]` pages

---

## Phase 2 — AI Pipeline Core ✅ COMPLETE

- [x] `gemini-client.ts` — Vertex AI singleton, `z.toJSONSchema()` (Zod v4 native), exponential backoff (429 only), `usageMetadata` cost tracking
- [x] Zod schemas: `IngestedContent`, `SKO`, `TwitterOutput`, `LinkedInOutput`, `NewsletterOutput`, `VeoOutput`
- [x] `src/lib/ai/__mocks__/gemini-client.ts` — returns fixture data for unit tests
- [x] Prompt templates: `ingest.ts`, `extract.ts`, `synthesize.ts` (all 4 platforms)
- [x] `input-validator.ts` — URL/text/file validation with size limits
- [x] `url-extractor.ts` — `@extractus/article-extractor`, YouTube guard
- [x] `logger.ts` — structured JSON logging
- [x] `pricing.ts` — per-token cost map for all Gemini models
- [x] `tracker.ts` — `checkBudget()` with monthly reset + `recordCost()` with Firestore `increment()`
- [x] `agent-ingest.ts`, `agent-extract.ts`, `agent-synthesize.ts` (4 parallel via `Promise.allSettled`)
- [x] `orchestrator.ts` — fire-and-forget, writes Firestore state on each transition
- [x] `src/lib/firestore/helpers.ts` — typed helpers (createProject, updateProjectStatus, writeSKO, writeOutputs to subcollection)
- [x] `src/lib/firebase/admin.ts` — Firebase Admin SDK singleton
- [x] `/api/pipeline/run` — validates input, creates Firestore doc, fires orchestrator, returns 202
- [x] `create/page.tsx` — POSTs to API and navigates to project on success

---

## Phase 3 — Firestore Integration ✅ COMPLETE

- [x] `src/lib/firebase/client.ts` — Firebase client SDK singleton with `NEXT_PUBLIC_FIREBASE_*` env vars
- [x] `src/hooks/useProject.ts` — Firestore `onSnapshot`, streams status + error + outputs in real-time
- [x] `src/hooks/useOutput.ts` — Firestore `onSnapshot` for individual platform output docs
- [x] `app/project/[projectId]/page.tsx` — client component with live ProgressIndicator, output display, loading/error states
- [x] `src/lib/firestore/helpers.ts` — `writeOutputs` writes to `projects/{id}/outputs/{platform}` subcollection (per schema rules)

---

## Phase 4 — Output UI ✅ COMPLETE

- [x] `TweetCarousel` — numbered dot carousel, type badges, char count, per-tweet + bulk copy, download thread
- [x] `LinkedInPreview` — accordion posts, angle badges, hook/body/cta, per-post + bulk copy, download all
- [x] `NewsletterPreview` — email header (subject/preview/read time), section layout, CTA callout, copy text/markdown, download .md
- [x] `VeoPreview` — script header, proportional timeline bar, scene cards (visual/voiceover/overlay), copy JSON/voiceover, download .json
- [x] `CopyButton` + `DownloadButton` + `useCopyToClipboard` hook — shared utilities
- [x] `OutputTabs` — pill-style tab bar to switch between platforms inline on project page
- [x] `app/project/[projectId]/page.tsx` — replaced card grid with `OutputTabs` for inline preview
- [x] `app/project/[projectId]/output/[platform]/page.tsx` — uses proper output components, works as full-page view

---

## Phase 5 — Budget & Polish ✅ COMPLETE

- [x] `useBudget` hook — Firestore `onSnapshot` on `budget/current`, fallback to zero state
- [x] `BudgetIndicator` — compact live bar in AppShell header, flips to error color at 95%
- [x] `kill-switch.ts` — Cloud Function entry point (`handleBillingAlert`) sets `killSwitch: true` via Pub/Sub; deployment instructions in comments
- [x] `tracker.ts` — `checkBudget()` now throws on `killSwitch: true` (4th protection layer)
- [x] `useRecentProjects` hook — `onSnapshot` query ordered by `createdAt` desc, limit 10
- [x] Dashboard (`app/page.tsx`) — 2-col layout: recent projects list with status colors + timestamps, budget sidebar with kill-switch banner
- [x] `ErrorBoundary` component (class-based, reusable)
- [x] `app/error.tsx` + `app/loading.tsx` — global App Router error/loading pages
- [x] `app/project/[projectId]/error.tsx` — scoped error page for project route

## Phase 6 — Deploy & Test ✅ COMPLETE

- [x] `apphosting.yaml` — all env vars set (`NEXT_PUBLIC_FIREBASE_*`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `GOOGLE_CLOUD_PROJECT`)
- [x] Deployed to Firebase App Hosting — https://zapocalypse--your-firebase-project-id.us-central1.hosted.app
- [x] End-to-end pipeline tested and working with `gemini-2.5-flash`
- [ ] GitHub repo + CI auto-deploy (optional — not needed for MVP)

---

## Content Factory v2.0 ✅ COMPLETE (2026-03-24)

**36 files changed, +1,378 lines. All phases merged to `main`.**

### v2.0 Phase 1 — Analyst Agent ✅ COMPLETE
- [x] `src/lib/ai/schemas/information-gain.ts` — `InformationGainScoreSchema` (5 signals, grade A-F) + `NEUTRAL_ANALYSIS_SCORE` fallback
- [x] `src/lib/ai/prompts/system.ts` — `CONTENT_ARCHITECT_SYSTEM_PROMPT` + `withSystemPrompt()` wrapper
- [x] `src/lib/ai/prompts/analyze.ts` — `buildAnalyzePrompt()` with full 5-signal scoring rubric
- [x] `src/lib/pipeline/agent-analyze.ts` — `runAnalysisAgent()` (same pattern as agent-ingest)
- [x] `src/lib/firestore/helpers.ts` — `writeAnalysis()` → `projects/{id}/analysis/current`
- [x] `src/lib/pipeline/orchestrator.ts` — fault-tolerant `analyzing` step (BudgetExceededError re-throws, other errors logged + skipped)
- [x] `src/types/project.ts` — added `"analyzing"` + `"authenticating"` to PipelineStatus; `analyze?` + `authenticate?` to agentTimings
- [x] `src/lib/ai/prompts/extract.ts` — accepts optional `InformationGainScore`, prepends analysis context
- [x] `src/components/ui/ProgressIndicator.tsx` — 4→5 steps with responsive `shortLabel` for mobile

### v2.0 Phase 2 — GEO Strategist ✅ COMPLETE
- [x] `src/lib/ai/schemas/twitter-output.ts` — added `"contrarian"` type + `answer_block?: string`
- [x] `src/lib/ai/schemas/linkedin-output.ts` — added `answer_block`, `CarouselSlideSchema`, `document_carousel?`
- [x] `src/lib/ai/schemas/dark-social-output.ts` — `DarkSocialSnippetSchema` (Slack, Discord, shareable_quote)
- [x] `src/lib/ai/prompts/synthesize.ts` — GEO instructions in all 4 builders + new `buildDarkSocialPrompt()`
- [x] `src/lib/pipeline/agent-synthesize.ts` — 4→5 parallel outputs, accepts `analysisScore?`
- [x] `src/types/outputs.ts` — `DarkSocialOutput` interface + `"dark_social"` Platform
- [x] `src/lib/firestore/helpers.ts` — `writeOutputs` handles `dark_social`
- [x] `src/components/output/DarkSocialPreview.tsx` — Slack/Discord message previews
- [x] `src/components/output/CarouselPreview.tsx` — LinkedIn carousel slide navigator
- [x] `src/components/output/OutputTabs.tsx` — added "Dark Social" tab
- [x] `src/components/output/TweetCarousel.tsx` — renders `answer_block` GEO card
- [x] `src/components/output/LinkedInPreview.tsx` — renders `answer_block` + `CarouselPreview`

### v2.0 Phase 3 — Authenticator Agent ✅ COMPLETE
- [x] `src/lib/ai/schemas/tone-check.ts` — `ToneCheckResultSchema` (per-platform scores, ai_slop_flags, passed boolean)
- [x] `src/lib/ai/schemas/c2pa-manifest.ts` — `C2PAManifestSchema` (SHA-256 hash, do_not_train, ai_generated)
- [x] `src/lib/ai/prompts/authenticate.ts` — `buildToneCheckPrompt()` (passes hooks/answer_blocks only, not full bodies)
- [x] `src/lib/pipeline/c2pa-generator.ts` — deterministic SHA-256 via Node `crypto`, zero Gemini cost
- [x] `src/lib/pipeline/agent-authenticate.ts` — `runAuthenticatorAgent()` (tone check + C2PA)
- [x] `src/hooks/useToneCheck.ts` — `onSnapshot` for `projects/{id}/tone_check/current`
- [x] `src/components/output/ToneCheckBadge.tsx` — advisory pass/fail badge with match score + slop count
- [x] `src/components/output/C2PABadge.tsx` — content credentials indicator
- [x] `src/lib/firestore/helpers.ts` — `writeToneCheck()`, `writeC2PAManifests()`
- [x] `src/lib/pipeline/orchestrator.ts` — fault-tolerant `authenticating` step

### v2.0 Bug Fix — Synthesis Reliability ✅ COMPLETE (2026-03-24)
- [x] Relaxed Zod schemas: `tweets.min(1).max(15)`, `posts.min(1).max(10)`, carousel `min(3).max(10)`, removed `answer_block` minimum, widened Dark Social limits
- [x] `OutputTabs` accepts `outputErrors` prop; shows collapsible "See why" with `humanizeError()` translation
- [x] `DarkSocialPreview` null guards on `slack_message`/`discord_message`
- [x] `ScoreBadge` Strongest/Biggest gap: `ExpandableText` component with "Show more/less" toggle
- [x] Commit: `fix: relax synthesis schemas, surface output errors, expand score cards`

### v2.0 Phase 4 — UI/UX ✅ COMPLETE
- [x] `src/lib/theme/motion.ts` — CSS `linear()` spring presets: `snappy`, `gentle`, `bouncy`
- [x] `app/globals.css` — `--spring-*` CSS vars, `@keyframes` card-reveal/badge-pop/slide-in, `.animate-*` utilities
- [x] `src/components/pipeline/AgentProgressPanel.tsx` — 5-agent status rows with spinner/checkmark/error states
- [x] `src/components/output/ScoreBadge.tsx` — SVG radial fill badge, `onSnapshot` from `analysis/current`, spring pop-in
- [x] `app/project/[projectId]/page.tsx` — AgentProgressPanel + ScoreBadge + ToneCheckBadge
- [x] `app/page.tsx` — added `analyzing` + `authenticating` to STATUS_LABEL/STATUS_COLOR Records

---

## V3 Development Plan

Full plan: `src/docs/V3 Development Plan.md`
Last revised: 2026-03-28 (expert critique integrated)

| Phase | Focus | Status | Branch |
|-------|-------|--------|--------|
| V3 Phase 1 | Predictive Virality & Hook Scoring | ✅ Complete (2026-04-03) | `v3/phase-1-hook-scoring` merged to main |
| V3 Phase 2 | Reflexion Loop + Additive Tone Fingerprinting | ✅ Complete (2026-04-03) | `v3/phase-2-reflexion-loop` |
| V3 Phase 3 | UX Clarity & Progressive Disclosure | ✅ Complete (2026-04-04) | `v3/phase-3-ux-clarity` |
| V3 Phase 4 | Fair-Play Credits, Tiered Refunds & Pre-flight | ✅ Complete (2026-04-04) | `v3/phase-4-fair-play` |
| V3 Phase 5 | C2PA Cryptographic Signing | ✅ Complete (2026-04-05) | `v3/phase-5-c2pa` merged to main |
| V3 Phase 6 | Multimodal Input & YouTube Support | ⏳ Pending | — |
| V3 Phase 7 | Authentication, Monetization & Retention | ⏳ Pending | — |
| V3 Phase 8 | Social Publishing & Scheduling | ⏳ Pending | — |

**Key V3 architectural decisions (2026-03-28):**
- Additive tone fingerprinting: map positive linguistic markers in SKO extraction, not slop filters
- Tiered refunds: decouple extraction cost from synthesis cost; SKO is a user-owned asset
- Pre-flight validation with `gemini-2.5-flash-8b` before heavy extraction
- Phase ordering: intelligence first (Virality → Reflexion) before UX and credits

---

## V3 Phase 1 — Hook Scoring ✅ COMPLETE (2026-04-03)

Branch: `v3/phase-1-hook-scoring` → merged to `main`

**Files created:**
- `src/lib/ai/schemas/hook-score.ts` — `HookScoreResultSchema`, `ScoredHookSchema` (4 dimensions, grade, A/B variants)
- `src/lib/ai/prompts/score-hooks.ts` — `buildScoreHooksPrompt()` with persona-anchored rubric
- `src/lib/pipeline/agent-score-hooks.ts` — `runHookScoringAgent()` (fault-tolerant)
- `src/hooks/useHookScores.ts` — `onSnapshot` for `projects/{id}/hook_scores/current`
- `src/components/output/HookScoreBadge.tsx` — inline grade+% pill badge
- `src/components/output/HookLeaderboard.tsx` — cross-platform ranked tab with A/B expansion

**Files modified:**
- `src/types/project.ts` — added `"scoring"` to `PipelineStatus`, `score_hooks?` to `agentTimings`
- `src/lib/firestore/helpers.ts` — added `writeHookScores()`
- `src/lib/pipeline/orchestrator.ts` — fault-tolerant `scoring` step after synthesis
- `src/components/pipeline/AgentProgressPanel.tsx` — Hook Scorer step (🎯)
- `src/components/output/OutputTabs.tsx` — Leaderboard tab, `hookScoreLookup` via `useHookScores`
- `src/components/output/TweetCarousel.tsx` — `HookScoreBadge` per tweet card
- `src/components/output/LinkedInPreview.tsx` — `HookScoreBadge` per accordion header
- `app/page.tsx` — `"scoring"` in STATUS_LABEL and STATUS_COLOR records

**Pipeline state:** `idle → ingesting → analyzing → extracting → synthesizing → scoring → authenticating → complete`
**Firestore path:** `projects/{id}/hook_scores/current`

---

## V3 Phase 2 — Reflexion Loop ✅ COMPLETE (2026-04-03)
*Implemented by Gemini CLI*

Branch: `v3/phase-2-reflexion-loop`

**Core AI Features:**
- **Additive Fingerprinting:** Extended SKO schema and extraction prompts to map unique positive markers (analogy style, cadence, signature phrases).
- **Tone Refinement Agent:** Created a new agent (`agent-refine-tone.ts`) that strengthens these markers based on specific user feedback.
- **Selective Regeneration:** Implemented a new pipeline (`regenerate.ts`) and API endpoint to regenerate specific platform outputs using the refined fingerprint without re-running the full pipeline.

**UI/UX Redesign:**
- **"Not my voice" Trigger:** Added a floating pill button at the bottom-right of the output container to trigger refinement.
- **Refinement Modal:** Implemented a centered modal overlay (`FeedbackForm.tsx`) with dynamic trait pills generated from the user's specific fingerprint.
- **Regeneration UX:** Added `RegenerationIndicator` and "Regenerated (v2)" badges to clearly signal updated content.

**Technical Maintenance:**
- Restored 100+ deleted skill files and adopted them into `.gemini/skills/` for foundational mandates.
- Formalized iron-clad collaboration rules in `GEMINI.md`.

---

## V3 Phase 4 — Fair-Play Credits, Tiered Refunds & Pre-flight ✅ COMPLETE (2026-04-04)

Branch: `v3/phase-4-fair-play`

**Files created:**
- `src/lib/pipeline/preflight.ts` — `runPreflightCheck()`, `PreflightError`; uses `generateStructured` with Zod schema; 3-point content sampling; skips inputs <5000 chars; fault-tolerant API errors
- `src/lib/budget/refund.ts` — `processRefund(projectId, "full" | "synthesis_only")`; uses correct synthesis agent names (`synthesize_twitter` etc.); atomic `FieldValue.increment(-amount)`
- `src/components/budget/CostBreakdown.tsx` — collapsible `<details>` per-agent cost panel; uses `useProjectCost`
- `src/components/budget/RefundBadge.tsx` — green "Full refund" / amber "Partial refund" pill with amount
- `src/components/budget/SpendChart.tsx` — recharts bar chart; `collectionGroup("cost_log")` query (1 read, not N+1)
- `src/components/dashboard/SKOAssetCard.tsx` — card for `skoRetained` projects; amber "Asset saved" badge
- `src/hooks/useProjectCost.ts` — typed `CostLogEntry[]` onSnapshot for `projects/{id}/cost_log`
- `src/hooks/useMonthlyRefunds.ts` — aggregates monthly refund total from projects where `refunded == true`

**Files modified:**
- `src/lib/ai/gemini-client.ts` — `generateText()` with `checkBudget()` first; model override on `generateStructured`
- `src/lib/budget/pricing.ts` — added `gemini-2.5-flash-8b` pricing
- `src/lib/firestore/helpers.ts` — `getProjectCostLog()`, `markProjectRefunded()`, `getMonthlyRefundTotal()`
- `src/lib/pipeline/orchestrator.ts` — `currentStage` tracking; preflight call; fixed `allFailed` check; `BudgetExceededError` excluded from refunds
- `src/lib/pipeline/logger.ts` — optional `amount` + `reason` fields on `PipelineLogEntry`
- `src/types/project.ts` — `refunded?`, `refundedAmount?`, `refundStage?`, `skoRetained?` on `Project`
- `src/hooks/useProject.ts` — refund fields with runtime type guards
- `src/hooks/useRecentProjects.ts` — `skoRetained` and `refunded` on `ProjectSummary`
- `src/components/budget/BudgetMeter.tsx` — optional `refundedTotal` prop + "Refunded this month" line
- `app/page.tsx` — imports + renders `SpendChart` and `SKOAssetCard`; uses `useMonthlyRefunds`
- `app/project/[projectId]/page.tsx` — renders `RefundBadge`, `CostBreakdown`, partial-success banner

**Key decisions:**
- `BudgetExceededError` never triggers refunds — it's a safety stop, not a failure
- Stage tracked as `"pre_extract"` → `"synthesis"` after `writeSKO()` succeeds
- Preflight uses `generateStructured` (Zod schema) not string matching
- SpendChart uses `collectionGroup` query — O(1) reads regardless of project count
- `gemini-2.5-flash-8b` added to pricing map to avoid defaulting to 4x pricier model

---

## V3 Phase 3 — UX Clarity & Progressive Disclosure ✅ COMPLETE (2026-04-04)

Branch: `v3/phase-3-ux-clarity`

**Files created:**
- `src/components/pipeline/ProgressRing.tsx` — SVG animated ring (stroke-dashoffset), status emoji + %, one-line label; error freezes ring red
- `src/components/ui/OverflowMenu.tsx` — click-outside popover for secondary actions; opens upward
- `src/hooks/useOutputExistence.ts` — collection-level `onSnapshot` on `outputs/`; returns `ready: Platform[]` as docs appear
- `src/hooks/useArtifactPreviews.ts` — batch `getDoc` for twitter[0].text, linkedin[0].hook, newsletter.subject_line per completed project

**Files modified:**
- `app/loading.tsx` — migrated from `--md-sys-color-*` to `--glass-*` CSS vars; converted inline styles to Tailwind classes
- `app/error.tsx` — same CSS var migration
- `app/project/[projectId]/error.tsx` — same CSS var migration
- `app/project/[projectId]/page.tsx` — ProgressRing replaces AgentProgressPanel as primary view; AgentProgressPanel in collapsible `<details>`; OutputTabs shown from `synthesizing` onward (not just `complete`)
- `src/components/output/OutputTabs.tsx` — imports `useOutputExistence`; tabs dim/pulse when pending; `effectiveTab` derived (no setState in effect); leaderboard gated on twitter ready
- `src/components/output/TweetCarousel.tsx` — "Download thread" moved to `<OverflowMenu>`
- `src/components/output/LinkedInPreview.tsx` — "Download all" moved to `<OverflowMenu>`
- `src/components/output/NewsletterPreview.tsx` — "Copy markdown" + "Download .md" moved to `<OverflowMenu>`
- `src/components/output/VeoPreview.tsx` — "Copy voiceover" + "Download .json" moved to `<OverflowMenu>`
- `src/components/pipeline/InputForm.tsx` — full rewrite: single textarea, URL auto-detect (`/^https?:\/\/\S+$/` + no newline), drag-drop file, attach icon, mode indicator + override chips
- `app/create/page.tsx` — subtitle updated to match smart input UX
- `app/page.tsx` — uses `useArtifactPreviews`; completed projects show firstTweet / linkedInHook / newsletterSubject preview snippets
- `src/lib/firestore/helpers.ts` — removed unused `db` variable in `updateRegenerationStatus`

**Key design decisions:**
- `effectiveTab` derived via `useMemo` instead of `setActiveTab` in `useEffect` — avoids lint rule `react-hooks/set-state-in-effect`
- `useArtifactPreviews` uses `fetchedRef` to prevent re-fetching the same projectId set; no loading state (previews appear when ready)
- ProgressRing shows at 37% (extract position) when pipeline errors — gives user location context
- `DarkSocialPreview` unchanged — each section has exactly one action, nothing to collapse

**Why:** Creator fatigue from UI clutter, not output quality. Progressive reveal lets creators engage with outputs the moment they exist, not after all 5 platforms complete.

---

## V3 Phase 5 — C2PA Cryptographic Signing ✅ COMPLETE (2026-04-05)

Branch: `v3/phase-5-c2pa` → merged to `main`

**Files created:**
- `src/lib/pipeline/c2pa-signer.ts` — `getOrCreateSigningKey()`, `createSignedManifest()`; ECDSA P-256 via Node.js `crypto`; in-memory + Firestore key cache; fallback to `metadata_only` on error
- `src/hooks/useC2PAManifests.ts` — `useC2PAManifest(projectId, platform)` + `useC2PAManifests(projectId)` onSnapshot hooks
- `src/components/output/C2PAManifestViewer.tsx` — project-level `<details>` panel; "N/M signed" summary; per-platform status + download; "Download all" button

**Files modified:**
- `src/lib/ai/schemas/c2pa-manifest.ts` — extended with optional `signing_status`, `signature`, `certificate_thumbprint`, `public_key_pem`, `manifest_uri`; `claim_generator` widened to enum; new `SignedC2PAManifest` type
- `src/lib/firestore/helpers.ts` — added `readSigningKey()`, `writeSigningKey()` for `system/c2pa_signing_key`
- `src/lib/pipeline/c2pa-generator.ts` — now async; delegates to `createSignedManifest()`; `claim_generator` → `"Zapocalypse/3.0"`
- `src/lib/pipeline/agent-authenticate.ts` — `await` added to `generateAllC2PAManifests()` call
- `src/components/output/C2PABadge.tsx` — full rewrite: interactive `<details>` panel with manifest details + DownloadButton; was static pill never rendered
- `app/project/[projectId]/page.tsx` — added `C2PAManifestViewer` after `ToneCheckBadge` on complete
- `src/components/output/OutputTabs.tsx` — added `C2PABadge` below each platform tab's content

**Key decisions:**
- `c2pa-node` (Rust NAPI) rejected: C2PA spec is for binary media (JPEG/MP4), not JSON text. ECDSA P-256 via Node.js built-in `crypto` gives real cryptographic provenance with zero native deps
- ECDSA keypair generated on first pipeline run, persisted to `system/c2pa_signing_key`, in-memory cached thereafter
- Signing errors fall back to `signing_status: "metadata_only"` — never throw, never block pipeline
- `claim_generator` versioned to `"Zapocalypse/3.0"` for new signed manifests; old `"2.0"` manifests parse correctly (optional fields)
- `C2PABadge` not shown in native preview mode — intentional, mimics real platform UI
- V3 plan documentation updated with Phase 1–5 implementation reality appendix + audit-confirmed gap fixes

---

## Coworking Alignment ✅ COMPLETE (2026-04-12)

**Task:** Synchronize Antigravity (Gemini) behaviors with Claude configuration and Shared memory.

**Files modified:**
- `GEMINI.md` — Complete overhaul/alignment with `CLAUDE.md`.
- `.claude/memory/codebase_architecture.md` — Updated to V3.6.
- `.claude/memory/phase_status.md` — Added this log entry.
- `.claude/memory/MEMORY.md` — Updated last worked on.

**Key design decisions:**
- **Emulated Hooks:** Integrated manual checks for typechecks, budget guards, and destructive command warnings as behavioral mandates to mimic Claude's `settings.json` hooks.
- **Workflow Parity:** Support for all Claude slash commands (`/status`, `/wiki-ingest`, etc.) as first-class Gemini capabilities.
- **Bi-Directional Memory Sync:** Committed to updating both local `.claude/memory` and Claude's global memory during every commit sync.

**Why:** To prevent "AI drift" and ensure that any agent (Claude or Gemini) picking up the workspace has 100% parity of context and behavioral safety.

---

## Vertex AI Migration + Security Hardening ✅ (2026-04-12) — pre-Phase-6

**Task:** Hard cutover from Google AI API-key mode to Vertex AI mode in `@google/genai` SDK.

**Files modified:**
- `src/lib/ai/gemini-client.ts` — `getClient()` now uses `{ vertexai: true, project, location }`. `GEMINI_API_KEY` removed.
- `apphosting.yaml` — removed `GEMINI_API_KEY` block; added `GOOGLE_CLOUD_LOCATION=us-central1`.
- `.env.example` / `.env.local` — removed `GEMINI_API_KEY`; added `GOOGLE_CLOUD_LOCATION`.
- `.claude/rules/ai-gemini.md` — updated client instantiation section.
- `.claude/memory/decisions.md` — superseded old "switched to API key" entry; added new Vertex migration decision.
- `.claude/memory/project_context.md` / `codebase_architecture.md` — updated model/SDK references.

**Why:** `GEMINI_API_KEY` was committed in plaintext (compromised in git history). Vertex AI uses ADC via the App Hosting runtime service account — no shared key. Also unblocks Phase 6 Multimodal/Veo which requires the Vertex endpoint.

**GCP prerequisites status (all confirmed ✅):**
- ADC active, project set to `your-firebase-project-id`
- Vertex AI API (`aiplatform.googleapis.com`) enabled
- App Hosting SA (`firebase-app-hosting-compute@...`) has `roles/aiplatform.user`
- Vertex confirmed working via `scripts/test-vertex.mjs`

**Model availability finding:** Only `gemini-2.5-flash` is available on Vertex for this project. `gemini-2.0-flash` and `gemini-2.5-flash-8b` return 404. Both the client fallback and `preflight.ts` `PREFLIGHT_MODEL` updated accordingly.

**Security hardening added:**
- `scripts/scan-secrets.sh` — pre-commit secret scanner (blocks `AIzaSy...` keys, private keys, service-account JSON); allow-listed public Firebase client key
- `.githooks/pre-commit` — calls scanner; activated via `git config core.hooksPath .githooks`
- `.gitignore` — added `*.key`, `*.p12`, `*.pfx`, `service-account*.json`, `gcloud-credentials*.json`
- `scripts/test-vertex.mjs` — standalone Vertex connectivity smoke test

**Remaining action:** Disable old key `AIzaSyAq...RRo` in Google AI Studio / GCP console.

---

## Tri-agent docs + Cursor rules ✅ (2026-04-12)

**Files created:**
- `.cursor/rules/zapocalypse.mdc` — `alwaysApply: true`; directs Cursor to `CLAUDE.md` and shared `.claude/` (no Cursor-only rule forks).

**Files modified:**
- `CLAUDE.md` — "Collaborating agents" section (Cursor, Claude Code, Gemini); slash-command table adds `/sync-vault` and `/wiki-ingest`; Rule 2 lists all three assistants for committed memory.
- `GEMINI.md` — Tri-agent framing; repo-relative `CLAUDE.md` reference; Cursor entry bullet mentions `.cursor/rules/`; workflow command table aligned with `CLAUDE.md`.

**Why:** Versioned IDE rules so clones get the same Cursor behavior; explicit three-way handoff story alongside a single `.claude/` source of truth.

---



## Lint Cleanup ✅ (2026-04-14) — pre-Phase-6

**Task:** Eliminate all ESLint errors/warnings — `npm run lint` now exits 0.

**Root cause:** `.firebase/` deploy artifacts (minified JS bundles) were not in the ESLint ignore list, causing 38,140+ false errors. Three source files also had `react-hooks/set-state-in-effect` violations.

**Files modified:**
- `eslint.config.mjs` — added `.firebase/**` to `globalIgnores`
- `src/hooks/useSourceContent.ts` — `useState(!!projectId)` init; removed synchronous `setLoading(true)` from effect
- `src/components/budget/SpendChart.tsx` — `useState(projectIds.length > 0)` init; removed synchronous `setLoading(false)` from early-return branch
- `src/components/output/OutputTabs.tsx` — `eslint-disable-next-line react-hooks/set-state-in-effect` on `setRetrying(null)` (legitimate Firestore subscription response)

**Why:** Clean lint baseline before Phase 6 work begins.

---

## Landing Page, Dashboard Redesign & All-Projects View ✅ (2026-04-14)

Branch: `feat/landing-and-projects-page`

**Files created:**
- `app/(marketing)/layout.tsx` — Marketing chrome (minimal header + footer + BackgroundElements); isolated from AppShell
- `app/(marketing)/page.tsx` — Public landing page; composes Hero, Problem, Features, Output, Pricing, FAQ
- `app/dashboard/page.tsx` — Workspace dashboard (OpusClip-style quick-start banner, 2-col grid, stats sidebar)
- `app/projects/page.tsx` — All-projects page with client-side search/status/source filters and Load More (50 at a time)
- `src/components/marketing/Hero.tsx`, `Problem.tsx`, `Features.tsx`, `Output.tsx`, `Pricing.tsx`, `FAQ.tsx`, `HowItWorks.tsx` — all marketing section components
- `src/components/dashboard/ProjectCard.tsx` — Reusable project card (dashboard + projects page)
- `src/components/dashboard/projectStatus.ts` — STATUS_LABEL + STATUS_COLOR maps
- `src/hooks/useAllProjects.ts` — Paginated Firestore onSnapshot (50-per-batch loadMore)

**Files modified/deleted:**
- `app/page.tsx` — DELETED; migrated to `app/dashboard/page.tsx`
- `src/components/layout/AppShell.tsx` — Logo link → `/dashboard`; added "Projects" nav link
- `app/layout.tsx` — Updated meta description

**Key design decisions:**
- Route group `(marketing)` separates public chrome from workspace AppShell without route collision
- `ProjectCard` DRY: shared by dashboard and all-projects
- Landing page copy: benefits-first, specific metrics, objection-handling FAQ (copywriting skill applied)
- 3-tier pricing in copy (Free / Pro $15 / Hibernation $5); billing not yet implemented
- `text-[var(--glass-bg)]` not `text-white` on accent buttons — theme-safe for light mode

## Firebase Auth + Firestore Rules (V3.9.1) ✅ (2026-04-18)

Branch: `feat/auth-firestore-rules` → merged to `main`

**Problem:** Firebase Test Mode rules expiring (allow read, write: if true). Used the deadline to add proper single-user Google Auth instead of patching with a weaker rule.

**Files created:**
- `src/lib/auth/allowed.ts` — `ALLOWED_EMAIL` constant (single source for client-side check)
- `src/lib/auth/AuthContext.tsx` — `AuthProvider` + `useAuth()` hook; `onAuthStateChanged` driven; `forbidden` status + auto-signout for wrong email
- `src/lib/auth/requireUser.ts` — `requireAllowedUser(req)` + `ApiAuthError`; server-side Bearer token verification via `getAdminAuth().verifyIdToken()`
- `src/lib/auth/authedFetch.ts` — drop-in `fetch` replacement that injects Bearer ID token
- `src/components/auth/AuthGate.tsx` — full-screen loading/sign-in/forbidden states; renders children only when signed in

**Files created (route layouts):**
- `app/dashboard/layout.tsx`, `app/create/layout.tsx`, `app/projects/layout.tsx`, `app/project/[projectId]/layout.tsx` — thin `<AuthGate>` wrappers; marketing layout has no gate

**Files modified:**
- `src/lib/firebase/client.ts` — added `getClientAuth()`, `googleProvider`
- `src/lib/firebase/admin.ts` — added `getAdminAuth()`
- `app/layout.tsx` — mounted `<AuthProvider>` inside ThemeProvider
- `src/components/layout/AppShell.tsx` — sign-out icon button (uses `useAuth()`)
- `app/api/pipeline/run/route.ts` — `requireAllowedUser` at top
- `app/api/pipeline/regenerate/route.ts` — `requireAllowedUser` at top
- `app/create/page.tsx` — `fetch` → `authedFetch`
- `src/components/output/FeedbackForm.tsx` — `fetch` → `authedFetch`
- `src/components/output/OutputTabs.tsx` — `fetch` → `authedFetch`
- `firestore.rules` — `isOwner()` function (email + email_verified); `projects/**` + `budget/**` readable by owner only; `system/**` fully blocked; all writes denied
- `firebase.json` — added `"firestore": { "rules": "firestore.rules" }` so `firebase deploy --only firestore:rules` works
- `apphosting.yaml` — added `ALLOWED_USER_EMAIL` (RUNTIME only)
- `.env.example` — added `ALLOWED_USER_EMAIL`

**Key design decisions:**
- Admin SDK bypasses Firestore rules entirely — server writes unaffected by locking down rules
- `email_verified: true` guard in rules prevents spoofed custom-token attacks
- Email hardcoded in rules (rules can't read env vars); also in `ALLOWED_EMAIL` constant; API routes use `process.env.ALLOWED_USER_EMAIL` (rotatable without rebuild)
- Gate mounted per-route on workspace layouts (not root) — landing page stays publicly accessible
- `authedFetch` wraps all 3 client `fetch` callers so ID token is always fresh (not cached)
- `forbidden` status immediately signs the user out — prevents confused state

**Deploy step (user must run):**
```
firebase deploy --only firestore:rules --project your-firebase-project-id
```

---

## Mobile Optimization Audit ✅ (2026-04-14)

Branch: `main` (committed directly — post-merge polish)

**Problem:** After adding "Built for the creator economy" sub-wordmark + Projects link + New Project CTA + BudgetMeter in the AppShell header, the combined width exceeded 375px viewport causing horizontal scroll on mobile.

**Files modified:**
- `src/components/layout/AppShell.tsx`
  - Added `overflow-x-hidden` to top-level wrapper (global guard)
  - `ZapocalypseLogo` sub-wordmark: `block text-[5px] sm:text-[7px] tracking-[0.05em] sm:tracking-[0.28em]` — tiny+tight on mobile, full width on sm+
  - Projects nav link: folder SVG icon on mobile (`sm:hidden block`), text "Projects" on sm+ (`hidden sm:inline`)
  - New Project CTA: `w-8 h-8` circular `+` button on mobile, full pill on sm+
  - Nav gap: `gap-2 sm:gap-3`
- `app/(marketing)/layout.tsx`
  - Sub-wordmark: `block text-[5px] sm:text-[8px] tracking-[0.05em] sm:tracking-[0.28em]` — same treatment as AppShell
  - Nav gap: `gap-2 sm:gap-4`
- `app/projects/page.tsx`
  - Filter bar inputs: `w-full sm:w-auto` — vertical stack on mobile, horizontal row on sm+
  - Search input: `w-full sm:flex-1 sm:min-w-[200px]`

**Key design decisions:**
- Sub-wordmark preserved on ALL screen sizes (not hidden) — user spec. Solved via font-size + tracking compression rather than visibility toggle.
- Folder icon + circle `+` button: semantic, touch-friendly targets (32×32px minimum tap area) on mobile
- `overflow-x-hidden` guard: belt-and-suspenders; prevents 1px rogue scrollbars from future animations/glows
