---
type: entity
entity_kind: utility
domain: data
source_file: src/lib/ai/gemini-client.ts
created: 2026-04-11
updated: 2026-04-12
status: current
tags:
  - entity
  - utility
  - data
  - ai
related:
  - "[[Wiki/Concepts/Budget Protection Layers]]"
  - "[[Wiki/Architecture/Tech Stack]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Rules/ai-gemini]]"
---

# Gemini Client

> Singleton wrapper for all Gemini AI calls via **Vertex AI**. The only place in the codebase that instantiates `GoogleGenAI`. Never call `new GoogleGenAI()` elsewhere.

## Singleton Pattern (Vertex AI mode)

```typescript
// src/lib/ai/gemini-client.ts
import { GoogleGenAI } from "@google/genai";

let _client: GoogleGenAI | null = null;

const DEFAULT_LOCATION = "us-central1";

function getClient(): GoogleGenAI {
  if (!_client) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? DEFAULT_LOCATION;
    if (!project) throw new Error("GOOGLE_CLOUD_PROJECT env var is required for Vertex AI mode");
    _client = new GoogleGenAI({ vertexai: true, project, location });
  }
  return _client;
}

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
```

Uses **Vertex AI mode** with Application Default Credentials (ADC). No `GEMINI_API_KEY`.

- **Production:** Firebase App Hosting runtime service account (`firebase-app-hosting-compute@your-firebase-project-id.iam.gserviceaccount.com`) must have `roles/aiplatform.user`.
- **Local dev:** Run `gcloud auth application-default login` once.

### Available models for this project

Only `gemini-2.5-flash` is confirmed available on Vertex AI for `your-firebase-project-id` / `us-central1`. Both `gemini-2.0-flash` and `gemini-2.5-flash-8b` return 404.

## `generateStructured<T>` — Primary API

```typescript
interface GenerateOptions<T extends z.ZodTypeAny> {
  prompt: string;
  schema: T;
  projectId?: string;
  agentName?: string;
  model?: string;  // defaults to process.env.GEMINI_MODEL || "gemini-2.5-flash"
}

export async function generateStructured<T extends z.ZodTypeAny>(
  options: GenerateOptions<T>
): Promise<z.infer<T>>
```

### What it does:
1. Calls `z.toJSONSchema(schema)` (Zod v4 native) to derive `responseSchema`
2. Calls Vertex with `responseMimeType: "application/json"` + `responseSchema`
3. Parses response JSON with `JSON.parse`
4. Validates with `schema.parse()` — throws `ZodError` if invalid
5. Calls `recordCost()` after success (non-blocking)
6. Returns `z.infer<T>` — fully typed

### Retry logic:
```typescript
const RETRY_DELAYS_MS = [1000, 2000, 4000];  // max 3 retries

// Retry ONLY on HTTP 429 (rate limit / quota)
// Never retry: BudgetExceededError, ZodError, other errors
```

Rate limit detection: checks `error.message` for `"429"`, `"quota"`, `"rate limit"` (case-insensitive).

## `generateText` — Unstructured Text

```typescript
interface GenerateTextOptions {
  prompt: string;
  projectId?: string;
  agentName?: string;
  model?: string;
}

export async function generateText(options: GenerateTextOptions): Promise<string>
```

- Calls `checkBudget()` explicitly (unlike `generateStructured` which relies on callers)
- Same retry logic as `generateStructured`
- `preflight.ts` uses this with `model: "gemini-2.5-flash"` (only available model)

## Cost Tracking

After every successful call:
```typescript
const usage = response.usageMetadata;
if (usage && projectId) {
  await recordCost({
    projectId,
    agentName: agentName ?? "unknown",
    model: effectiveModel,
    promptTokens: usage.promptTokenCount ?? 0,
    outputTokens: usage.candidatesTokenCount ?? 0,
  });
}
```

`recordCost` atomically increments `budget/current.spent` via `FieldValue.increment()`. See [[Wiki/Concepts/Budget Protection Layers]].

## Vertex AI Call Shape

```typescript
client.models.generateContent({
  model,
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  config: {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(schema),
  },
});
```

Note: `response.text` is a **getter** (not a method) in `@google/genai` — access as `response.text`, not `response.text()`.

## Connectivity Test

A standalone smoke test exists at `scripts/test-vertex.mjs`:
```bash
GOOGLE_CLOUD_PROJECT=your-firebase-project-id GOOGLE_CLOUD_LOCATION=us-central1 \
GEMINI_MODEL=gemini-2.5-flash node scripts/test-vertex.mjs
```
Confirms ADC auth, Vertex endpoint, model availability, and `usageMetadata` in one call.

## Error Hierarchy

| Error | Source | Retry? |
|-------|--------|--------|
| `BudgetExceededError` | `checkBudget()` | Never |
| `ZodError` | `schema.parse()` | Never |
| HTTP 429 | Vertex AI API | Yes — up to 3 times |
| Other network errors | Vertex AI API | No |

## Cross-References

- Budget check: [[Wiki/Concepts/Budget Protection Layers]]
- Used by: all 7 agents via `generateStructured`, `preflight.ts` via `generateText`
- Cost recording: [[Firestore Helpers]] (`recordCost`)
- Model pricing: [[Wiki/Architecture/Tech Stack]]
- Auth decision: [[Wiki/Decisions/Decisions - AI and Model Selection]]
