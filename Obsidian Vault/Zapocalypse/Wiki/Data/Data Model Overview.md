---
type: overview
domain: data
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - overview
  - data
  - firestore
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Rules/firestore-schema]]"
---

# Data Model Overview

> All Zapocalypse data lives in Cloud Firestore (Native mode, `us-central1`). One singleton budget document plus a per-project document tree for every pipeline run.

## Collection Map

| Path | Contains | Written by |
|------|----------|-----------|
| `budget/current` | Budget state | [[Gemini Client]] tracker |
| `projects/{id}` | Project doc + status | [[Orchestrator]] |
| `projects/{id}/cost_log/{auto-id}` | Per-Gemini-call costs + `regenPlatform?` | [[Gemini Client]] via `recordCost()` |
| `projects/{id}/refund_log/{auto-id}` | Per-platform refund audit trail | `src/lib/budget/refund.ts` |
| `projects/{id}/analysis/current` | InformationGainScore | Orchestrator after [[Agent - Analyst]] |
| `projects/{id}/sko/current` | SKO (immutable) | Orchestrator after [[Agent - Extract]] |
| `projects/{id}/outputs/{platform}` | Platform output data | Orchestrator after [[Agent - Synthesize]] |
| `projects/{id}/hook_scores/current` | HookScoreResult | Orchestrator after [[Agent - Hook Scorer]] |
| `projects/{id}/tone_check/current` | ToneCheckResult (per-platform, no failed-platform entries) | Orchestrator after [[Agent - Authenticator]]; updated per-platform by regen cascade |
| `projects/{id}/c2pa/{platform}` | C2PAManifest | Orchestrator after [[Agent - Authenticator]]; refreshed by regen cascade |
| `projects/{id}/tone_history/{auto-id}` | Tone refinement record | `regenerate.ts` during selective regeneration |
| `system/c2pa_signing_key` | ECDSA P-256 keypair | `c2pa-signer.ts` on first pipeline run |

Platforms: `twitter | linkedin | newsletter | veo | dark_social`

## Project Document Shape

```typescript
// projects/{id}
{
  id: string;
  status: PipelineStatus;  // see Pipeline Overview state machine
  sourceType: "url" | "text" | "file";
  title?: string;
  sourcePreview?: string;
  totalCost?: number;
  error?: string;
  outputErrors?: Record<string, string>;  // per-platform synthesis errors; cleared atomically when platform retries successfully
  regenerationCount?: number;
  regenerationState?: Record<string, {
    status: "processing" | "complete" | "error";
    intent?: "retry" | "refine";  // "retry" = first-fail retry; "refine" = tone feedback
    startedAt?: Timestamp;
    completedAt?: Timestamp;
    error?: string;
    refundedAmount?: number;
  }>;
  // Phase 4 — Fair-Play Credits (pipeline-wide refund only)
  refunded?: boolean;
  refundedAmount?: number;
  refundStage?: "full" | "synthesis_only";
  skoRetained?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## cost_log Entry Shape

```typescript
// projects/{id}/cost_log/{auto-id}
{
  agentName: string;       // e.g. "synthesize_twitter", "regenerate_newsletter", "authenticate"
  model: string;
  promptTokens: number;
  outputTokens: number;
  costUsd: number;
  timestamp: Timestamp;
  regenPlatform?: string;  // set for ALL costs during a regen cascade (refine_tone, regenerate_*, authenticate, score_hooks)
                           // absent for initial pipeline costs
}
```

`regenPlatform` is the grouping key used by `CostBreakdown` — never infer platform from agent name alone.

## refund_log Entry Shape

```typescript
// projects/{id}/refund_log/{auto-id}
{
  platform: string;         // e.g. "twitter"
  amount: number;           // USD refunded
  reason: "synthesis_failed" | "regen_failed";
  attempt: number;          // 0 for synthesis failure; 1-based for regen failures (matches CostBreakdown attemptIndex)
  agentNames: string[];     // which agents' costs were refunded
  createdAt: Timestamp;
}
```

## Budget Document Shape

```typescript
// budget/current (singleton)
{
  spent: number;        // atomically incremented via FieldValue.increment()
  limit: 100;
  killSwitch: boolean;
  budgetMonth: string;  // "YYYY-MM"
  updatedAt: Timestamp;
}
```

## Access Rules

- **Always use typed helpers** from [[Firestore Helpers]] — never call `doc()`, `setDoc()`, `getDoc()` directly in orchestrator or component code
- **`budget/current`**: always `FieldValue.increment()` for `spent`
- **`update()` vs `set()`**: `update()` throws NOT_FOUND on a missing document — use `set()` for upsert patterns; use `update()` only when document existence is guaranteed
- **Dot-notation** works with `update()` but NOT `set({merge:true})` — dots are treated as literal key names by `set()`
- **Timestamps**: always `FieldValue.serverTimestamp()`

## Pages in This Section

- [[Data Model Overview]] (this page)
- [[Gemini Client]]
- [[Firestore Helpers]]
- [[Schema - SKO]]
- [[Schema - Ingested Content]]
- [[Schema - Information Gain]]
- [[Schema - Twitter Output]]
- [[Schema - LinkedIn Output]]
- [[Schema - Newsletter Output]]
- [[Schema - Veo Output]]
- [[Schema - Dark Social Output]]
- [[Schema - Hook Score]]
- [[Schema - Tone Check]]
- [[Schema - C2PA Manifest]]

## Maintenance

- [[Wiki/Infrastructure/Maintenance Scripts]] — `purge-old-projects.mjs` deletes entire project trees (doc + all subcollections) where `createdAt` is before the current month. Preserves `budget/current` and `system/c2pa_signing_key`.
