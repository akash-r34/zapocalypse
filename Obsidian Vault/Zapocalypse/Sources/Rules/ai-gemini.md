# Rules: Gemini AI Integration

## Client instantiation
- ONE singleton in `src/lib/ai/gemini-client.ts`. Never call `new GoogleGenAI()` elsewhere.
- Uses **Vertex AI mode** — `new GoogleGenAI({ vertexai: true, project, location })`.
- Auth is via Application Default Credentials (ADC): App Hosting runtime SA in prod, `gcloud auth application-default login` locally.
- Requires `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` (defaults to `us-central1`). No `GEMINI_API_KEY`.

## Structured output
- Always set `responseMimeType: "application/json"` for all agent calls.
- Always derive `responseSchema` from the Zod schema via `z.toJSONSchema(schema)` (Zod v4 native). Never use `zod-to-json-schema` package. Never hand-write a JSON schema.
- Validate the raw response through the Zod schema before returning — if it fails, throw with the Zod error, don't pass invalid data downstream.

## Budget gate
- Call `checkBudget()` from `src/lib/budget/tracker.ts` BEFORE every `model.generateContent()` call.
- If budget is exceeded, throw a `BudgetExceededError` — never silently continue.

## Model selection
- Read model from `process.env.GEMINI_MODEL` with a fallback of `"gemini-2.0-flash"` (not `gemini-2.5-pro`) to avoid accidental expensive calls in dev.
- Never hardcode a model string in agent files.

## Token limits
- Use `gemini-2.0-flash` during development and testing — it's 10–20× cheaper.
- Switch to `gemini-2.5-pro` for integration/quality testing only.
- Do not add `maxOutputTokens` constraints unless output is being truncated — let the schema shape the output.

## Rate limit handling
- Retry on HTTP 429 (rate limit) only — exponential backoff: 1s, 2s, 4s, max 3 retries.
- **Never retry on:** `BudgetExceededError`, Zod validation error, or content safety block.
- Implement in `gemini-client.ts` — agents should not contain retry logic.

## Cost tracking
- After every `generateContent()` call, read `response.usageMetadata.promptTokenCount` and `response.usageMetadata.candidatesTokenCount`.
- Calculate cost using the pricing map in `src/lib/budget/pricing.ts`.
- Atomically increment `budget/current.spent` via Firestore `FieldValue.increment(costDelta)`.
- Do this AFTER returning the result to the agent — never let cost tracking block the response.

## Error handling
- Wrap every `generateContent` call in try/catch.
- Distinguish between `BudgetExceededError`, network/429 errors, and Zod validation failures — propagate each differently to the orchestrator.
- Never retry on `BudgetExceededError`.

## Veo
- `src/lib/ai/veo-client.ts` is a placeholder. Do NOT make real API calls to Veo.
- The synthesize agent generates the Veo JSON script structure only and stores it in Firestore.
