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
  - history
related:
  - "[[Wiki/Project/Roadmap]]"
  - "[[Wiki/Project/Current Status]]"
sources:
  - "[[Sources/Memory/phase_status]]"
---

# Phase History

> Complete record of all development phases from V1 Foundation through V3.6 Alignment.

## V1 Foundation (Phases 0-6)

### Phase 0 — GCP Setup ✅
- GCP project `your-firebase-project-id`, Firestore Native, Firebase linked
- CLI tools authenticated, `.env.local` created, $95 GCP budget alert

### Phase 1 — Foundation ✅
- Next.js 16 + TypeScript strict + Tailwind v4 (Turbopack)
- `apphosting.yaml` — `timeoutSeconds: 300`, `GEMINI_MODEL=gemini-2.0-flash`
- Firestore rules, CLAUDE.md + rules + memory, directory structure
- `ThemeProvider`, `AppShell`, UI components, `InputForm`, `BudgetMeter`
- Pages: `/`, `/create`, `/project/[id]`, `/project/[id]/output/[platform]`

### Phase 2 — AI Pipeline Core ✅
- `gemini-client.ts` — singleton, `z.toJSONSchema()`, exponential backoff, cost tracking
- Zod schemas: `IngestedContent`, `SKO`, `TwitterOutput`, `LinkedInOutput`, `NewsletterOutput`, `VeoOutput`
- `input-validator.ts`, `url-extractor.ts`, `logger.ts`, `pricing.ts`, `tracker.ts`
- `agent-ingest.ts`, `agent-extract.ts`, `agent-synthesize.ts` (4 parallel via `Promise.allSettled`)
- `orchestrator.ts`, `helpers.ts`, `admin.ts`, `/api/pipeline/run`

### Phase 3 — Firestore Integration ✅
- Firebase client SDK singleton, `useProject`, `useOutput` hooks
- Real-time `onSnapshot` on project detail page
- `writeOutputs` → `projects/{id}/outputs/{platform}` subcollection

### Phase 4 — Output UI ✅
- `TweetCarousel`, `LinkedInPreview`, `NewsletterPreview`, `VeoPreview`
- `CopyButton`, `DownloadButton`, `useCopyToClipboard`
- `OutputTabs` — inline platform switching

### Phase 5 — Budget & Polish ✅
- `useBudget`, `BudgetIndicator`, `kill-switch.ts` Cloud Function
- `useRecentProjects`, Dashboard 2-col layout
- `ErrorBoundary`, `app/error.tsx`, `app/loading.tsx`

### Phase 6 — Deploy & Test ✅
- Deployed to Firebase App Hosting
- End-to-end pipeline tested with `gemini-2.5-flash`
- Live: `https://zapocalypse--your-firebase-project-id.us-central1.hosted.app`

---

## Content Factory v2.0 ✅ (2026-03-24)

**36 files changed, +1,378 lines**

### v2.0 Phase 1 — Analyst Agent
- `InformationGainScoreSchema` (5 signals, grade A-F) + `NEUTRAL_ANALYSIS_SCORE` fallback
- `runAnalysisAgent()` — fault-tolerant step in orchestrator
- `writeAnalysis()` → `projects/{id}/analysis/current`

### v2.0 Phase 2 — GEO Strategist
- Added `answer_block` (GEO) to Twitter + LinkedIn schemas
- `DarkSocialOutputSchema` — Slack, Discord, shareable_quote (5th platform)
- `DarkSocialPreview`, `CarouselPreview` components

### v2.0 Phase 3 — Authenticator Agent
- `ToneCheckResultSchema`, `C2PAManifestSchema`
- `runAuthenticatorAgent()` — fault-tolerant, tone check + C2PA
- `ToneCheckBadge`, `C2PABadge` (initial metadata-only version)

### v2.0 Bug Fix — Synthesis Reliability
- Relaxed Zod schemas to ranges (`.min/.max` not `.length()`)
- `OutputTabs` `outputErrors` prop with `humanizeError()` translation

### v2.0 Phase 4 — UI/UX
- CSS `linear()` spring presets in `motion.ts`
- `AgentProgressPanel`, `ScoreBadge` with SVG radial fill + spring pop-in

---

## V3 Development (2026-04-03 → 2026-04-05)

### V3 Phase 1 — Predictive Virality & Hook Scoring ✅ (2026-04-03)
Branch: `v3/phase-1-hook-scoring` → merged to `main`

- `HookScoreResultSchema`, `ScoredHookSchema` (4 dimensions: novelty, emotional_resonance, niche_relevance, shareability)
- `runHookScoringAgent()` — fault-tolerant
- `useHookScores`, `HookScoreBadge`, `HookLeaderboard`
- New pipeline state: `scoring` (after synthesis, before authenticating)

