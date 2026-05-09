---
name: codebase_architecture
description: Complete codebase reference for Zapocalypse V3.9 — every file, every export, every prop, every hook. Read this BEFORE opening any source file.
type: project
---

> **Last audited:** 2026-04-18 (Firebase Auth + Firestore rules — single-user Google sign-in, per-route AuthGate, server-side token verification on both pipeline routes, locked Firestore rules) | **Rule:** Read this doc first. Open source files only to make edits or inspect verbatim code.

# Zapocalypse — Full Codebase Architecture (V3.9)

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js **16.2.1** (App Router, Turbopack) + TypeScript strict |
| Styling | Tailwind **v4** (CSS-first `@theme`) + `--glass-*` CSS custom properties |
| AI SDK | `@google/genai` — Vertex AI mode (`vertexai: true`, ADC auth, `us-central1`). Only `gemini-2.5-flash` is available on Vertex for this project. |
| AI Model | `gemini-2.5-flash` (env var `GEMINI_MODEL`, fallback `gemini-2.5-flash`). Only model available on Vertex for this project — `gemini-2.0-flash` and `gemini-2.5-flash-8b` return 404 on Vertex. |
| Database | Cloud Firestore (Native mode, `us-central1`) |
| Hosting | Firebase App Hosting (Cloud Run, scale-to-zero) |
| Schemas | **Zod v4** — `z.toJSONSchema()` natively. Do NOT use `zod-to-json-schema` package. |
| React | 19.2.4 |

---

## Pipeline State Machine

```
idle → ingesting → analyzing → extracting → synthesizing → scoring → authenticating → complete
                                                                                        ↑
                                                         [Reflexion Loop] ↺ (selective regeneration via POST /api/pipeline/regenerate)
Terminal error states: error | budget_exceeded (never retry out of these)
```

---

## Firestore Schema

| Path | Shape |
|---|---|
| `budget/current` | `{ spent: number, limit: 100, killSwitch: boolean, budgetMonth: "YYYY-MM", updatedAt }` |
| `projects/{id}` | `{ id, status: PipelineStatus, sourceType, createdAt, updatedAt, error?, outputErrors?, regenerationCount?, regenerationState?, refunded?, refundedAmount?, refundStage?, skoRetained? }` — `outputErrors[platform]` cleared atomically when platform's first regen succeeds; `regenerationState.{platform}.intent: "retry"|"refine"` written on start |
| `projects/{id}/cost_log/{auto-id}` | `{ agentName, model, promptTokens, outputTokens, costUsd, timestamp, regenPlatform? }` — `regenPlatform` set for all cascade costs (refine_tone, regenerate_*, authenticate, score_hooks during regen); written even on validation failure |
| `projects/{id}/refund_log/{auto-id}` | `{ platform, amount, reason: "synthesis_failed"|"regen_failed", attempt, agentNames[], createdAt }` — `attempt=0` for synthesis failure; `attempt=N` (1-based, matches CostBreakdown attemptIndex) for regen failure |
| `projects/{id}/analysis/current` | `InformationGainScore` + `savedAt` |
| `projects/{id}/sko/current` | `SKO` + `savedAt` |
| `projects/{id}/outputs/{platform}` | platform output data + `generatedAt`, `isRegenerated?` — `isRegenerated` only set when platform previously succeeded (not on first-success-after-failure) |
| `projects/{id}/hook_scores/current` | `HookScoreResult` + `savedAt` |
| `projects/{id}/tone_check/current` | `ToneCheckResult` + `savedAt` — per_platform only contains platforms with actual output (failed platforms excluded at write time); updated per-platform by cascade after each regen |
| `projects/{id}/c2pa/{platform}` | `C2PAManifest` + `savedAt` |
| `projects/{id}/tone_history/{auto-id}` | `{ platform, feedback, original_fingerprint, refined_fingerprint, timestamp }` |
| `system/c2pa_signing_key` | `{ privateKeyPem, publicKeyPem, thumbprint, savedAt }` — ECDSA P-256 keypair; written once on first pipeline run, reused forever |

Platforms: `twitter | linkedin | newsletter | veo | dark_social`

---

## CSS Variable System

All styling uses `--glass-*` vars. The `--md-sys-color-*` Material Design tokens are fully removed as of V3.3.

| Var | Purpose |
|---|---|
| `--glass-bg` | Page/container background |
| `--glass-bg-secondary` | Slightly lighter background |
| `--glass-border` | Default border |
| `--glass-border-light` | Subtle/dashed borders |
| `--glass-text` | Primary text |
| `--glass-text-secondary` | Secondary/muted text |
| `--glass-text-tertiary` | Faint labels, hints |
| `--glass-accent` | Primary accent (teal/blue) |
| `--glass-accent-muted` | Lighter accent tint |
| `--glass-danger` | Error/destructive red |
| `--glass-elevated` | Elevated surface class name |
| `--glass-surface` | Surface class name |

CSS classes: `glass` (standard card), `glass-elevated` (raised card), `glass-surface` (subtle surface)

---

## Types (`src/types/`)

### `project.ts`

```typescript
type PipelineStatus =
  | "idle" | "ingesting" | "analyzing" | "extracting"
  | "synthesizing" | "scoring" | "authenticating"
  | "complete" | "error" | "budget_exceeded";

interface RegenerationEntry {
  status: "processing" | "complete" | "error";
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

interface AdditiveFingerprint {
  analogy_style?: string;           // e.g. "mechanical metaphors"
  sentence_cadence?: "low" | "medium" | "high";
  signature_phrases?: string[];
  storytelling_structure?: string;  // e.g. "opens with anecdote, pivots to data"
  humor_type?: string;              // e.g. "dry self-deprecation"
  colloquialisms?: string[];
  explanation_pattern?: string;
}

interface ToneRefinement {
  id: string;
  timestamp: Date;
  platform: string;
  feedback: string;
  original_fingerprint: AdditiveFingerprint;
  refined_fingerprint: AdditiveFingerprint;
  cost?: number;
}

interface Project {
  id: string;
  status: PipelineStatus;
  sourceType: "url" | "text" | "file";
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
  outputs?: Partial<Record<Platform, DocumentData>>;
  outputErrors?: Record<string, string>;
  regenerationCount?: number;
  regenerationState?: Record<string, RegenerationEntry>;
  sko?: SKO;
  // Phase 4 — Fair-Play Credits
  refunded?: boolean;
  refundedAmount?: number;
  refundStage?: "full" | "synthesis_only";
  skoRetained?: boolean;  // true when synthesis failed but SKO was persisted
}
```

