---
name: decisions
description: Log of architectural and product decisions made during development
type: project
---

# Decisions Log

## 2026-03-22

### Use `@google/genai` SDK (not Firebase AI Logic SDK)
**Decision:** Use `@google/genai` with Vertex AI directly, not the Firebase AI Logic client SDK.
**Why:** More control over structured output (`responseSchema`), batching, and model versioning. Firebase AI Logic wraps Gemini but adds abstraction we don't need.
**How to apply:** All AI calls via `src/lib/ai/gemini-client.ts`. Do not use `firebase/ai` imports.

### Hub-and-Spoke via SKO
**Decision:** All 4 platform outputs are derived from a single Structured Knowledge Object (SKO), not directly from the raw input.
**Why:** Consistency across platforms, semantic deduplication, and enables future platform additions without re-processing the source.
**How to apply:** Agent 2 must always produce a valid SKO. Agent 3 takes SKO as input, never raw content.

### Agents as Function Imports
**Decision:** Pipeline agents (ingest, extract, synthesize) are TypeScript functions called directly by the orchestrator — not HTTP route handlers called internally.
**Why:** Eliminates cold-start latency between steps, simpler error propagation, easier to test in isolation.
**How to apply:** `orchestrator.ts` imports and calls agent functions. The API routes (`/api/agents/*`) are thin wrappers for external triggering only.

### Removed `tailwind-material-colors`, CSS-first M3 theming
**Decision:** Do not use `tailwind-material-colors` plugin. Inject M3 colors as CSS custom properties at runtime, reference them in Tailwind v4 `@theme` block.
**Why:** `tailwind-material-colors` requires `tailwind.config.ts` which doesn't exist in Tailwind v4. Tailwind v4 is CSS-first — no plugin system.
**How to apply:** `ThemeProvider` uses `@material/material-color-utilities` → sets `--md-sys-color-*` vars on `<html>`. `globals.css` `@theme` maps them to Tailwind utilities.

### Added `@extractus/article-extractor` for URL ingestion
**Decision:** Use `@extractus/article-extractor` to fetch and extract article content from URLs.
**Why:** Agent 1 needs structured article text, not raw HTML. This library handles extraction cleanly.
**How to apply:** Used in `src/lib/pipeline/url-extractor.ts`. YouTube URLs deferred for MVP.

### Fire-and-forget pipeline pattern
**Decision:** `/api/pipeline/run` returns `202 Accepted` immediately; orchestrator runs as non-awaited async function.
**Why:** Pipeline takes 30-120s. Cloud Run default timeout is 60s. Client watches Firestore via `onSnapshot` — doesn't need the HTTP response.
**How to apply:** `apphosting.yaml` sets `timeoutSeconds: 300` as backup. Route creates Firestore doc, kicks off orchestrator without `await`, returns `{ projectId }`.

### Added `IngestedContent` as Agent 1 → Agent 2 contract
**Decision:** Agent 1 returns a typed `IngestedContent` object, not raw text. Agent 2 consumes `IngestedContent`.
**Why:** Without a schema, Agent 2 has no reliable structured input and prompt engineering becomes fragile.
**How to apply:** `src/lib/ai/schemas/ingested-content.ts` defines the Zod schema. Both agents import it.

### Budget uses per-call `usageMetadata` tracking
**Decision:** After each Gemini call, read `response.usageMetadata`, calculate cost, atomically increment `budget/current.spent` via Firestore `FieldValue.increment()`.
**Why:** The Cloud Billing Alert at $95 is a blunt instrument — it fires on total GCP spend, not per-pipeline. Need granular per-call tracking.
**How to apply:** `src/lib/budget/pricing.ts` maps model names to per-token costs. `gemini-client.ts` calls tracker after every response.

### Use Zod v4 native `z.toJSONSchema()` instead of `zod-to-json-schema`
**Decision:** Use `z.toJSONSchema(schema)` built into Zod v4 instead of the `zod-to-json-schema` package.
**Why:** `zod-to-json-schema` v3.25.1 imports from `zod/v3` internally — causes TypeScript type mismatch with Zod v4's type system. Zod v4 ships native JSON Schema export.
**How to apply:** In `gemini-client.ts`, call `z.toJSONSchema(schema)` directly. Do not import `zodToJsonSchema` from `zod-to-json-schema`.

