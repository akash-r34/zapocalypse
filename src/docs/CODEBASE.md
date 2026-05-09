# Zapocalypse — Complete Developer Reference

---

## What This App Does

You paste a URL, text, or file. The app calls Gemini AI three times in sequence and produces:
- **10 tweets** (ready to post)
- **5 LinkedIn posts**
- **1 newsletter** (markdown)
- **1 Veo video script** (JSON)

That's it. One input → four platform outputs.

---

## The Stack (and why each piece exists)

| Tech | What it is | Why it's here |
|------|-----------|--------------|
| **Next.js 16 (App Router)** | React framework with server-side rendering | Handles both the UI and the API routes in one codebase |
| **TypeScript strict** | Typed JavaScript | Catches bugs at compile time, especially important for AI output validation |
| **Tailwind CSS v4** | Utility-first CSS | v4 is CSS-first — no `tailwind.config.ts`, styles defined in `globals.css` using `@theme` |
| **Firebase App Hosting** | Google's managed hosting for Next.js | Runs the app on Cloud Run (scale-to-zero, no server to manage) |
| **Cloud Firestore** | Google's NoSQL database | Real-time sync to the browser via `onSnapshot()` — no polling needed |
| **`@google/genai` SDK** | Official Google AI SDK | Used in API key mode (not Vertex AI) to call `gemini-2.5-flash` |
| **Zod** | Schema validation library | Validates every AI response before using it |

---

## Directory Map

```
/
├── app/                          ← Next.js App Router pages + API routes
│   ├── page.tsx                  ← Dashboard (recent projects + budget)
│   ├── create/page.tsx           ← Input form
│   ├── project/[projectId]/
│   │   └── page.tsx              ← Live pipeline progress + output tabs
│   └── api/pipeline/run/
│       └── route.ts              ← POST endpoint that starts the pipeline
│
├── src/
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gemini-client.ts  ← ALL Gemini calls go through here
│   │   │   ├── schemas/          ← Zod schemas (source of truth for data shapes)
│   │   │   └── prompts/          ← Prompt templates for each agent
│   │   ├── pipeline/
│   │   │   ├── orchestrator.ts   ← Runs agents in sequence, writes Firestore
│   │   │   ├── agent-ingest.ts   ← Agent 1
│   │   │   ├── agent-extract.ts  ← Agent 2
│   │   │   ├── agent-synthesize.ts ← Agent 3
│   │   │   ├── input-validator.ts
│   │   │   └── url-extractor.ts
│   │   ├── budget/
│   │   │   ├── tracker.ts        ← checkBudget() + recordCost()
│   │   │   ├── kill-switch.ts    ← Cloud Function (not deployed yet)
│   │   │   └── pricing.ts        ← Token cost map
│   │   ├── firebase/
│   │   │   ├── client.ts         ← Browser SDK (reads Firestore in real-time)
│   │   │   └── admin.ts          ← Server SDK (writes Firestore from API routes)
│   │   └── firestore/
│   │       └── helpers.ts        ← Typed helpers for all Firestore operations
│   ├── hooks/                    ← React hooks (useProject, useBudget, etc.)
│   └── types/                    ← TypeScript interfaces
│
├── apphosting.yaml               ← Firebase App Hosting config + env vars
└── firestore.rules               ← Firestore security rules
```

---

## How a Pipeline Run Works (Step by Step)

### Step 1 — User submits input
`app/create/page.tsx` sends a POST to `/api/pipeline/run` with:
```json
{ "mode": "text", "value": "your article text here..." }
```

### Step 2 — Route validates and fires
`app/api/pipeline/run/route.ts`:
1. Validates input (size limits, YouTube guard, etc.)
2. Creates a Firestore document: `projects/{projectId}` with `status: "ingesting"`
3. Calls `runPipeline()` **without `await`** — fire and forget
4. Immediately returns `202 Accepted` with `{ projectId }`

The browser navigates to `/project/{projectId}` and starts watching Firestore.

### Step 3 — Orchestrator runs async
`src/lib/pipeline/orchestrator.ts` runs in the background:

```
status: "ingesting"   → Agent 1 → IngestedContent
status: "extracting"  → Agent 2 → SKO (written to Firestore)
status: "synthesizing" → Agent 3 → 4 outputs (written to Firestore)
status: "complete"
```