### `outputs.ts`
```typescript
type Platform = "twitter" | "linkedin" | "newsletter" | "veo" | "dark_social";
```

---

## Zod Schemas (`src/lib/ai/schemas/`)

### `sko.ts`
Key fields of `SKOSchema`:
- `core_thesis: string` — 3-5 sentence thesis
- `audience_persona: { primary, secondary, pain_points[], desired_outcomes[] }`
- `viral_hooks: string[]` — min 3, max 10
- `semantic_chunks[]: { id, heading, key_insight, supporting_data[], emotional_valence, relevance_score }` — min 1
- `brand_tone_fingerprint: BrandToneFingerprintSchema` — merged with `AdditiveFingerprintSchema`
  - Subtractive: `voice, style, vocabulary_level, preferred_structures[], avoid[]`
  - Additive (all optional): `analogy_style, sentence_cadence, signature_phrases[], storytelling_structure, humor_type, colloquialisms[], explanation_pattern`

### `ingested-content.ts`
`IngestedContentSchema`: `{ sourceType, title, rawContent, contentSections[{heading,body}], metadata:{author?,publishDate?,wordCount} }`

### `information-gain.ts`
`InformationGainScoreSchema`: `{ signals:{proprietary_data,first_person_specificity,verifiable_claims,non_obvious_conclusions,depth}` each `0-10`; `overall_score, grade: A|B|C|D|F, content_classification, strongest_asset, biggest_gap, enrichment_suggestions[] }`
Also exports: `NEUTRAL_ANALYSIS_SCORE` — fallback (all signals = 5, grade = C)

### `hook-score.ts`
`HookScoreResultSchema`: `{ hooks[]: { hook_id, text, platform, hook_type, composite_score 0-1, grade: A-F, scores:{novelty,emotional_resonance,niche_relevance,shareability}, explanation, ab_variants[]? }, top_hook_id }`

### `tone-check.ts`
`ToneCheckResultSchema`: `{ platform_scores: Record<platform, {match_score 0-1, issues[]}>, overall_match_score, ai_slop_flags[{phrase,severity:low|medium|high}], passed: boolean }`

### `c2pa-manifest.ts`
`C2PAManifestSchema`: `{ claim_generator: enum["Zapocalypse/2.0","Zapocalypse/3.0"], tool_used:{name,version,model}, creator_identity:{type:"anonymous_app_user"}, content_credentials:{creation_timestamp,content_hash,do_not_train:true,ai_generated:true}, assertions[{label,data}], signing_status?:enum["signed","metadata_only"], signature?:string|null, certificate_thumbprint?:string|null, public_key_pem?:string, manifest_uri?:string }`
Also exports: `SignedC2PAManifest` — narrows `signing_status` to `"signed"`, makes `signature`/`certificate_thumbprint`/`public_key_pem` required non-null strings.
Old v2.0 manifests (missing signing fields) parse correctly — all new fields are optional.

### Output Schemas (all in `src/lib/ai/schemas/`)
- `twitter-output.ts` — tweets[] min 1 max 15, each: `{text≤280, hook, type:contrarian|insight|thread_starter, answer_block?}`, `thread_narrative?`
- `linkedin-output.ts` — posts[] min 1 max 10, each: `{hook, body 800-1200chars, cta, angle, estimated_read_time_seconds?, answer_block?}`; `document_carousel?: {title, slides[{page_number,headline,body,visual_suggestion?}]min3max10, summary}`
- `newsletter-output.ts` — `{subject_line, preview_text?, sections[{heading,content}]min3max5, cta?:{text,context}, estimated_read_time_minutes?}`
- `veo-output.ts` — `{script:{title, hook_seconds 3-7, scenes[{scene_number,duration_seconds,visual_description,voiceover,on_screen_text?}]min5max9, total_duration_seconds 60-90, aspect_ratio:"9:16", style_notes?}}`
- `dark-social-output.ts` — `{slack_message:{hook,body,emoji_prefix}, discord_message:{hook,body,embed_title?}, shareable_quote, context_line}`

---

## AI Layer

### `src/lib/ai/gemini-client.ts`
**Purpose:** Singleton wrapper — all Gemini calls go through here. Never instantiate `GoogleGenerativeAI` elsewhere.

```typescript
interface GenerateOptions<T extends z.ZodTypeAny> {
  agentName: string;
  projectId: string;
  prompt: string;
  schema: T;
  model?: string;  // defaults to process.env.GEMINI_MODEL || "gemini-2.5-flash"
}

async function generateStructured<T extends z.ZodTypeAny>(
  options: GenerateOptions<T>
): Promise<z.infer<T>>
```

**Also exports:**
```typescript
async function generateText(options: {
  prompt: string;
  projectId?: string;
  agentName?: string;
  model?: string;
}): Promise<string>
```
- Calls `checkBudget()` first (unlike `generateStructured` which relies on callers)
- Used by preflight only; same retry logic as `generateStructured`

