# Zapocalypse — Content Factory v2.0

**Released:** 2026-03-24
**Scope:** 36 files changed, +1,378 lines
**Commits:** 4 feature commits + merge to `main`

---

## v2.0.1 — Synthesis Reliability Fix (2026-03-24)

**Commit:** `fix: relax synthesis schemas, surface output errors, expand score cards`

### Problem
Twitter and LinkedIn outputs frequently showed "No output generated" despite the pipeline completing successfully. Dark Social threw a runtime crash. Score card text was truncated with no way to read the full content.

### Root Causes & Fixes

**1. Overly strict Zod schemas rejected valid Gemini output**

Gemini reliably targets the requested count but occasionally returns one more or fewer item. `.length(10)` on tweets and `.length(5)` on LinkedIn posts silently dropped the entire output as a Zod validation error.

| Schema | Before | After |
|--------|--------|-------|
| `twitter-output.ts` tweets | `.length(10)` | `.min(1).max(15)` |
| `linkedin-output.ts` posts | `.length(5)` | `.min(1).max(10)` |
| `linkedin-output.ts` carousel slides | `.min(5).max(7)` | `.min(3).max(10)` |
| `answer_block` (both) | `.min(40).max(250)` | `.max(500)` |
| Dark Social hook | `.max(100)` | `.max(300)` |
| Dark Social body | `.max(500)` | `.max(1500)` |
| Dark Social quote/context | `.max(200)` / `.max(100)` | `.max(500)` / `.max(300)` |

Prompt instructions still specify target counts — the schema just doesn't reject near-misses.

**2. Per-platform errors were invisible**

Errors were written to `project.outputErrors` in Firestore but no UI component read them. Users saw only "No output generated" with no explanation.

Fix: `OutputTabs` now accepts `outputErrors?: Record<string, string>`. The "No output generated" panel includes a collapsible **"See why"** link that shows a human-readable translation via `humanizeError()`:

| Raw error | Human-readable |
|-----------|---------------|
| Zod JSON issue array | Field-level message, e.g. "Array must contain at least 1 element(s) (field: tweets)" |
| `"Empty response from Gemini"` | "Gemini returned an empty response. Try running again." |
| `SyntaxError: Unexpected token` | "Gemini returned malformed output that couldn't be parsed." |
| `429` / quota | "Rate limit reached. Wait a moment and try again." |

**3. `DarkSocialPreview` crashed on incomplete data**

Added null guard: if `slack_message` or `discord_message` is missing, renders "Dark Social output is incomplete" instead of throwing a `TypeError`.

**4. Score card text truncated with no escape**

`ExpandableText` component added to `ScoreBadge`. Both "Strongest" and "Biggest gap" cards show 2 lines by default with a "Show more" / "Show less" toggle. Each card tracks its own expanded state independently.

---

## What Changed at a Glance

| Area | v1.0 | v2.0 |
|------|------|------|
| Pipeline agents | 3 (Ingest, Extract, Synthesize) | 5 (+ Analyst, Authenticator) |
| Pipeline states | 6 | 8 (`analyzing`, `authenticating` added) |
| Synthesis outputs | 4 parallel | 5 parallel (+Dark Social) |
| LinkedIn output | 5 posts | 5 posts + Document Carousel (5-7 slides) |
| Tweet types | contrarian, insight, thread-starter | + `answer_block` per tweet (GEO) |
| Trust layer | None | C2PA manifests + tone fingerprint check |
| Originality scoring | None | 5-signal grade A-F per content piece |
| UI progress view | 4-step ProgressIndicator | 5-agent AgentProgressPanel |
| Score display | None | ScoreBadge (SVG radial, spring pop-in) |
| Animations | CSS transitions | CSS spring physics via `linear()` |
| Cost per run | ~$0.012 | ~$0.018 (+50%) |

---

## Phase 1 — The Analyst Agent

### What It Does

Before extracting the SKO, the Analyst scores the source content on 5 originality signals. The score enriches all downstream agents — the Extractor prioritizes high-originality chunks, and the Synthesizer applies fallback strategies for low-scoring content (e.g., higher contrarian tweet ratio).

### The 5 Originality Signals

| Signal | What It Measures |
|--------|-----------------|
| `proprietary_data` | First-party stats, original research, exclusive surveys |
| `first_person_specificity` | "I built X in Y context" vs generic third-person advice |
| `verifiable_claims` | Named sources, citations, checkable facts |
| `non_obvious_conclusions` | Insights that contradict conventional wisdom |
| `depth_score` | Nuance and specificity vs surface-level overview |

