---
name: project_context
description: Core goals, constraints, and non-negotiable decisions for Zapocalypse
type: project
---

# Project Context

Zapocalypse is a single-user vertical AI content factory. One long-form input (blog post, video, URL) produces platform-specific content automatically via a sequential 5-agent pipeline powered by Gemini.

**Current version: 2.1** (Native Platform Previews, 2026-03-26)
**V3 Plan:** Approved and revised 2026-03-28 — see `src/docs/V3 Development Plan.md`

## Hard Constraints

- **Budget:** $100/mo Google AI Ultra subscription. Kill-switch at $95. Never remove or bypass budget checks.
- **Single user:** No authentication. Firebase Auth deferred until explicitly requested.
- **Veo:** Generate the JSON script only. Do NOT make actual Veo API calls — deferred.
- **Model:** `gemini-2.5-flash` (Vertex AI mode). Controlled via `GEMINI_MODEL` env var.
- **Agents run as imports:** Not HTTP calls — avoids cold-start latency between pipeline steps.
- **Zod is the source of truth:** Types, validation, AND Gemini responseSchema all derived from Zod schemas.

## Pipeline (v2.0)

```
idle → ingesting → analyzing → extracting → synthesizing → authenticating → complete | error | budget_exceeded
```

| Agent | Type | Description |
|-------|------|-------------|
| Ingest | Required | Raw content → IngestedContent |
| Analyst | Fault-tolerant | IngestedContent → InformationGainScore (5 signals, grade A-F) |
| Extract | Required | IngestedContent + Score → SKO |
| Synthesize | Required (5 parallel) | SKO → Twitter + LinkedIn + Newsletter + Veo + Dark Social |
| Authenticator | Fault-tolerant | SKO + Outputs → ToneCheckResult + C2PA manifests |

## Output Contracts (v2.0)

| Platform | Count | Key constraint |
|----------|-------|----------------|
| X/Twitter | 10 | ≤280 chars each, ≥3 contrarian, each with `answer_block` (GEO) |
| LinkedIn | 5 | Each with `answer_block` + 1 Document Carousel (5-7 slides) |
| Newsletter | 1 | ≤500 words, summary + 3 bullets + CTA |
| Veo Script | 1 | JSON, exactly 15 seconds |
| Dark Social | 1 | Slack message + Discord message + shareable quote |

## GCP Setup

- **GCP Project:** `your-firebase-project-id`
- **Live URL:** https://zapocalypse--your-firebase-project-id.us-central1.hosted.app
- **GitHub:** https://github.com/akash-r34/zapocalypse (private, created 2026-03-28)
- **Model:** `gemini-2.5-flash` via Vertex AI (ADC, `us-central1`)

## Security Note

`GEMINI_API_KEY` was removed from `apphosting.yaml` as of 2026-04-12 — migrated to Vertex AI (ADC). The old key (`AIzaSyAq...RRo`) is still in git history and must be disabled in GCP console / Google AI Studio.

`NEXT_PUBLIC_FIREBASE_*` values are intentionally public (embedded in client bundle) — leave as-is.

## V3 Key Constraints (Planned)

- **Additive tone fingerprinting:** SKO extraction must map positive linguistic markers — analogy style, sentence cadence (spectrum: low/medium/high, NOT counts), signature phrases, colloquialisms. Never ask Gemini to count words.
- **Tiered refunds:** Extraction cost ≠ synthesis cost. SKO is a user asset. Full refund only on pre-synthesis failure.
- **Pre-flight before heavy compute:** `gemini-2.5-flash-8b` validates video/large-doc inputs before the full extraction runs.
- **Phase order:** Virality scoring → Reflexion/Fingerprinting → UX → Credits → C2PA → Multimodal → Auth → Publishing.