Each status is written to Firestore **before** the agent starts, so if the server crashes, you see where it died.

### Step 4 — Browser watches in real-time
`src/hooks/useProject.ts` uses Firestore's `onSnapshot()` — a persistent WebSocket-like listener. Every time the server writes to Firestore, the UI updates instantly. No polling.

---

## The Three Agents

### Agent 1 — Ingest (`agent-ingest.ts`)
**Input:** raw text / URL / file content
**Output:** `IngestedContent`

```typescript
{
  sourceType: "url" | "text" | "file"
  title: string
  rawContent: string
  contentSections: Array<{ heading: string; body: string }>
  metadata: { author?, publishDate?, wordCount }
}
```

For URLs, it first uses `@extractus/article-extractor` to fetch and parse the article, then passes the clean text to Gemini.

### Agent 2 — Extract (`agent-extract.ts`)
**Input:** `IngestedContent`
**Output:** `SKO` (Structured Knowledge Object)

The SKO is the semantic hub — every platform output is derived from it, never from the raw text:

```typescript
{
  core_thesis: string              // What the content is really saying
  audience_persona: { ... }        // Who it's for, pain points, aspirations
  viral_hooks: [{ hook, type, platform_fit }]   // Hooks ranked by type
  semantic_chunks: [{ id, content, big_idea }]  // Atomic insight units
  brand_tone_fingerprint: { voice, vocabulary_level, ... }
}
```

### Agent 3 — Synthesize (`agent-synthesize.ts`)
**Input:** `SKO`
**Output:** 4 platform outputs

This runs **4 Gemini calls in parallel** using `Promise.allSettled()`. If LinkedIn fails, Twitter still works. Each platform gets its own prompt built from the SKO.

```typescript
const [twitter, linkedin, newsletter, veo] = await Promise.allSettled([
  generateStructured({ prompt: buildTwitterPrompt(sko), schema: TwitterOutputSchema }),
  generateStructured({ prompt: buildLinkedInPrompt(sko), schema: LinkedInOutputSchema }),
  generateStructured({ prompt: buildNewsletterPrompt(sko), schema: NewsletterOutputSchema }),
  generateStructured({ prompt: buildVeoPrompt(sko), schema: VeoOutputSchema }),
])
```

---

## How Gemini Calls Work

All calls go through `src/lib/ai/gemini-client.ts`. Nothing calls the Gemini SDK directly anywhere else.

```typescript
// Every agent does this:
const result = await generateStructured({
  prompt: "...",
  schema: MyZodSchema,   // Zod schema = the shape you want back
  projectId,
  agentName: "ingest"
})
// result is fully typed and Zod-validated
```

Internally, `generateStructured`:
1. Converts the Zod schema to JSON Schema via `z.toJSONSchema()`
2. Passes it to Gemini as `responseSchema` — forces structured JSON output
3. Parses and validates the response with `.parse()`
4. If validation fails, throws immediately (no retry)
5. If 429 rate limit, retries up to 3 times (1s → 2s → 4s)
6. After success, records cost to Firestore asynchronously

---

## The Budget System

4 layers of protection against runaway spend:

| Layer | Where | What it does |
|-------|-------|-------------|
| 1 | `tracker.ts` | Reads `budget/current.spent` before every agent call. Throws if ≥ $100 |
| 2 | `tracker.ts` | Auto-resets `spent` to 0 on the 1st of each month |
| 3 | `gemini-client.ts` | Records cost after every call via `FieldValue.increment()` (atomic) |
| 4 | `kill-switch.ts` | Cloud Function: GCP Billing Alert at $95 → sets `killSwitch: true` → orchestrator stops immediately |

**`BudgetExceededError` is never retried.** The pipeline sets status to `budget_exceeded` (a terminal state) and stops.

---

## Firestore Data Model

```
projects/{projectId}
  - status: "idle" | "ingesting" | "extracting" | "synthesizing" | "complete" | "error" | "budget_exceeded"
  - sourceType: "url" | "text" | "file"
  - createdAt, updatedAt (server timestamps)
  - errorMessage (if status = "error")

projects/{projectId}/sko/current
  - full SKO object (written once, never updated)

projects/{projectId}/outputs/twitter
projects/{projectId}/outputs/linkedin
projects/{projectId}/outputs/newsletter
projects/{projectId}/outputs/veo
  - platform-specific output data + generatedAt

projects/{projectId}/cost_log/{auto-id}
  - per-call audit trail (agent, model, tokens, cost)

budget/current
  - spent: number (USD)
  - limit: number (100)
  - killSwitch: boolean
  - budgetMonth: "YYYY-MM"
```