**Behavior:**
- Uses `responseMimeType: "application/json"` + `responseSchema` from `z.toJSONSchema(schema)`
- `model` override supported on both functions (preflight uses `gemini-2.5-flash` — `gemini-2.5-flash-8b` not available on Vertex for this project)
- Retries on HTTP 429 only: backoff 1s, 2s, 4s (max 3 retries)
- Never retries on `BudgetExceededError` or `ZodError`
- Validates response JSON against Zod schema before return
- Calls `recordCost()` after success (non-blocking)

### `src/lib/ai/prompts/`

| File | Exported function | Key params |
|---|---|---|
| `ingest.ts` | `buildIngestPrompt(sourceType, rawInput)` | sourceType: "url"\|"text"\|"file" |
| `analyze.ts` | `buildAnalyzePrompt(ingested)` | IngestedContent |
| `extract.ts` | `buildExtractPrompt(ingested, analysisScore?)` | Uses score to weight extraction toward unique insights on low-grade content |
| `synthesize.ts` | `buildTwitterPrompt(sko, analysisScore?, refinedFingerprint?)` | All 5 builders accept optional refinedFingerprint to override tone |
| | `buildLinkedInPrompt(sko, analysisScore?, refinedFingerprint?)` | |
| | `buildNewsletterPrompt(sko, analysisScore?, refinedFingerprint?)` | |
| | `buildVeoPrompt(sko, refinedFingerprint?)` | |
| | `buildDarkSocialPrompt(sko, refinedFingerprint?)` | |
| `authenticate.ts` | `buildToneCheckPrompt(sko, outputs)` | Passes hooks/answer_blocks only, not full bodies |
| `score-hooks.ts` | `buildScoreHooksPrompt(sko, outputs)` | Anchors scoring to audience persona |
| `refine-tone.ts` | `buildRefineTonePrompt(originalFingerprint, feedback, platform)` | Strengthens positive markers, doesn't remove negatives |
| `system.ts` | `CONTENT_ARCHITECT_SYSTEM_PROMPT` | Static string |
| | `withSystemPrompt(agentPrompt)` | Prefixes system prompt |

---

## Pipeline Layer (`src/lib/pipeline/`)

### `orchestrator.ts`
```typescript
interface PipelineInput {
  projectId: string;
  mode: "url" | "text" | "file";
  value: string;
}
async function runPipeline(input: PipelineInput): Promise<void>
```
**Flow:** ingest → analyze (fault-tolerant, falls back to NEUTRAL_ANALYSIS_SCORE) → extract → synthesize (5 parallel) → score hooks (fault-tolerant) → authenticate (fault-tolerant) → complete
**Writes status to Firestore at every transition.** On `BudgetExceededError`: sets `budget_exceeded`. On other errors: sets `error`.

### `agent-ingest.ts`
```typescript
async function runIngestionAgent(input: {
  projectId: string; mode: "url"|"text"|"file"; value: string
}): Promise<IngestedContent>
```
Fetches URL via `extractFromUrl()` if mode is "url". Calls `checkBudget()` before Gemini call.

### `agent-analyze.ts`
```typescript
async function runAnalysisAgent(
  projectId: string,
  ingested: IngestedContent
): Promise<InformationGainScore>
```
Returns 5-signal score with grade A-F. Fault-tolerant in orchestrator (falls back to NEUTRAL).

### `agent-extract.ts`
```typescript
async function runExtractionAgent(
  projectId: string,
  ingested: IngestedContent,
  analysisScore?: InformationGainScore
): Promise<SKO>
```
Low-originality content (D/F grade) → prompt weights toward unique/specific insights.

### `agent-synthesize.ts`
```typescript
interface SynthesisOutputs {
  twitter: TwitterOutput | null;
  linkedin: LinkedInOutput | null;
  newsletter: NewsletterOutput | null;
  veo: VeoOutput | null;
  dark_social: DarkSocialOutput | null;
  errors: Record<string, string>;
}
async function runSynthesisAgent(
  projectId: string,
  sko: SKO,
  analysisScore?: InformationGainScore
): Promise<SynthesisOutputs>
```
All 5 platforms run in parallel via `Promise.allSettled()`. One failure does not block others.

### `agent-authenticate.ts`
```typescript
interface AuthenticatorResult {
  toneCheck: ToneCheckResult;
  manifests: Record<string, C2PAManifest>;
}
async function runAuthenticatorAgent(
  projectId: string,
  sko: SKO,
  outputs: SynthesisOutputs
): Promise<AuthenticatorResult>
```
Tone check = AI-powered (costs tokens). C2PA = deterministic SHA-256 (no tokens).

### `agent-score-hooks.ts`
```typescript
async function runHookScoringAgent(
  projectId: string,
  sko: SKO,
  outputs: SynthesisOutputs
): Promise<HookScoreResult>
```
Scores all hooks from all platforms. Generates A/B variants for hooks with composite_score ≥ 0.70. Anchored to `sko.audience_persona`.

### `agent-refine-tone.ts`
```typescript
async function runRefineToneAgent(
  projectId: string,
  originalFingerprint: AdditiveFingerprint,
  feedback: string,
  platform: string
): Promise<AdditiveFingerprint>
```
Returns updated fingerprint with strengthened positive markers. Called during selective regeneration only.

### `regenerate.ts`
```typescript
type SupportedPlatform = "twitter" | "linkedin" | "newsletter" | "veo" | "dark_social"
async function runSelectiveRegeneration(
  projectId: string,
  platform: SupportedPlatform,
  feedback: string
): Promise<void>
```
**Flow:** `updateRegenerationStatus("processing")` → `readSKO()` → `runRefineToneAgent()` → `writeToneRefinement()` → build new prompt → `generateStructured()` → `writeRegeneratedOutput()` → `updateRegenerationStatus("complete")`.
Wrapped in try/catch: on error → `updateRegenerationStatus("error", message)`.