### V3 Phase 2 — Reflexion Loop + Additive Tone Fingerprinting ✅ (2026-04-03)
Branch: `v3/phase-2-reflexion-loop` (Gemini CLI implementation)

- Extended `BrandToneFingerprintSchema` with positive markers, cadence spectrum, niche_colloquialisms
- `runRefineToneAgent()` — additive strengthening of positive markers
- `regenerate.ts` + `/api/pipeline/regenerate` endpoint
- `FeedbackForm.tsx` with dynamic trait pills from user's fingerprint
- `RegenerationIndicator`, "Regenerated (v2)" badges

### V3 Phase 3 — UX Clarity & Progressive Disclosure ✅ (2026-04-04)
Branch: `v3/phase-3-ux-clarity`

- `ProgressRing.tsx` — SVG animated ring, replaces `AgentProgressPanel` as primary view
- `useOutputExistence` — tabs appear progressively as Firestore docs land
- `useArtifactPreviews` — dashboard snippets (firstTweet, linkedInHook, newsletterSubject)
- `OverflowMenu` — secondary actions collapsed (download, copy markdown)
- `InputForm` full rewrite — smart URL auto-detect, drag-drop

### V3 Phase 4 — Fair-Play Credits, Tiered Refunds & Pre-flight ✅ (2026-04-04)
Branch: `v3/phase-4-fair-play`

- `preflight.ts` — `runPreflightCheck()` with `gemini-2.5-flash-8b`
- `refund.ts` — `processRefund()` with `"full" | "synthesis_only"` tiers
- `CostBreakdown`, `RefundBadge`, `SpendChart` (recharts), `SKOAssetCard`
- `useProjectCost`, `useMonthlyRefunds`
- `currentStage` tracking in orchestrator for refund logic

### V3 Phase 5 — C2PA Cryptographic Signing ✅ (2026-04-05)
Branch: `v3/phase-5-c2pa` → merged to `main`

- `c2pa-signer.ts` — ECDSA P-256 via Node.js `crypto`, in-memory + Firestore key cache
- `useC2PAManifests` hook (covers both `useC2PAManifest` + `useC2PAManifests`)
- `C2PAManifestViewer` — project-level provenance panel
- `C2PABadge` full rewrite — interactive `<details>` with manifest details
- `SignedC2PAManifest` type — optional signature, cert_thumbprint, public_key_pem

### Coworking Alignment — Antigravity Parity ✅ (2026-04-12)
Branch: `main` — synchronization with Claude Code config.

- overhauled `GEMINI.md` to match `CLAUDE.md` rules and commands
- Adopted emulated pre/post hooks for tool safety (typechecks, budget guards)
- Full bi-directional memory sync protocol (repository + home directory)
- Updated memory to V3.6

### Lint Cleanup ✅ (2026-04-14)
Branch: `main`

- `eslint.config.mjs` — added `.firebase/**` to `globalIgnores` (eliminates 38k+ false errors from deploy artifacts)
- `src/hooks/useSourceContent.ts` — `useState(!!projectId)` init; removed synchronous `setLoading(true)` from effect
- `src/components/budget/SpendChart.tsx` — `useState(projectIds.length > 0)` init; removed synchronous `setLoading(false)` early-return
- `src/components/output/OutputTabs.tsx` — `eslint-disable-next-line react-hooks/set-state-in-effect` on `setRetrying(null)` (legitimate Firestore subscription response)
- `npm run lint` exits 0, clean baseline for Phase 6

### Firebase Auth + Firestore Rules (V3.9.1) ✅ (2026-04-18)
Branch: `feat/auth-firestore-rules` → merged to `main`

Firebase Test Mode rules were expiring. Used the deadline to wire proper single-user Google Auth.

**New files:** `src/lib/auth/allowed.ts`, `AuthContext.tsx`, `requireUser.ts`, `authedFetch.ts`; `src/components/auth/AuthGate.tsx`; 4 per-route gate layouts

**Modified:** `client.ts` (getClientAuth, googleProvider), `admin.ts` (getAdminAuth), `app/layout.tsx` (AuthProvider), `AppShell.tsx` (sign-out button), both API routes (requireAllowedUser), 3 client fetch callers (authedFetch), `firestore.rules`, `firebase.json`, `apphosting.yaml`

**Key decisions:**
- Admin SDK bypasses rules — server pipeline writes unaffected by locking rules
- `email_verified: true` guard in rules — prevents spoofed custom-token attacks
- Gate per-route, not root — landing page stays public
- `authedFetch` wraps all 3 client callers so ID token stays fresh

See [[Wiki/Infrastructure/Auth & Firestore Security]] for full architecture.

## Cross-References

- Current state: [[Wiki/Project/Current Status]]
- Roadmap: [[Wiki/Project/Roadmap]]
- V3 plan doc: [[Sources/Docs/V3 Development Plan.md]]