Each signal is scored 0-10 with evidence (a quote from the source) and a recommendation for how to strengthen it.

### Output: `InformationGainScore`

```typescript
interface InformationGainScore {
  overall_score: number;        // 0-10
  grade: "A" | "B" | "C" | "D" | "F";
  signals: OriginalitySignal[]; // exactly 5
  content_classification:
    | "original_research"
    | "expert_commentary"
    | "curated_synthesis"
    | "derivative_rehash"
    | "generic_advice";
  strongest_asset: string;
  biggest_gap: string;
  enrichment_suggestions: string[]; // 1-5 items
}
```

**Firestore path:** `projects/{id}/analysis/current` (written once, never updated)

### Fault Tolerance

The Analyst is **non-fatal**. If Gemini fails or Zod validation errors, the pipeline continues with `NEUTRAL_ANALYSIS_SCORE` (grade "C", all signals at 5/10). `BudgetExceededError` is re-thrown and terminates the pipeline normally.

```typescript
// orchestrator.ts — inner try-catch pattern
let analysisScore: InformationGainScore = NEUTRAL_ANALYSIS_SCORE;
try {
  analysisScore = await runAnalysisAgent(projectId, ingested);
  await writeAnalysis(projectId, analysisScore);
} catch (err) {
  if (err instanceof BudgetExceededError) throw err; // propagate to outer handler
  pipelineLogger.warn({ projectId, agent: "analyze", error: err.message });
}
```

### Downstream Effects

- **Extract prompt** (`src/lib/ai/prompts/extract.ts`): Receives the score. For D/F grades, prepends: "WARNING: Low information gain detected. Prioritize any first-person specifics and verifiable claims above all other content."
- **Twitter prompt**: Increases contrarian ratio from 3/10 to 5/10 for grade D/F.
- **LinkedIn prompt**: Adds note that `answer_blocks` should acknowledge "original angle needed" for D/F grades.

### New Files

| File | Description |
|------|-------------|
| `src/lib/ai/schemas/information-gain.ts` | `InformationGainScoreSchema` + `NEUTRAL_ANALYSIS_SCORE` constant |
| `src/lib/ai/prompts/system.ts` | `CONTENT_ARCHITECT_SYSTEM_PROMPT` master persona + `withSystemPrompt()` wrapper |
| `src/lib/ai/prompts/analyze.ts` | `buildAnalyzePrompt()` with full scoring rubric (what 2/5/8 looks like per signal) |
| `src/lib/pipeline/agent-analyze.ts` | `runAnalysisAgent(projectId, ingested)` — budget check → Gemini call → return |

---

## Phase 2 — The GEO Strategist

### What Is GEO?

Generative Engine Optimization (GEO) is the practice of formatting content so AI search engines (Perplexity, SearchGPT, Gemini in Search) can cite it directly. The key mechanism: **answer blocks** — self-contained 40-60 word summaries that read as standalone answers to implicit questions.

### Answer Blocks

Every tweet and LinkedIn post now includes an `answer_block`:

```typescript
// Example tweet answer_block
"Container queries solve the fundamental problem of component-based responsive design:
a component should respond to its container width, not the viewport. This eliminates
the need for parent-aware CSS and makes components truly portable across layouts."
```

Answer blocks are stored in Firestore alongside the content and displayed in the UI as a collapsible "GEO Answer Block" card below each piece.

### New Output: Dark Social

A 5th synthesis platform optimized for peer-to-peer sharing in private channels:

```typescript
interface DarkSocialOutput {
  slack_message: {
    hook: string;         // ≤100 chars
    body: string;         // ≤500 chars
    emoji_prefix: string; // e.g. "📊"
  };
  discord_message: {
    hook: string;
    body: string;
    embed_title?: string;
  };
  shareable_quote: string;  // ≤200 chars — blockquote-ready
  context_line: string;     // ≤100 chars — "here's why this matters"
}
```

**Firestore path:** `projects/{id}/outputs/dark_social`

### New Output: LinkedIn Document Carousel

LinkedIn now returns a Document Carousel alongside the 5 posts — a structured outline for a PDF "swipe" post:

```typescript
interface LinkedInCarousel {
  title: string;
  slides: Array<{
    page_number: number;
    headline: string;
    body: string;
    visual_suggestion?: string;
  }>; // 5-7 slides
  summary: string;
}
```

### Schema Changes (Backward Compatible)