### `c2pa-signer.ts` (Phase 5)
```typescript
async function getOrCreateSigningKey(): Promise<{ privateKeyPem, publicKeyPem, thumbprint }>
// Reads from Firestore system/c2pa_signing_key; generates ECDSA P-256 keypair on first run;
// persists to Firestore; in-memory cached after first load.

async function createSignedManifest(platform: string, outputData: unknown): Promise<C2PAManifest>
// Builds base manifest (SHA-256 content hash, assertions), signs canonical JSON payload
// with ECDSA P-256 via Node.js crypto.sign('sha256', ...), returns manifest with
// signing_status:"signed", signature (base64url), certificate_thumbprint, public_key_pem.
// On any failure: returns manifest with signing_status:"metadata_only", signature:null — never throws.
```
No native dependencies — uses Node.js built-in `crypto` module only. Safe on Cloud Run.

### `c2pa-generator.ts` (Phase 5 — refactored)
```typescript
async function generateC2PAManifest(platform: string, outputData: unknown): Promise<C2PAManifest>
// Thin async wrapper — delegates to createSignedManifest()

async function generateAllC2PAManifests(outputs: SynthesisOutputs): Promise<Record<string, C2PAManifest>>
// Signs all non-null platform outputs in parallel via Promise.all
```
Was sync in V2.0 (plain SHA-256). Now async. `claim_generator` bumped to `"Zapocalypse/3.0"`.

### `input-validator.ts`
```typescript
class InputValidationError extends Error
async function validateUrl(url: string): Promise<void>  // HEAD request, 10s timeout, checks content-type + size
function validateText(text: string): void               // 100-50,000 chars
function validateFile(file: {size,type,name}): void     // <5MB, .txt/.pdf/.docx only
```

### `url-extractor.ts`
```typescript
interface ExtractedArticle { title: string; content: string; author?: string; publishDate?: string }
class UrlExtractionError extends Error
async function extractFromUrl(url: string): Promise<ExtractedArticle>
```
Throws on YouTube URLs. Strips HTML. Validates content length ≥ 100 chars.

---

## Budget Layer (`src/lib/budget/`)

### `tracker.ts`
```typescript
async function checkBudget(): Promise<void>
// Throws BudgetExceededError if: spent >= BUDGET_LIMIT OR killSwitch === true
// Auto-resets spent to 0 if budgetMonth !== current YYYY-MM

async function recordCost(params: {
  projectId: string;
  agentName: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
}): Promise<void>
// Atomically increments budget/current.spent via FieldValue.increment()
```
Constants: `BUDGET_LIMIT = 100`, `BUDGET_DOC_PATH = "budget/current"`

### `pricing.ts`
```typescript
function calculateCost(model: string, promptTokens: number, outputTokens: number): number
```
MODEL_PRICING ($/1M tokens, input/output): **gemini-2.5-flash: $0.15/$0.60** (only Vertex-available model for this project) | gemini-2.0-flash: $0.10/$0.40 | gemini-2.0-flash-lite: $0.075/$0.30 | gemini-1.5-pro: $1.25/$5.00 | gemini-1.5-flash: $0.075/$0.30 | gemini-2.5-flash-8b: $0.04/$0.15

### `refund.ts` (Phase 4)
```typescript
async function processRefund(projectId: string, stage: "full" | "synthesis_only"): Promise<void>
// "full": refunds all cost_log entries
// "synthesis_only": refunds only synthesize_*/score_hooks/authenticate entries
// Atomically decrements budget/current.spent via FieldValue.increment(-amount)
// Never throws — errors are logged so they don't mask the original pipeline error
```
`SYNTHESIS_AGENTS` set: `synthesize_twitter | synthesize_linkedin | synthesize_newsletter | synthesize_veo | synthesize_dark_social | score_hooks | authenticate`

### `kill-switch.ts`
Cloud Function entry point. `handleBillingAlert(pubSubMessage)` → sets `budget/current.killSwitch = true`. Deployed separately; not called by app code.

---

## Auth Layer (`src/lib/auth/`)

### `allowed.ts`
```typescript
export const ALLOWED_EMAIL = "<owner-email>"
// Single source of truth for the allowed client-side email check.
// API routes read from process.env.ALLOWED_USER_EMAIL instead (so it can be rotated without rebuild).
// firestore.rules hardcodes the same value (rules can't read env vars).
```

### `AuthContext.tsx` — `"use client"`
```typescript
type AuthStatus = "loading" | "signed-out" | "signed-in" | "forbidden"

interface AuthContextValue {
  user: User | null;        // firebase/auth User
  status: AuthStatus;
  signIn: () => Promise<void>;   // signInWithPopup + GoogleAuthProvider
  signOut: () => Promise<void>;
}

function AuthProvider({ children }: { children: ReactNode }): JSX.Element
function useAuth(): AuthContextValue   // throws if used outside AuthProvider
```
- `onAuthStateChanged` drives all state — no polling.
- `"forbidden"` fires when `user.email !== ALLOWED_EMAIL`; user is immediately signed out.

### `requireUser.ts` — server-side
```typescript
class ApiAuthError extends Error {
  readonly status: 401 | 403;
}
async function requireAllowedUser(req: Request): Promise<void>
// Reads "Authorization: Bearer <idToken>" header.
// Verifies via getAdminAuth().verifyIdToken().
// Checks decoded.email === process.env.ALLOWED_USER_EMAIL.
// Throws ApiAuthError(401) on missing/invalid token, ApiAuthError(403) on wrong email.
```
Used at the top of both pipeline API routes.

### `authedFetch.ts` — client-side
```typescript
async function authedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>
// Adds "Authorization: Bearer <idToken>" to any fetch call.
// Uses getClientAuth().currentUser.getIdToken().
// Throws if not signed in.
```
Replaces plain `fetch()` in `app/create/page.tsx`, `FeedbackForm.tsx`, `OutputTabs.tsx`.

---

## Firebase Layer (`src/lib/firebase/`)

