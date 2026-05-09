---
type: overview
domain: pipeline
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - overview
  - pipeline
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Rules/pipeline-safety]]"
---

# Pipeline Overview

> The Zapocalypse pipeline is a sequential 7-agent state machine that transforms one input into 5 platform outputs, writing state to Firestore at every transition for real-time client updates.

## State Machine

```
idle
  → ingesting      [Agent 1: Ingest]
  → analyzing      [Agent 1.5: Analyst — fault-tolerant]
  → extracting     [Agent 2: Extract → SKO]
  → synthesizing   [Agent 3: Synthesize — 5 parallel platforms]
  → scoring        [Agent 3.5: Hook Scorer — fault-tolerant]
  → authenticating [Agent 4: Authenticator — fault-tolerant]
  → complete

Terminal error states (never auto-retry):
  error            [non-budget failure]
  budget_exceeded  [BudgetExceededError]
```

Valid transitions only — the orchestrator never skips a state or jumps backward.

## Agent Sequence

| # | Agent | Fault-tolerant? | Output |
|---|-------|----------------|--------|
| 1 | [[Agent - Ingest]] | No — required | `IngestedContent` |
| 1.5 | [[Agent - Analyst]] | Yes — falls back to `NEUTRAL_ANALYSIS_SCORE` | `InformationGainScore` |
| 1.6 | Pre-flight check | Yes — `PreflightError` stops pipeline early (no expensive agents run) | Pass/fail |
| 2 | [[Agent - Extract]] | No — required | `SKO` |
| 3 | [[Agent - Synthesize]] | Partial — `Promise.allSettled` per platform | `SynthesisOutputs` |
| 3.5 | [[Agent - Hook Scorer]] | Yes — outputs already written, scoring is bonus | `HookScoreResult` |
| 4 | [[Agent - Authenticator]] | Yes — tone check + C2PA are non-blocking | `AuthenticatorResult` |

## Fault Tolerance Strategy

**Required agents** (Ingest, Extract): failure throws, triggers top-level catch → `error` state + refund.

**Fault-tolerant agents** (Analyst, Hook Scorer, Authenticator): wrapped in try/catch inside orchestrator. `BudgetExceededError` is rethrown (it is never silently swallowed). Other errors are logged as warnings and pipeline continues.

**Synthesis**: `Promise.allSettled` — one platform failing does not block others. But if ALL platforms fail, orchestrator throws.

## Budget Checks

`checkBudget()` is called independently inside each agent before its Gemini call. A single check at pipeline start is not sufficient — costs accumulate per agent. See [[Wiki/Concepts/Budget Protection Layers]].

## State Machine Transitions in Code

The orchestrator (`src/lib/pipeline/orchestrator.ts`) calls `updateProjectStatus(projectId, status)` before starting each agent:

```typescript
await updateProjectStatus(projectId, "ingesting");
const ingested = await runIngestionAgent(...);

await updateProjectStatus(projectId, "analyzing");
// ... etc
```

## Refund Logic

Two refund tiers based on which stage failed:

| `currentStage` | Trigger | Refund type |
|---------------|---------|-------------|
| `pre_extract` | Failed before SKO was written | `"full"` — refund all costs |
| `synthesis` | Failed after SKO written to Firestore | `"synthesis_only"` — refund synthesis/scoring/auth only |

`BudgetExceededError` is NOT refunded — it's a safety stop, not a pipeline failure.

## Selective Regeneration (Post-Pipeline)

After `complete`, a user can trigger tone refinement on any platform:
```
POST /api/pipeline/regenerate → void runSelectiveRegeneration() → 202
```

Reads SKO from Firestore → runs tone refinement → re-synthesizes single platform. Capped at 3 regenerations per platform. See [[Agent - Refine Tone]] and [[Wiki/Pages/API Routes]].

## Pages in This Section

- [[Pipeline Overview]] (this page)
- [[Orchestrator]]
- [[Agent - Ingest]]
- [[Agent - Analyst]]
- [[Agent - Extract]]
- [[Agent - Synthesize]]
- [[Agent - Hook Scorer]]
- [[Agent - Authenticator]]
- [[Agent - Refine Tone]]
