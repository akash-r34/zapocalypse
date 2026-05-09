---
type: overview
domain: architecture
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - overview
  - architecture
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/project_context]]"
---

# Architecture Overview

> Zapocalypse is a single-user vertical AI content factory: one input produces platform-specific content for 5 channels via a sequential multi-agent pipeline powered by Google Gemini.

## System Summary

| Attribute | Value |
|-----------|-------|
| **App type** | Single-user web app (no auth) |
| **Deployment** | Firebase App Hosting (Cloud Run, scale-to-zero) |
| **GCP Project** | `your-firebase-project-id` |
| **Live URL** | `https://zapocalypse--your-firebase-project-id.us-central1.hosted.app` |
| **GitHub** | `https://github.com/akash-r34/zapocalypse` (private) |
| **Version** | V3.5 (as of 2026-04-05) |

## Tech Stack

See [[Tech Stack]] for exact versions. Summary:

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.1 (App Router, Turbopack) + TypeScript strict |
| Styling | Tailwind v4 (CSS-first `@theme`) + `--glass-*` custom properties |
| AI SDK | `@google/genai` — Google AI API key mode (NOT Vertex AI) |
| AI Model | `gemini-2.5-flash` (env `GEMINI_MODEL`, fallback `gemini-2.0-flash`) |
| Database | Cloud Firestore (Native mode, `us-central1`) |
| Hosting | Firebase App Hosting |
| Schemas | Zod v4 — `z.toJSONSchema()` natively |
| React | 19.2.4 |

## Core Architecture Pattern: Hub and Spoke

All platform outputs are derived from a single **Structured Knowledge Object (SKO)** produced by the extraction agent. This is the central architectural choice — see [[Hub and Spoke via SKO]].

```
Input
  → [Ingest] → IngestedContent
  → [Analyse] → InformationGainScore
  → [Extract] → SKO  ← hub
                  ↓
    [Synthesize × 5 in parallel]
      Twitter | LinkedIn | Newsletter | Veo | Dark Social
                  ↓
    [Hook Scorer] → HookScoreResult
    [Authenticator] → ToneCheck + C2PA manifests
```

## Pipeline State Machine

```
idle → ingesting → analyzing → extracting → synthesizing
     → scoring → authenticating → complete
Terminal: error | budget_exceeded
```

See [[Pipeline Overview]] for full detail.

## Fire-and-Forget Execution

The API returns `202 Accepted` immediately. The pipeline runs asynchronously, writing each state transition to Firestore. The client watches via `onSnapshot`. See [[Fire and Forget Pattern]].

## Budget Protection

Hard cap: $100/month. Kill-switch at $95. `checkBudget()` called before every Gemini call. See [[Budget Protection Layers]].

## Dual-Agent Collaboration

Both Claude Code and Gemini CLI (Antigravity) work on this codebase. Shared memory in `.claude/memory/` with formalized handover protocol. See [[Dual Agent Collaboration]].

## Key Hard Constraints

- **No auth** — single-user app; do not add Firebase Auth
- **Zod v4** — use `z.toJSONSchema()` natively; never `zod-to-json-schema`
- **CSS** — all styling via `--glass-*` vars; `--md-sys-color-*` tokens fully removed
- **Agents** — direct function imports only; never call `/api/agents/*` internally
- **Veo** — JSON script structure only; no real Veo API calls
- **Timestamps** — always `serverTimestamp()`, never `new Date()`

## Files in This Section

- [[Architecture Overview]] (this page)
- [[Tech Stack]]
- [[Hub and Spoke via SKO]]
- [[Fire and Forget Pattern]]
- [[Dual Agent Collaboration]]