### `client.ts`
```typescript
function getClientApp(): FirebaseApp
function getClientFirestore(): Firestore   // Client SDK singleton, NEXT_PUBLIC_FIREBASE_* env vars
function getClientAuth(): Auth             // Auth singleton, same app instance
export const googleProvider: GoogleAuthProvider
```

### `admin.ts`
```typescript
function initFirebaseAdmin(): App    // Admin SDK singleton; FIREBASE_SERVICE_ACCOUNT_KEY locally, ADC in App Hosting
function getAdminAuth(): Auth        // firebase-admin/auth singleton — used by requireAllowedUser
```

### `src/lib/firestore/helpers.ts` — All Exported Functions

```typescript
// Project management
projectRef(projectId): DocumentReference
createProject(projectId, sourceType: "url"|"text"|"file"): Promise<void>
updateProjectStatus(projectId, status: PipelineStatus, error?: string): Promise<void>

// Agent output writes (all called by orchestrator after agent returns)
writeAnalysis(projectId, score: InformationGainScore): Promise<void>          // → analysis/current
writeSKO(projectId, sko: SKO): Promise<void>                                  // → sko/current
writeOutputs(projectId, outputs: SynthesisOutputs): Promise<void>             // → outputs/{platform} × 5
writeToneCheck(projectId, result: ToneCheckResult): Promise<void>             // → tone_check/current
writeHookScores(projectId, result: HookScoreResult): Promise<void>            // → hook_scores/current
writeC2PAManifests(projectId, manifests: Record<string, C2PAManifest>)       // → c2pa/{platform}

// Regeneration flow
readSKO(projectId): Promise<SKO | null>                                       // reads sko/current (server-side)
writeToneRefinement(projectId, refinement: Omit<ToneRefinement, "id"|"timestamp">): Promise<void>
  // → tone_history/{auto-id}; JSON round-trip strips undefined AdditiveFingerprint fields
writeRegeneratedOutput(projectId, platform, output): Promise<void>
  // → outputs/{platform} with isRegenerated:true; increments regenerationCount via transaction
updateRegenerationStatus(projectId, platform, status, error?): Promise<void>
  // dot-notation update: regenerationState.{platform}.{status,startedAt,completedAt,error}
getRegenerationCount(projectId, platform): Promise<number>
  // count query on tone_history where platform == platform

// Phase 4 — Fair-Play Credits
interface CostLogEntry { agentName, model, promptTokens, outputTokens, costUsd, timestamp: Timestamp }
getProjectCostLog(projectId): Promise<CostLogEntry[]>              // reads projects/{id}/cost_log ordered by timestamp
markProjectRefunded(projectId, amount, stage: "full"|"synthesis_only"): Promise<void>
  // sets refunded:true, refundedAmount, refundStage; sets skoRetained:true for synthesis_only
getMonthlyRefundTotal(): Promise<number>                           // server-side; sums refundedAmount where refunded==true && updatedAt>=startOfMonth

// Phase 5 — C2PA signing key persistence
readSigningKey(): Promise<{ privateKeyPem, publicKeyPem, thumbprint } | null>  // reads system/c2pa_signing_key
writeSigningKey(keyData: { privateKeyPem, publicKeyPem, thumbprint }): Promise<void>  // writes system/c2pa_signing_key
```

---

### Routing Structure (as of `feat/auth-firestore-rules`)

| Route | File | Description |
|---|---|---|
| `/` | `app/(marketing)/page.tsx` | Public marketing landing page |
| `/dashboard` | `app/dashboard/page.tsx` | Authenticated workspace dashboard |
| `/projects` | `app/projects/page.tsx` | All-projects view (paginated, client-side filtered) |
| `/create` | `app/create/page.tsx` | Create new project |
| `/project/[id]` | `app/project/[projectId]/page.tsx` | Project detail |

### Auth gate layouts (new — all thin `"use client"` wrappers)
- `app/dashboard/layout.tsx` — wraps children in `<AuthGate>`
- `app/create/layout.tsx` — wraps children in `<AuthGate>`
- `app/projects/layout.tsx` — wraps children in `<AuthGate>`
- `app/project/[projectId]/layout.tsx` — wraps children in `<AuthGate>` (covers nested output route too)

The `(marketing)` group has **no gate** — landing page remains publicly accessible.

`AuthProvider` is mounted in `app/layout.tsx` (root, inside `ThemeProvider`) so auth context is available everywhere including marketing pages.

### `app/(marketing)/layout.tsx` — Marketing Layout
Client component. Renders a minimal marketing header (logo with "Built for the creator economy" wordmark + ThemeToggle + "Open app" CTA) and a footer. Uses `BackgroundElements` for ambient orbs. No `AppShell`, no `BudgetIndicator`.

### `app/(marketing)/page.tsx` — Landing Page
Server component. Composes: `Hero`, `Problem`, `Features`, `Output`, `Pricing`, `FAQ` from `src/components/marketing/`.

### `app/dashboard/page.tsx` — Workspace Dashboard
Client component. OpusClip-style layout. Contains "Create something new" banner with `New Project` CTA linking to `/create`. Grid: recent projects (2-col using `ProjectCard`) + sidebar (stats block: completedCount+spent, BudgetMeter, SpendChart). "See all projects" link to `/projects`. Hooks: `useBudget()`, `useRecentProjects(10)`, `useArtifactPreviews(completedIds)`, `useMonthlyRefunds()`.

### `app/projects/page.tsx` — All Projects
Client component. Filter bar (text search + status filter + source type filter). 3-col grid of `ProjectCard`. Load-more button (batches of 50 via `useAllProjects`). Hooks: `useAllProjects(50)`, `useArtifactPreviews(completedIds)`.

### `app/create/page.tsx` — Create Project
Client component. Renders `InputForm`. On submit: POST to `/api/pipeline/run`, navigate to `/project/{projectId}`.