All new fields use `.optional()` — existing Firestore documents validate without them:

| Schema | Change |
|--------|--------|
| `twitter-output.ts` | `tweet.type` now includes `"contrarian"`; `answer_block?: string` added |
| `linkedin-output.ts` | `answer_block?: string` on posts; `document_carousel?` on output |
| `dark-social-output.ts` | NEW — full DarkSocialSnippetSchema |

### Synthesis Agent: 4 → 5 Parallel Outputs

```typescript
// agent-synthesize.ts
const [twitterResult, linkedinResult, newsletterResult, veoResult, darkSocialResult] =
  await Promise.allSettled([
    generateStructured(buildTwitterPrompt(sko, analysisScore), TwitterOutputSchema),
    generateStructured(buildLinkedInPrompt(sko, analysisScore), LinkedInOutputSchema),
    generateStructured(buildNewsletterPrompt(sko, analysisScore), NewsletterOutputSchema),
    generateStructured(buildVeoPrompt(sko), VeoOutputSchema),
    generateStructured(buildDarkSocialPrompt(sko), DarkSocialSnippetSchema), // NEW
  ]);
```

One platform failing never blocks others — the `Promise.allSettled` pattern is unchanged.

### New UI Components

| Component | Description |
|-----------|-------------|
| `DarkSocialPreview.tsx` | Slack/Discord message cards with copy buttons + shareable quote blockquote |
| `CarouselPreview.tsx` | Slide navigator for LinkedIn Document Carousel with download as JSON |

---

## Phase 3 — The Authenticator Agent

### What It Does

Runs **after synthesis**, before `complete`. Two independent tasks:
1. **Tone Fingerprint Check** — Gemini call comparing all outputs against the SKO's `brand_tone_fingerprint`
2. **C2PA Manifest Generation** — deterministic, zero-cost, uses Node `crypto`

### Tone Fingerprint Check

The SKO already extracts a `brand_tone_fingerprint` from the source content during extraction. The Authenticator uses this fingerprint to evaluate each output:

```typescript
interface ToneCheckResult {
  overall_match_score: number; // 0-1
  per_platform: Record<string, {
    match_score: number;
    deviations: string[];
    suggested_fixes: string[];
  }>;
  ai_slop_flags: Array<{
    platform: string;
    item_index: number;
    pattern: string;     // e.g. "In today's fast-paced world..."
    severity: "low" | "medium" | "high";
    suggestion: string;
  }>;
  passed: boolean; // true if overall_match_score >= 0.7 AND no high-severity slop
}
```

**AI slop patterns detected:** generic openers ("In today's fast-paced world"), excessive hedging ("It's important to note that"), corporate filler ("leverage", "synergy", "at the end of the day"), formulaic closers ("The future of X is Y").

**Token efficiency:** The Authenticator prompt passes only hooks and answer_blocks (not full post bodies) — keeping input under ~8k tokens. Full bodies would push this to 30k+.

**Firestore path:** `projects/{id}/tone_check/current`

### C2PA Manifests

C2PA (Coalition for Content Provenance and Authenticity) is an open standard for content credentials. v2.0 implements the metadata layer without cryptographic signing (deferred to v3):

```typescript
interface C2PAManifest {
  claim_generator: "Zapocalypse/2.0";
  tool_used: {
    name: "Zapocalypse Content Factory";
    version: "2.0.0";
    model: string; // e.g. "gemini-2.5-flash"
  };
  creator_identity: { type: "anonymous_app_user" };
  content_credentials: {
    creation_timestamp: string; // ISO 8601
    content_hash: string;       // SHA-256 of the output JSON
    do_not_train: true;         // always true
    ai_generated: true;         // always true
  };
  assertions: Array<{ label: string; data: Record<string, unknown> }>;
}
```

The `content_hash` is a SHA-256 digest of the serialized output JSON — deterministic, reproducible, zero Gemini cost:

```typescript
// c2pa-generator.ts
import { createHash } from "crypto";

function hashOutput(data: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}
```

**Firestore path:** `projects/{id}/c2pa/{platform}` (one manifest per platform)

### Fault Tolerance

Identical pattern to the Analyst — non-fatal, `BudgetExceededError` re-throws:

```typescript
try {
  const authResult = await runAuthenticatorAgent(projectId, sko, outputs);
  await writeToneCheck(projectId, authResult.toneCheck);
  await writeC2PAManifests(projectId, authResult.manifests);
} catch (err) {
  if (err instanceof BudgetExceededError) throw err;
  pipelineLogger.warn({ projectId, agent: "authenticate", error: err.message });
}
// Pipeline always reaches updateProjectStatus(projectId, "complete")
```