### `@google/genai` API shape (`config` not `generationConfig`, `text` is a getter)
**Decision:** Document the actual API shape of `@google/genai` v1+.
**Why:** SDK changed from training data — `generationConfig` no longer exists; use `config: { responseMimeType, responseSchema }`. `response.text` is a getter (no `()` call).
**How to apply:** In `callGemini()`, pass `config: { ... }` not `generationConfig: { ... }`. Read `response.text` as a property, not a method.

### Switched from Vertex AI to Google AI API key for Gemini (superseded 2026-04-12)
**Decision:** ~~Use `GEMINI_API_KEY` with `new GoogleGenAI({ apiKey })`.~~ **SUPERSEDED** — see entry below.

### Migrated back to Vertex AI (hard cutover, 2026-04-12)
**Decision:** Use `new GoogleGenAI({ vertexai: true, project, location })`. No `GEMINI_API_KEY`. Auth via ADC.
**Why:** `GEMINI_API_KEY` was committed plaintext in `apphosting.yaml` (compromised). Vertex AI uses the runtime service account — no shared key to leak. Also required for Phase 6 (Multimodal/Veo), which needs the Vertex endpoint. `us-central1` used; same `@google/genai` SDK, identical `client.models.generateContent` surface.
**How to apply:** `gemini-client.ts` reads `GOOGLE_CLOUD_PROJECT` + `GOOGLE_CLOUD_LOCATION`. App Hosting SA must have `roles/aiplatform.user`. Local dev: `gcloud auth application-default login`. `GEMINI_API_KEY` removed from all configs; old key should be disabled in GCP console.

### NEXT_PUBLIC_* vars must be in apphosting.yaml
**Decision:** All `NEXT_PUBLIC_FIREBASE_*` vars must be declared in `apphosting.yaml` with `availability: [BUILD, RUNTIME]`.
**Why:** `.env.local` is local-only and not available during App Hosting cloud builds. `NEXT_PUBLIC_` vars are inlined at build time — missing at build = `undefined` in production.
**How to apply:** Any new `NEXT_PUBLIC_` var must be added to both `.env.local` AND `apphosting.yaml`.

### Use gemini-2.5-flash (not 2.0) for new API keys
**Decision:** Model is `gemini-2.5-flash`. `gemini-2.0-flash` and `gemini-2.0-flash-lite` are not available to new Google AI API keys.
**Why:** Google deprecated 2.0 models for new users. `gemini-2.5-flash` verified working.
**How to apply:** `GEMINI_MODEL=gemini-2.5-flash` in all env configs. Pricing: `$0.15/1M` input, `$0.60/1M` output.

### Skills Installed Locally
**Decision:** Skills installed to `.claude/skills/` (project-local), not `~/.claude/skills/` (global).
**Why:** Prevent contamination of other projects. All 243 previously global skills were removed.
**Skills installed:** next-best-practices, next-cache-components, nextjs-app-router-patterns, react-best-practices (via vercel-react-best-practices), tailwind-design-system, design-system-patterns, typescript-advanced-types, firebase-ai-logic, genkit, frontend-design, web-design-guidelines.

---

## 2026-03-24 — Content Factory v2.0

### New pipeline states: `analyzing` and `authenticating` are non-fatal
**Decision:** Analyst and Authenticator agents are wrapped in inner try-catch inside the orchestrator. Failures are logged and skipped; `BudgetExceededError` is re-thrown to the outer handler.
**Why:** These are quality-enhancement agents, not gates. Synthesis outputs are already written before the Authenticator runs. A Gemini error here should not fail the whole pipeline.
**How to apply:** Always re-throw `BudgetExceededError` inside inner agent try-catch blocks. Use `NEUTRAL_ANALYSIS_SCORE` as the fallback when Analyst fails.

### Analyst fallback is `NEUTRAL_ANALYSIS_SCORE`, not `undefined`
**Decision:** On Analyst failure, use `NEUTRAL_ANALYSIS_SCORE` (grade "C", all signals at 5/10) rather than `undefined | null`.
**Why:** Downstream agents (Extract, Synthesize) accept `InformationGainScore` not optional. Using a neutral score avoids TypeScript conditional guards throughout the pipeline.
**How to apply:** `NEUTRAL_ANALYSIS_SCORE` exported from `src/lib/ai/schemas/information-gain.ts`. Import it in orchestrator.