**Why subcollections for SKO and outputs?** Firestore has a 1MB document size limit. The SKO with many semantic chunks + 4 platform outputs would exceed it if stored on the project doc.

---

## Key Next.js / App Router Concepts

If you're used to Express or older React, here's what's different:

**Server vs Client Components**
- Files without `'use client'` run on the server (Node.js). They can access env vars, call databases, but can't use `useState`, `useEffect`, or browser APIs.
- Files with `'use client'` at the top run in the browser. All the hooks (`useProject`, `useBudget`) are client components.

**API Routes**
- `app/api/pipeline/run/route.ts` exports `async function POST()` — that's it. Next.js handles the routing.
- No Express, no separate server.

**Dynamic Routes**
- `app/project/[projectId]/page.tsx` — the `[projectId]` in the folder name becomes a parameter.
- In Next.js 15+, params are async: `const { projectId } = await props.params`

**App Hosting = Cloud Run**
- Firebase App Hosting builds your Next.js app and deploys it as a Docker container on Cloud Run.
- `minInstances: 0` means it shuts down when idle (no cost). First request after idle takes ~2s cold start.
- `timeoutSeconds: 300` is critical — the pipeline can take 30-120s, and Cloud Run defaults to 60s.

---

## Environment Variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `GEMINI_API_KEY` | `gemini-client.ts` (server) | Secret — never expose to browser |
| `GEMINI_MODEL` | `gemini-client.ts` (server) | Currently `gemini-2.5-flash` |
| `GOOGLE_CLOUD_PROJECT` | Admin SDK, logging | Auto-injected by App Hosting |
| `NEXT_PUBLIC_FIREBASE_*` | `firebase/client.ts` (browser) | `NEXT_PUBLIC_` = inlined at build time, visible in browser — that's intentional for Firebase config |

**Critical rule:** Any `NEXT_PUBLIC_` variable must be in **both** `.env.local` (local dev) and `apphosting.yaml` (production). `.env.local` is never uploaded.

---

## What's NOT Done Yet

| Feature | Status | Notes |
|---------|--------|-------|
| Kill-switch Cloud Function | Code written, not deployed | Needs Pub/Sub topic wiring in GCP |
| Firestore security rules | Open (allow all) | Fine for single-user, needs auth before sharing |
| GitHub CI auto-deploy | Not set up | `firebase deploy` is manual for now |
| Veo actual video generation | Deferred | Script JSON only — Veo API not wired |
| File upload (PDF/docx) | Validation done | Text extraction for non-.txt files is basic |

---

## Common Questions

**Q: Why does the route return 202 instead of waiting for results?**
The pipeline takes 30-120 seconds. HTTP connections time out. Instead, the server starts the work, returns immediately, and the client watches Firestore for updates. This is the standard pattern for long async jobs.

**Q: Why is the SKO a separate subcollection instead of a field on the project?**
Firestore documents have a 1MB size limit. The SKO can have many semantic chunks. Subcollection = no size limit.

**Q: Why Zod schemas instead of TypeScript interfaces?**
TypeScript types disappear at runtime. Zod schemas exist at runtime and can validate AI responses. If Gemini returns something unexpected, Zod throws an error before bad data reaches your code. The TypeScript types are auto-generated from Zod: `z.infer<typeof MySchema>`.

**Q: Why `Promise.allSettled` instead of `Promise.all` in Agent 3?**
`Promise.all` fails fast — if one platform errors, all four fail. `Promise.allSettled` waits for all and reports each result individually. One bad LinkedIn post doesn't kill your tweets.

**Q: What's M3 / Material Design 3?**
Google's design system. The app uses `@material/material-color-utilities` to generate a color palette at runtime from a seed color, then sets CSS custom properties on `<html>`. Tailwind v4's `@theme` block maps those CSS vars to Tailwind utility classes like `bg-primary`.