### `app/project/[projectId]/page.tsx` — Project Detail
Client component. Unwraps `params` with React 19 `use()`.
- Loading: skeleton
- Partial-success banner: when `skoRetained && status === "error"` — amber card explaining SKO retained
- Error state: red-bordered card (only when `!skoRetained`)
- Pipeline in progress (`!complete`): `ProgressRing` + collapsible `<details>` containing `AgentProgressPanel`
- After analysis: `ScoreBadge`
- During synthesizing/scoring/authenticating/complete: `OutputTabs` (progressive reveal)
- On complete only: `ToneCheckBadge` above tabs, then `C2PAManifestViewer` below it
- `CostBreakdown` (collapsible) — shown when `status !== "idle"`
- `RefundBadge` — shown when `project.refunded === true`

### `app/loading.tsx` — Global Loading
Static component. Spinner + "Loading…" text. All CSS via `--glass-*` Tailwind classes.

### `app/error.tsx` — Global Error Boundary
Client component. useEffect logs error. "Try again" button calls `reset()`. All CSS via `--glass-*` classes.

### `app/project/[projectId]/error.tsx` — Project Error Boundary
Client component. Back link + error card with retry button. CSS via `--glass-*` classes.

### `app/api/pipeline/run/route.ts`
```
POST body: { mode: "url"|"text"|"file", value: string, fileName?, fileType?, fileSize? }
Returns: 202 { projectId } | 400 (bad input) | 401/403 (auth) | 422 (validation error)
```
Flow: requireAllowedUser → validate → initFirebaseAdmin → createProject → void runPipeline() → 202.

### `app/api/pipeline/regenerate/route.ts`
```
POST body: { projectId: string, platform: SupportedPlatform, feedback: string }
Returns: 202 { status:"processing" } | 400 (invalid) | 401/403 (auth) | 429 (regen cap reached)
```
Constants: `SUPPORTED_PLATFORMS`, `MAX_REGENS_PER_PLATFORM = 3`.
Flow: requireAllowedUser → validate → initFirebaseAdmin → getRegenerationCount → if ≥3 return 429 → void runSelectiveRegeneration() → 202.

---

## Hooks (`src/hooks/`)

| Hook | Signature | Returns | Firestore subscription |
|---|---|---|---|
| `useProject` | `(projectId)` | `{ project: ProjectData\|null, loading, error }` | `onSnapshot` on project doc + `getDocs` for outputs/sko subcollections when status in synthesizing/scoring/authenticating/complete |
| `useOutput` | `(projectId, platform)` | `{ data: DocumentData\|null, loading, error }` | `onSnapshot` on `outputs/{platform}` |
| `useOutputExistence` | `(projectId)` | `{ ready: Platform[], loading }` | `onSnapshot` on entire `outputs/` collection |
| `useArtifactPreviews` | `(projectIds: string[])` | `Record<string, ArtifactPreview>` | `getDoc` (one-shot) — `fetchedRef` prevents re-fetching same set |
| `useHookScores` | `(projectId)` | `{ data: DocumentData\|null, loading }` | `onSnapshot` on `hook_scores/current` |
| `useToneCheck` | `(projectId)` | `{ data: DocumentData\|null, loading }` | `onSnapshot` on `tone_check/current` |
| `useBudget` | `()` | `{ budget: BudgetState\|null, loading }` | `onSnapshot` on `budget/current` |
| `useRecentProjects` | `(count=10)` | `{ projects: ProjectSummary[], loading }` | `onSnapshot` query, ordered by `createdAt` desc |
| `useCopyToClipboard` | `()` | `{ copy(text, id?), isCopied(id?) }` | None — clipboard state only, clears after 2s |
| `useProjectCost` | `(projectId)` | `{ costLog: CostLogEntry[], totalCost, loading, error }` | `onSnapshot` on `projects/{id}/cost_log` ordered by timestamp |
| `useMonthlyRefunds` | `()` | `{ refundedTotal: number, loading }` | `onSnapshot` query on projects where `refunded==true && updatedAt>=startOfMonth` |
| `useC2PAManifest` | `(projectId, platform)` | `{ data: DocumentData\|null, loading }` | `onSnapshot` on `projects/{id}/c2pa/{platform}` — single platform |
| `useC2PAManifests` | `(projectId)` | `{ manifests: Record<string, DocumentData>, loading }` | `onSnapshot` on entire `c2pa/` subcollection — all platforms, max 5 docs |


`ArtifactPreview`: `{ firstTweet?: string (≤100 chars), linkedInHook?: string (≤80 chars), newsletterSubject?: string }`
`CostLogEntry` (client): `{ agentName, model, promptTokens, outputTokens, costUsd, timestamp: Date|null }`

---

## Components

### Auth (`src/components/auth/`)

#### `AuthGate.tsx` — `"use client"`
Props: `{ children: ReactNode }`
Reads `useAuth()`. Three render branches:
- `loading` → centered spinner
- `signed-out` | `forbidden` → full-screen sign-in card (wordmark + Google sign-in button; "not authorized" copy for `forbidden`)
- `signed-in` → renders `{children}`

---

### Layout (`src/components/layout/`)

#### `AppShell.tsx`
Props: `{ children: ReactNode }`
Renders: Header (logo + BudgetIndicator + ThemeToggle + sign-out icon button + "New Project" button) + main content area + BackgroundElements.
Uses `useAuth()` — sign-out button shows avatar/icon when user is signed in; calls `signOut()` on click.

#### `ThemeProvider.tsx`
Provides `ThemeContext: { mode: "light"|"dark", toggleMode() }`.
Hook: `useTheme(): { mode, toggleMode }`.
Persists in localStorage. Hydration-safe (starts "dark", corrects after mount).

### Pipeline (`src/components/pipeline/`)