### C2PA = metadata-only for v2.0, no cryptographic signing
**Decision:** C2PA manifests include SHA-256 hash of output JSON, `do_not_train: true`, `ai_generated: true`, tool info. No certificate authority or cryptographic signing.
**Why:** No official C2PA signing library for Node.js. Metadata-only approach is still valuable for provenance tracking. Document as "C2PA-inspired" — true signing deferred to v3.
**How to apply:** `c2pa-generator.ts` uses Node `crypto` only. Zero cost. Stored at `projects/{id}/c2pa/{platform}`.

### Tone check is advisory only — never blocks pipeline completion
**Decision:** Tone check result is displayed as a badge (pass/fail + match score %). Pipeline always marks `complete` regardless of tone check result.
**Why:** Outputs are already in Firestore before the Authenticator runs. Blocking on tone check would be a regression for the user experience.
**How to apply:** `ToneCheckBadge` reads from Firestore and shows advisory state. No pipeline gating on tone check score.

### Brand color stored in `localStorage` globally
**Decision:** User-configured brand color stored as `localStorage("zapocalypse-brand-color")`. Applies globally (not per-project).
**Why:** Simplest approach with no Firestore reads needed. User rarely changes their brand color.
**How to apply:** `ThemeProvider` reads from localStorage on mount and applies M3 palette. Settings UI in AppShell header.

### Authenticator prompt uses hooks/answer_blocks only, not full output bodies
**Decision:** `buildToneCheckPrompt()` passes only tweet hooks, LinkedIn hooks, newsletter subject/preview, and answer_blocks — not full post bodies.
**Why:** Full bodies would push the Authenticator input to 30k+ tokens. Hooks + answer_blocks are sufficient for slop detection and tone fingerprinting.
**How to apply:** Extract `hook` and `answer_block` fields from outputs before building the tone check prompt. Estimate: ~8k input tokens.

### Zod schemas use min/max ranges, never exact `.length()` for AI outputs
**Decision:** All array schemas use `.min(n).max(m)` ranges, not `.length(n)`. String schemas use only `.max()`, never `.min()` for optional creative fields.
**Why:** Gemini reliably targets the requested count but occasionally returns one more or fewer. An exact `.length(10)` silently rejects the entire output with a Zod error, leaving the user with "No output generated." Ranges accept valid near-target responses.
**How to apply:** Twitter: `min(1).max(15)`, LinkedIn posts: `min(1).max(10)`, carousel slides: `min(3).max(10)`, `answer_block`: no minimum. Prompt instructions still specify the target count — schema just doesn't reject near-misses.

### Per-platform synthesis errors are surfaced via "See why" in OutputTabs
**Decision:** `OutputTabs` accepts `outputErrors?: Record<string, string>` from `project.outputErrors` and shows a collapsible "See why" under "No output generated" with a human-readable message.
**Why:** Errors were written to `project.outputErrors` in Firestore but never displayed — users had no way to know why a platform failed or whether to retry.
**How to apply:** `humanizeError()` in `OutputTabs.tsx` translates raw Zod/Gemini errors into plain English. Add `outputErrors={project?.outputErrors}` wherever `<OutputTabs>` is rendered.

### Spring animations via CSS `linear()` — no framer-motion

**Decision:** All spring animations use CSS `animation` with `linear()` timing function presets from `src/lib/theme/motion.ts`.
**Why:** Zero runtime JS overhead. No new dependency. `linear()` can approximate spring physics accurately with enough keypoints. Framer Motion adds ~30KB to the bundle.
**How to apply:** Apply via `animationTimingFunction: "var(--spring-bouncy)"` in inline styles, or `.animate-card-reveal` / `.animate-badge-pop` / `.animate-slide-in` CSS classes.

---

## 2026-03-28 — V3 Architecture Decisions (Expert Critique)