### New UI Components

| Component | Description |
|-----------|-------------|
| `ToneCheckBadge.tsx` | Advisory pass/fail badge — shows match score %, slop flag count. Uses `useToneCheck` hook. |
| `C2PABadge.tsx` | Content credentials indicator with SVG shield icon |
| `src/hooks/useToneCheck.ts` | `onSnapshot` listener for `tone_check/current` |

---

## Phase 4 — UI/UX

### AgentProgressPanel

Replaces the compact 4-step `ProgressIndicator` on the project page with a detailed 5-agent view:

```
📥  Ingest         Parsing source content          ✓
🔬  Analyst        Scoring originality (5 signals)  ◌ ← active (spinner + pulse dot)
🧠  Extract        Building Structured Knowledge Object
✍️  GEO Strategist Generating 5 platform outputs
🔐  Authenticator  Tone check + C2PA credentials
```

Each row shows:
- **Pending:** 30% opacity, dimmed icon
- **Active:** Accent background tint, spinning border ring, pulsing dot
- **Done:** 60% opacity, `✓` checkmark in accent color
- **Error:** `✗` in danger color

### ScoreBadge

Reads from `projects/{id}/analysis/current` via `onSnapshot`. Appears as soon as the Analyst writes to Firestore — before synthesis completes.

**Design:**
- SVG `stroke-dasharray` circle fill mapping score (0-10) to 0-360° arc
- Grade letter (A-F) centered inside the circle
- Color by grade: A=`#34c759` (green), B=`#007aff` (blue), C=`#ffd60a` (yellow), D=`#ff9f0a` (orange), F=`#ff453a` (red)
- Spring pop-in animation: `scale(0.92) → scale(1)` with `--spring-bouncy` timing

```tsx
// ScoreBadge.tsx — animation trigger
style={{
  opacity: visible ? 1 : 0,
  transform: visible ? "scale(1)" : "scale(0.92)",
  animationTimingFunction: "var(--spring-bouncy, ease-out)",
  transition: "all 500ms",
}}
```

### Spring Animation System

No new dependencies — all spring physics implemented via CSS `linear()` timing function:

```typescript
// src/lib/theme/motion.ts
export const springs = {
  snappy:  "linear(0, 0.009, 0.035 2.1%, ... 1)",  // ~200ms, for buttons/toggles
  gentle:  "linear(0, 0.006, 0.025 2.8%, ... 1)",  // ~400ms, for card reveals
  bouncy:  "linear(0, 0.004, 0.016, ... 1.25, ... 1)", // ~600ms, for badges
} as const;
```

**CSS custom properties** defined in `app/globals.css`:
```css
:root {
  --spring-snappy: linear(...);
  --spring-gentle: linear(...);
  --spring-bouncy: linear(...);
}
```

**Utility classes:**
```css
.animate-card-reveal  { animation: card-reveal  0.5s var(--spring-gentle) both; }
.animate-badge-pop    { animation: badge-pop    0.4s var(--spring-bouncy) both; }
.animate-slide-in     { animation: slide-in-right 0.3s var(--spring-snappy) both; }
```

---

## Architecture Deep Dive

### The Master System Prompt

All new agent prompts wrap through `withSystemPrompt()` from `src/lib/ai/prompts/system.ts`. This establishes the "Content Architect" persona before each agent's specific instructions:

```
You are The Content Architect — an AI system that transforms long-form content
into high-performing, platform-native outputs.

## Your Pipeline
1. ANALYST — Scores originality across 5 signals...
2. EXTRACTOR — Builds a SKO weighted by originality scores...
3. GEO STRATEGIST — Optimized for human engagement AND AI search citation...
4. AUTHENTICATOR — Validates tone consistency, detects AI slop...
```

This ensures all agents share consistent persona, rules, and fallback behavior when receiving a single-agent prompt.

### Updated Firestore Schema

```
projects/{id}
  status: "idle" | "ingesting" | "analyzing" | "extracting"
        | "synthesizing" | "authenticating" | "complete"
        | "error" | "budget_exceeded"
  agentTimings: { ingest?, analyze?, extract?, synthesize?, authenticate? }

projects/{id}/analysis/current
  → InformationGainScore (written by Analyst, read by ScoreBadge)

projects/{id}/outputs/twitter
projects/{id}/outputs/linkedin     ← now includes document_carousel
projects/{id}/outputs/newsletter
projects/{id}/outputs/veo
projects/{id}/outputs/dark_social  ← NEW

projects/{id}/tone_check/current   ← NEW (ToneCheckResult)
projects/{id}/c2pa/{platform}      ← NEW (C2PAManifest × 5)
```