#### `InputForm.tsx`
Props: `{ onSubmit(input: {mode, value}): Promise<void>, disabled? }`
State: `rawInput`, `file`, `modeOverride`, `loading`, `error`, `dragging`
Auto-detect: `/^https?:\/\/\S+$/` + no newline → "url"; else → "text"; file set → "file".
Features: single textarea, drag-drop file, attach icon button, "Will process as: X" indicator, override Chips.
`onSubmit` contract: `{ mode: InputMode, value: string | File }` — unchanged from V1.

#### `AgentProgressPanel.tsx`
Props: `{ status: PipelineStatus, errorMessage?: string }`
6 agent steps: Ingest (📥), Analyst (🔬), Extract (🧠), Synthesize (✍️), Hook Scorer (🎯), Authenticator (🛡️).
Step states: pending (opacity-30) | active (pulse dot) | done (checkmark) | error (all steps red).

#### `ProgressRing.tsx`
Props: `{ status: PipelineStatus, errorMessage?: string }`
SVG circle r=40. `stroke-dashoffset = circumference * (1 - percent/100)`. CSS transition 0.6s.
Percent map: `idle:0, ingesting:12, analyzing:25, extracting:37, synthesizing:50, scoring:62, authenticating:75, complete:100`. Error states freeze at 37%.

### Output Components (`src/components/output/`)

#### `OutputTabs.tsx`
Props: `{ projectId, outputErrors?: Record<string, string> }`
State: `activeTab: TabKey` ("twitter"|"linkedin"|"newsletter"|"veo"|"dark_social"|"leaderboard"), `nativeView`, `showFeedback`, `retrying: Platform|null`
Hooks: `useProject`, `useOutputExistence`
Progressive reveal: `effectiveTab = useMemo(...)` — if `activeTab` not in `ready`, shows most recently ready platform instead. Pending tabs dim (opacity-30) + pulse dot. Leaderboard gated on twitter ready.
Regen: reads `project.regenerationState[platform]`; shows `RegenerationIndicator` on "processing", error block on "error".
`retrying` state: cleared by a `useEffect` that watches `project.regenerationState` — `setRetrying(null)` has `eslint-disable-next-line react-hooks/set-state-in-effect` because it is a legitimate Firestore subscription response (not a cascading-render pattern the rule targets).
"Not my voice" button: shows when `effectiveTab !== "leaderboard"` && `project.sko` && `!isRegenerating`.
`C2PABadge` rendered below each platform's output content (not on leaderboard tab).

#### `TweetCarousel.tsx`
Props: `{ tweets[], threadNarrative?, isNative?, hookScores?: HookScoreLookup }`
State: `activeIndex` (carousel position)
Actions: per-tweet CopyButton (always visible) + OverflowMenu with DownloadButton.

#### `LinkedInPreview.tsx`
Props: `{ posts[], document_carousel?, isNative?, hookScores? }`
State: `expandedIndex` (accordion)
Actions: per-post CopyButton + "Copy all" CopyButton (always visible) + OverflowMenu with DownloadButton.

#### `NewsletterPreview.tsx`
Props: `{ subjectLine, previewText?, sections[], cta?, estimatedReadTimeMinutes?, isNative? }`
Stateless. Actions: "Copy text" (always visible) + OverflowMenu with "Copy markdown" + DownloadButton.

#### `VeoPreview.tsx`
Props: `{ title, hookSeconds?, scenes[], totalDurationSeconds, aspectRatio, styleNotes? }`
Stateless. Renders timeline bar + scene cards. Actions: "Copy JSON" (always visible) + OverflowMenu with "Copy voiceover" + DownloadButton.

#### `DarkSocialPreview.tsx`
Props: `{ data: DarkSocialData, nativePlatform?: "slack"|"discord"|null }`
Three modes: native Slack, native Discord, or default (Slack card + Discord card + shareable quote card).
One action per section — no OverflowMenu needed.

#### `HookLeaderboard.tsx`
Props: `{ projectId }`
Uses `useHookScores`. Renders ranked hooks (sorted by composite_score desc). Platform pill + grade badge per hook. A/B variants expandable.

#### `HookScoreBadge.tsx`
Props: `{ grade: string, compositeScore: number, dimensions? }`
Inline pill showing grade letter + %. Hover tooltip with 4-dimension breakdown.

#### `ScoreBadge.tsx`
Props: `{ projectId }`
Uses `onSnapshot` on `analysis/current` directly. Renders circular grade, score/10, classification, strongest asset + biggest gap (expandable via ExpandableText).

#### `ToneCheckBadge.tsx`
Props: `{ projectId }`
Uses `useToneCheck`. Pass/fail with match score % + slop flag count.

#### `C2PABadge.tsx` (Phase 5)
Props: `{ projectId, platform }`
Uses `useC2PAManifest(projectId, platform)`. Returns null while loading or if no manifest.
Collapsed: pill — green "Signed credentials" if `signing_status === "signed"`, gray "Content credentials" otherwise.
Expanded (`<details>`): shows creation timestamp, content hash (truncated), model, signing status, cert thumbprint (if signed). DownloadButton → `zapocalypse-content-credential-{platform}.json`.
Not rendered in native preview mode (intentional — native view mimics real platform UI).

#### `C2PAManifestViewer.tsx` (Phase 5)
Props: `{ projectId }`
Uses `useC2PAManifests(projectId)`. Returns null while loading or if no manifests.
`<details>` with glass styling. Summary: shield icon + "Content provenance" + "N/M signed" count.
Expanded: one row per platform — platform label, "Signed"/"Metadata only" status pill, truncated hash, timestamp, individual DownloadButton.
"Download all" button at bottom → `zapocalypse-credentials-all.json` (all platforms combined).
Rendered once on project page after ToneCheckBadge, gated on `status === "complete"`.