### Additive tone fingerprinting — positive linguistic markers, not slop filters
**Decision:** V3's SKO extraction must map *positive* linguistic traits (analogy style, sentence cadence on a spectrum, signature phrases, storytelling structure, humor type, niche colloquialisms) stored in an enriched `brand_tone_fingerprint`. Reflexion feedback buttons must offer dynamic positive options derived from the fingerprint, not generic negative options like "too formal".
**Why:** Purely subtractive prompting (filtering slop) is architecturally inefficient for LLMs — it zeros out token probabilities but doesn't guide the attention mechanism toward the creator's unique voice. The result is content that offends no one and excites no one. Positive markers give the model a target to hit.
**How to apply:** SKO extraction prompt (`src/lib/ai/prompts/extract.ts`) must explicitly instruct Gemini to categorize traits. Use spectrum categorization for cadence (low/medium/high) — LLMs categorize well, they count poorly. Never ask Gemini to count words/syllables. `FeedbackForm.tsx` buttons pull from user's `brand_tone_fingerprint`, not a static negative list.

### Tiered refund logic — decouple extraction cost from synthesis cost
**Decision:** The fair-play credit refund must be stage-aware. If synthesis fails but extraction succeeded: refund only the synthesis cost, retain the SKO as a user-owned asset, and surface a "Regenerate for fewer credits" UI. Only refund the full project cost if the pipeline fails during ingest/extract (before any value is created).
**Why:** Heavy multimodal extraction (10 vision frames, audio transcription) is the most expensive operation in the pipeline. If a cheap downstream synthesis step fails, blanket refunding eats the entire extraction cost — the "token trap." This destroys compute margins at scale and doesn't improve user experience (the time cost is identical whether credits are refunded or not).
**How to apply:** `src/lib/budget/refund.ts` must implement stage-aware logic. `orchestrator.ts` tracks which stage failed. SKO retained at `projects/{id}/sko` when synthesis fails. `SKOAssetCard` UI shows the partial success state. `refundStage: "full" | "synthesis_only"` tracked on project doc.

### Pre-flight validation before heavy extraction
**Decision:** For expensive inputs (video files, large documents), run a mandatory lightweight pre-flight check using `gemini-2.5-flash-8b` before committing to the full extraction. Check: (a) file is parseable, (b) actual human dialogue present, (c) content has substance. Reject silent screen recordings, corrupted uploads, and empty content *before* deducting the full high-tier credit.
**Why:** Bad inputs (corrupted video, silent screen recording, empty document) trigger expensive API calls that deliver zero value and cannot be refunded via tiered logic because the extraction itself spent real tokens. Pre-flight costs ~$0.0001 vs $0.018+ for full video extraction.
**How to apply:** `src/lib/pipeline/preflight.ts` — pass transcript header or single middle frame to `gemini-2.5-flash-8b` with a constrained 5s-timeout prompt. Only run pre-flight on heavy inputs (video files, docs >10KB). Skip for short text/URL inputs. Integrate in `orchestrator.ts` before extraction step.

### V3 deployment order: AI intelligence before UX polish
**Decision:** V3 phases deploy intelligence upgrades first (Phase 1: Virality Scoring, Phase 2: Reflexion + Additive Fingerprinting) before UX improvements (Phase 3) and credit mechanics (Phase 4). Auth and monetization (Phase 7) ship after all intelligence and interface phases are stable.
**Why:** Deploying UX polish before the output quality is demonstrably better means beta testers interact with a prettier wrapper around V2's slop. If the text output isn't better, a frictionless UI won't prevent churn. The data flywheel for brand voice models must start early — every reflexion interaction trains the persistent fingerprint. Virality scoring is fault-tolerant (zero risk) but immediately proves the platform understands the creator's niche.
**How to apply:** V3 phase order: 1=Virality, 2=Reflexion+Additive, 3=UX, 4=Credits, 5=C2PA, 6=Multimodal, 7=Auth, 8=Publishing. See `src/docs/V3 Development Plan.md`.

---

## 2026-04-14 — Regen UX Polish (V3.8)

### Post-regen cascade is fire-and-forget AFTER status=complete
**Decision:** After `writeRegeneratedOutput` + `updateRegenerationStatus("complete")`, the cascade (tone check, hook scoring, C2PA) runs as `void Promise.allSettled([...])` with `.catch(warn)` on each task.
**Why:** Awaiting the cascade blocked the UI in loading state for the entire duration of the cascade's AI calls (tone check alone is ~2–5s). Setting status=complete before cascade means the UI shows the output immediately; the tone badge and scores update asynchronously a few seconds later.
**How to apply:** Never await the cascade. Never set "complete" inside the cascade. Order: write output → set complete → kick off cascade.

