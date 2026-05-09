---
type: reference
domain: architecture
created: 2026-04-11
updated: 2026-04-12
status: current
tags:
  - reference
  - architecture
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Docs/package.json]]"
---

# Tech Stack

> Exact versions and package names for all layers of the Zapocalypse stack.

## Framework & Runtime

| Package | Version | Notes |
|---------|---------|-------|
| `next` | 16.2.1 | App Router, Turbopack. **Breaking changes from v14/v15** — read `node_modules/next/dist/docs/` before writing route handlers or layouts |
| `react` | 19.2.4 | Uses `use()` hook in [[Wiki/Pages/Page - Project Detail]] to unwrap async params |
| `react-dom` | 19.2.4 | |
| `typescript` | strict mode | |

## Styling

| Package | Version | Notes |
|---------|---------|-------|
| `tailwindcss` | v4 | CSS-first `@theme` directive. No `tailwind.config.js`. All tokens in `app/globals.css` |
| CSS vars | — | All styling via `--glass-*` custom properties. `--md-sys-color-*` tokens fully removed as of V3.3 |

See [[Wiki/Concepts/Glass Morphism Theme]] for the full CSS variable system.

## AI & Database

| Package | Version | Notes |
|---------|---------|-------|
| `@google/genai` | 1.46.0 | **Vertex AI mode** (`vertexai: true`, ADC auth, `us-central1`). Only `gemini-2.5-flash` available for this project on Vertex. |
| `firebase` | 12.11.0 | Client SDK for Firestore `onSnapshot` subscriptions |
| `firebase-admin` | 13.7.0 | Server SDK for pipeline writes (Admin SDK in API routes and pipeline agents) |
| `zod` | 4.3.6 | Schema validation. Use `z.toJSONSchema()` natively — do NOT import `zod-to-json-schema` |

## Data Processing

| Package | Version | Notes |
|---------|---------|-------|
| `@extractus/article-extractor` | — | URL content extraction in `url-extractor.ts` |
| `recharts` | 3.8.1 | `SpendChart` visualization in budget UI |
| `@material/material-color-utilities` | — | M3 dynamic color (legacy; CSS vars now primary) |

## Testing

| Package | Version | Notes |
|---------|---------|-------|
| `vitest` | 4.1.0 | Unit tests |
| `playwright` | 1.58.2 | E2E tests |

## Environment Variables

See [[Wiki/Infrastructure/Environment Variables]] for the full list and usage.

Key variables:
```bash
GOOGLE_CLOUD_PROJECT=your-firebase-project-id
GOOGLE_CLOUD_LOCATION=us-central1    # Vertex AI region
GEMINI_MODEL=gemini-2.5-flash        # only model available on Vertex for this project
# Auth: ADC — no GEMINI_API_KEY
# FIREBASE_CONFIG — auto-injected by Firebase App Hosting
```

## Model Pricing (for budget calculations)

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Vertex available? |
|-------|--------------------|--------------------|------------------|
| **gemini-2.5-flash** | $0.15 | $0.60 | ✅ (only one confirmed) |
| gemini-2.0-flash | $0.10 | $0.40 | ❌ 404 for this project |
| gemini-2.0-flash-lite | $0.075 | $0.30 | untested |
| gemini-2.5-flash-8b | $0.04 | $0.15 | ❌ 404 for this project |
| gemini-1.5-pro | $1.25 | $5.00 | untested |
| gemini-1.5-flash | $0.075 | $0.30 | untested |

Source: `src/lib/budget/pricing.ts`, tested via `scripts/test-vertex.mjs`

## Cross-References

- [[Wiki/Architecture/Architecture Overview]]
- [[Wiki/Concepts/Glass Morphism Theme]]
- [[Wiki/Infrastructure/Environment Variables]]
- [[Wiki/Data/Gemini Client]]