#### `FeedbackForm.tsx`
Props: `{ projectId, platform, sko, regenCount, onClose, onSubmitted }`
State: `customFeedback`, `selectedTraits` (Set), `submitting`, `error`
Dynamic pills from `sko.brand_tone_fingerprint` additive fields (null-guarded). Static fallbacks: "More contrarian", "More data-driven", "Warmer tone", "Sharper hooks".
Disables submit at `regenCount >= 3`. Shows "N/3 regenerations remaining". POST to `/api/pipeline/regenerate`. `onSubmitted` called on 202 response.

#### `RegenerationIndicator.tsx`
Props: `{ platform?: string }`
Shows spinning loader + "Regenerating [Platform]..." label.
Also exports: `RegenerationBadge()` — no props, shows "Regenerated (v2)" pill.

#### `CopyButton.tsx`
Props: `{ copied: boolean, onClick: () => void, label?: string }`

#### `DownloadButton.tsx`
Props: `{ content: string, filename: string, mimeType?: string, label?: string }`
Uses `URL.createObjectURL()` + programmatic `<a>` click.

#### `CarouselPreview.tsx`
Props: `{ carousel: { title, slides[], summary } }`
State: `activeSlide`. Navigation pills + copy outline + download .md.

### UI Components (`src/components/ui/`)

#### `Button.tsx`
Props: `ButtonHTMLAttributes & { variant?: "filled"|"tonal"|"outlined"|"text", loading?: boolean }`
ForwardRef. Loading spinner replaces children.

#### `Card.tsx`
Props: `{ children, className?, elevated?: boolean, style? }`
Applies `glass` or `glass-elevated` class.

#### `Chip.tsx`
Props: `{ label: string, selected?: boolean, onClick?, icon?: ReactNode }`
Pill button with selected state highlight.

#### `TextField.tsx`
Props: `{ label, error?, hint?, multiline?, rows? } & (InputHTMLAttributes | TextareaHTMLAttributes)`
ForwardRef. Conditional `<input>` or `<textarea>`.

#### `ProgressIndicator.tsx`
Props: `{ status: PipelineStatus }`
Linear bar with 5 numbered steps. Error state → red fill.

#### `OverflowMenu.tsx`
Props: `{ children: ReactNode }`
"···" button toggles absolute dropdown (`right-0 bottom-full mb-2`). Click-outside handler via `useEffect` + `mousedown` listener on `document`. Children render in `flex flex-col` column.

### Budget Components (`src/components/budget/`)

#### `SpendChart.tsx`
Props: `{ projectIds: string[] }`
State: `data: DaySpend[]`, `loading` — initialised as `projectIds.length > 0` (no sync setState in effect for empty-array early-return).
Queries each project's `cost_log` subcollection individually for current month; aggregates cost by day; renders recharts `BarChart`.

#### `BudgetMeter.tsx`
Props: `{ spent: number, limit: number }`
Renders horizontal fill bar, percentage label, "Kill-switch active" text if applicable.

#### `BudgetIndicator.tsx`
Compact variant used in AppShell header. No props (reads from `useBudget()`). Shows $X/$Y inline, turns red at 95%.

---

## Key Conventions

- **Zod v4:** Use `z.toJSONSchema(schema)` (native). Do NOT import `zod-to-json-schema`.
- **Gemini calls:** Always via `generateStructured()` from `gemini-client.ts`. Always call `checkBudget()` before.
- **Budget:** Check before every agent call. Never retry on `BudgetExceededError`.
- **Firestore writes:** Always via helpers in `src/lib/firestore/helpers.ts`. Never call Firestore APIs directly in components or orchestrators.
- **Auth:** Single-user Google sign-in (`<owner-email>`). `AuthProvider` in root layout; `AuthGate` on all workspace routes (dashboard, create, projects, project). Landing page (`(marketing)`) stays public. API routes verify Bearer ID token via `requireAllowedUser()` before any logic. Admin SDK bypasses Firestore rules — server writes are unaffected. Env var: `ALLOWED_USER_EMAIL` (server-side only, no `NEXT_PUBLIC_`). Firestore rules key on `request.auth.token.email` + `email_verified`.
- **Timestamps:** Always `FieldValue.serverTimestamp()`. Never `new Date()` or `Date.now()`.
- **TypeScript:** Strict mode. No `any`. Narrow `unknown`. All Zod schemas are type source of truth.
- **Components:** `'use client'` only when needed. Server components by default.
- **CSS:** All styling via `--glass-*` CSS vars. No `--md-sys-color-*` vars remain anywhere.
- **Agents are function imports:** Never call `/api/agents/*` internally. Orchestrator imports and calls agent functions directly.
- **ESLint config (`eslint.config.mjs`):** `globalIgnores` excludes `.firebase/**` (build artifacts), `.next/**`, `out/**`, `build/**`. Do not remove `.firebase/**` — it prevents thousands of false errors from minified deploy output.

---

## Project Alignment & Documentation

### `CLAUDE.md`
Primary project brief for **Cursor**, **Claude Code**, and **Gemini**: collaborating-agents overview, `@`-included `.claude/rules/`, slash-command table (including `/sync-vault`, `/wiki-ingest`), skills table, wiki-first + memory rules.

### `GEMINI.md`
Gemini Antigravity entry point: same shared rules as `CLAUDE.md`, plus emulated hooks (typecheck, budget edit guard, destructive-command confirmation). Command table kept in sync with `CLAUDE.md`.

### `.cursor/rules/zapocalypse.mdc`
Committed Cursor rule (`alwaysApply: true`) that binds the IDE agent to root `CLAUDE.md` and `.claude/` — avoids forked Cursor-only policy.

### `.claude/`
Contains shared intelligence for all assistants:
- `commands/`: Definitive workflows (slash commands)
- `memory/`: Phase status, codebase architecture, and decision logs
- `rules/`: Governance for AI integration, Firestore schemas, and pipeline safety
- `skills/`: Reusable engineering mandates (identical to `.gemini/skills/`)