### `regenPlatform` field on cost_log tags all cascade costs to their platform
**Decision:** Every `generateStructured` call during a regen (refine_tone, regenerate_*, authenticate, score_hooks) passes `regenPlatform: platform`. This field is written to the `cost_log` entry.
**Why:** Without `regenPlatform`, cascade agents (authenticate, score_hooks) share the same `agentName` as initial pipeline agents. CostBreakdown can't distinguish "authenticate for initial pipeline" from "authenticate for regen cascade". The field makes grouping field-based, not inferred from agent names.
**How to apply:** All regen-triggered calls to `runRefineToneAgent`, `runToneCheckForPlatform`, `runHookScoringAgent`, `generateStructured` must pass `regenPlatform`. Initial pipeline never sets this field.

### Attempt number in refund_log must match CostBreakdown's attemptIndex
**Decision:** `processRegenRefund` computes attempt as `(prior regenerate_{platform} entries in cost_log before regenStartTimeMs) + 1`, NOT from refund_log count.
**Why:** Counting all refund_log entries for the platform includes the `synthesis_failed` entry (attempt=0), inflating the count. First regen after synthesis failure would write `attempt=2` but CostBreakdown assigns `attemptIndex=1` → strikethrough never shows. Cost_log count of prior `regenerate_*` entries gives the exact 1-based position matching CostBreakdown's group index.
**How to apply:** In `processRegenRefund`: `costLog.filter(e => e.agentName === \`regenerate_${platform}\` && entryMs < regenStartTimeMs).length + 1`.

### `updateToneCheckForPlatform` must use `set()` not `update()`
**Decision:** `updateToneCheckForPlatform` reads the existing doc, merges the new platform result in memory, then calls `toneCheckRef.set({...full merged state})` — never `.update()`.
**Why:** `.update()` throws `NOT_FOUND` if `tone_check/current` doesn't exist (e.g., initial auth agent failed entirely). The error is caught silently by the cascade's `.catch(warn)`, leaving tone stuck at 0% permanently. `set()` creates the document if absent.
**How to apply:** Pattern: read snap → `existing = snap.exists ? snap.data() : {}` → merge per_platform in memory → recompute overall score → `set({per_platform: merged, ...})`.

### AI structured output prompt must specify exact key names
**Decision:** `buildToneCheckPrompt` explicitly instructs the AI: "Use exactly these lowercase identifiers as keys in per_platform: twitter, linkedin, newsletter, veo, dark_social."
**Why:** The prompt used human-readable section headings (`### Twitter`, `### Dark Social`). The AI matched those names as keys ("Twitter", "Dark Social"). Code looked up `result.per_platform["twitter"]` (lowercase underscore) → undefined → fallback 0% written to Firestore on every regen. Always specify exact key format when the code will look up keys by name.
**How to apply:** Add a `IMPORTANT — use these exact keys` instruction block to any structured output prompt where the code accesses result fields by hardcoded string. Add defensive key normalization (`k.toLowerCase().replace(/[\s-]+/g, "_")`) in the lookup code as a safety net.

### `isRegenerated` badge and `outputErrors` clearing are coupled
**Decision:** `writeRegeneratedOutput` reads `outputErrors[platform]` inside the transaction. If present → first success after failure → omit `isRegenerated: true`, delete `outputErrors.${platform}`. If absent → genuine refinement → set `isRegenerated: true`.
**Why:** A platform that failed synthesis then succeeded on retry should not show "REGENERATED (V2)" — that badge implies the user refined an already-working output. The flag is misleading and erodes trust. Clearing `outputErrors` in the same transaction ensures `ToneCheckBadge` stops showing the platform in the "failed" section immediately after success.
**How to apply:** In `writeRegeneratedOutput` transaction: `const isFirstSuccessAfterFailure = !!(projectSnap.data()?.outputErrors?.[platform])`. Conditional `isRegenerated` + conditional `FieldValue.delete()` on `outputErrors.${platform}`.
