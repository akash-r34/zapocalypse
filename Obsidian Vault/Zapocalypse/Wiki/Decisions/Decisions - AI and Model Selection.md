---
type: decision
domain: pipeline
source_file: src/lib/ai/gemini-client.ts, apphosting.yaml
created: 2026-04-11
updated: 2026-04-12
status: current
tags:
  - decision
  - ai
  - infrastructure
related:
  - "[[Wiki/Data/Gemini Client]]"
  - "[[Wiki/Infrastructure/Environment Variables]]"
sources:
  - "[[Sources/Memory/decisions]]"
---

# Decisions - AI and Model Selection

> All AI integration decisions: SDK choice, auth mode, model selection, Zod version, API shape quirks.

## Use `@google/genai` SDK (not Firebase AI Logic)

**Decision:** `@google/genai` v1.46.0 in Vertex AI mode. Not Firebase AI Logic SDK.

**Why:** More control over structured output (`responseSchema`), batching, and model versioning. Firebase AI Logic adds abstraction we don't need. Same SDK supports both API-key and Vertex modes — no package change needed for migration.

**Result:** All AI calls via `src/lib/ai/gemini-client.ts`. No `firebase/ai` imports anywhere.

---

## Migrated to Vertex AI (2026-04-12) — supersedes previous API-key decision

**Decision:** Use `new GoogleGenAI({ vertexai: true, project, location })` with Application Default Credentials. No `GEMINI_API_KEY`.

**Why:** `GEMINI_API_KEY` was committed in plaintext in `apphosting.yaml` (compromised in git history). Vertex AI uses the App Hosting runtime service account (`firebase-app-hosting-compute@your-firebase-project-id.iam.gserviceaccount.com`) — no shared key to leak. Also required for Phase 6 (Multimodal/Veo) which needs the Vertex endpoint.

**GCP prerequisites (all confirmed):**
- Vertex AI API enabled: `aiplatform.googleapis.com`
- Runtime SA has `roles/aiplatform.user`
- Local dev: `gcloud auth application-default login`

**Result:** `gemini-client.ts` reads `GOOGLE_CLOUD_PROJECT` + `GOOGLE_CLOUD_LOCATION`. `GEMINI_API_KEY` removed from all config. Old key (`AIzaSyAq...RRo`) still in git history — must be disabled in GCP console.

*Previous decision (superseded): Used `GEMINI_API_KEY` because `gemini-2.0-flash` on Vertex returned 404. On revisit, `gemini-2.5-flash` works on Vertex — the 404 was model-specific, not Vertex-wide.*

---

## `gemini-2.5-flash` — Only Available Model on Vertex for This Project

**Decision:** `GEMINI_MODEL=gemini-2.5-flash` everywhere. Both client fallback and `preflight.ts` `PREFLIGHT_MODEL` use this.

**Why:** Tested on Vertex `us-central1` for project `your-firebase-project-id`:
- `gemini-2.5-flash` ✅ — works
- `gemini-2.0-flash` ❌ — 404 NOT_FOUND
- `gemini-2.0-flash-001` ❌ — 404 NOT_FOUND
- `gemini-2.5-flash-8b` ❌ — 404 NOT_FOUND

**Pricing:** `$0.15/1M` input, `$0.60/1M` output. Used for all agents including preflight.

**Result:** `GEMINI_MODEL=gemini-2.5-flash` in `.env.local`, `apphosting.yaml`, and as hardcoded fallback in `gemini-client.ts` and `preflight.ts`.

---

## Use Zod v4 Native `z.toJSONSchema()`

**Decision:** `z.toJSONSchema(schema)` built into Zod v4 instead of `zod-to-json-schema` package.

**Why:** `zod-to-json-schema` v3.25.1 imports from `zod/v3` internally, causing TypeScript type mismatches with Zod v4's type system. Zod v4 ships native JSON Schema export.

**Result:** All Gemini `responseSchema` calls use `z.toJSONSchema(schema)` in `gemini-client.ts`. The `zod-to-json-schema` package is not installed.

---

## `@google/genai` API Shape (Breaking Change from Training Data)

**Decision:** Document actual API shape of `@google/genai` v1+.

**Key differences:**
- `generationConfig` → `config: { responseMimeType, responseSchema }`
- `response.text()` (method) → `response.text` (getter, no parentheses)

**Result:** `callGemini()` passes `config: { ... }`. All response text reads are `response.text` (no call).

---

## Zod Schema Ranges (not Exact Lengths)

**Decision:** All array schemas use `.min(n).max(m)` ranges; never `.length(n)`.

**Why:** Gemini targets requested count but occasionally returns one more or fewer. An exact `.length(10)` silently rejects valid near-target responses with a Zod error.

**Result:** `tweets.min(1).max(15)`, `posts.min(1).max(10)`, carousel `min(3).max(10)`. Prompt instructions still specify target count — schema just doesn't reject near-misses.

---

## Non-Fatal Agent Wrapping

**Decision:** `analyzing` and `authenticating` steps are wrapped in inner try-catch. Failures are logged and skipped; `BudgetExceededError` is always re-thrown.

**Why:** Analyst and Authenticator are quality-enhancement agents, not pipeline gates. Synthesis outputs exist before Authenticator runs.

**Result:** `NEUTRAL_ANALYSIS_SCORE` used as fallback when Analyst fails. Tone check is advisory-only.

## Cross-References

- Implementation: [[Wiki/Data/Gemini Client]]
- Budget: [[Wiki/Concepts/Budget Protection Layers]]
- Model env: [[Wiki/Infrastructure/Environment Variables]]