### Token Budget per Run (v2.0)

| Agent | Input tokens | Output tokens | Cost (`gemini-2.5-flash`) |
|-------|-------------|---------------|--------------------------|
| Ingest | ~4,000 | ~2,000 | $0.0018 |
| **Analyst** (new) | ~5,000 | ~1,500 | $0.0017 |
| Extract | ~6,000 | ~3,000 | $0.0027 |
| Synth: Twitter | ~3,500 | ~2,500 | $0.0020 |
| Synth: LinkedIn | ~3,500 | ~4,000 | $0.0029 |
| Synth: Newsletter | ~3,000 | ~2,000 | $0.0017 |
| Synth: Veo | ~3,000 | ~1,500 | $0.0014 |
| **Synth: Dark Social** (new) | ~3,000 | ~1,000 | $0.0011 |
| **Authenticator tone check** (new) | ~8,000 | ~2,000 | $0.0024 |
| C2PA generation | 0 (Node crypto) | — | $0.0000 |
| **Total** | **~39,000** | **~19,500** | **~$0.018** |

v1.0 was ~$0.012/run. v2.0 is ~$0.018/run (+50%). At $100/mo, ~5,500 runs are supported.

### Backward Compatibility

All v2.0 schema additions are `.optional()`. Existing Firestore documents (from v1.0) pass Zod validation without any migration. UI components guard new fields with `if (field)` before rendering:

```tsx
{tweet.answer_block && (
  <div className="mt-3 p-3 rounded-lg bg-[var(--glass-bg-secondary)] text-xs">
    <p className="font-medium text-[var(--glass-text-tertiary)] mb-1">GEO Answer Block</p>
    <p className="text-[var(--glass-text-secondary)]">{tweet.answer_block}</p>
  </div>
)}
```

### Pipeline Safety: BudgetExceededError Propagation

The inner try-catch in the orchestrator explicitly re-throws `BudgetExceededError`:

```typescript
try {
  analysisScore = await runAnalysisAgent(projectId, ingested);
} catch (err) {
  if (err instanceof BudgetExceededError) throw err; // ← reaches outer catch → sets status to "budget_exceeded"
  // other errors are swallowed here (non-fatal)
}
```

This ensures the 4-layer budget protection system is never bypassed, even by fault-tolerant agents.

---

## New Files Reference

```
src/lib/ai/schemas/
  information-gain.ts      InformationGainScoreSchema + NEUTRAL_ANALYSIS_SCORE
  dark-social-output.ts    DarkSocialSnippetSchema
  tone-check.ts            ToneCheckResultSchema
  c2pa-manifest.ts         C2PAManifestSchema

src/lib/ai/prompts/
  system.ts                CONTENT_ARCHITECT_SYSTEM_PROMPT + withSystemPrompt()
  analyze.ts               buildAnalyzePrompt()
  authenticate.ts          buildToneCheckPrompt()

src/lib/pipeline/
  agent-analyze.ts         runAnalysisAgent()
  agent-authenticate.ts    runAuthenticatorAgent()
  c2pa-generator.ts        generateC2PAManifest() + generateAllC2PAManifests()

src/hooks/
  useToneCheck.ts          onSnapshot for tone_check/current

src/components/output/
  DarkSocialPreview.tsx    Slack/Discord/quote preview
  CarouselPreview.tsx      LinkedIn carousel slide navigator
  ScoreBadge.tsx           SVG radial grade badge
  ToneCheckBadge.tsx       Advisory tone check pass/fail
  C2PABadge.tsx            Content credentials indicator

src/components/pipeline/
  AgentProgressPanel.tsx   5-agent status rows

src/lib/theme/
  motion.ts                CSS linear() spring presets
```

---

## Future Work (v3 Candidates)

- **True C2PA signing** — cryptographic certificate authority integration
- **Persistent brand voice** — store user-defined brand voice profile in `users/{id}/brand_voice` (not per-content extraction)
- **Rewrite suggestions** — surface Authenticator's `suggested_fixes` as inline edit suggestions
- **Score history** — track `InformationGainScore` over time per user to measure content improvement
- **Veo API integration** — actual video generation (currently script JSON only)
