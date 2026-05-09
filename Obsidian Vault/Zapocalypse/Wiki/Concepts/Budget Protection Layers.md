---
type: concept
domain: infrastructure
source_file: src/lib/budget/tracker.ts, src/lib/budget/pricing.ts, src/lib/budget/refund.ts
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - concept
  - infrastructure
  - budget
related:
  - "[[Wiki/Hooks/Hook - useBudget]]"
  - "[[Wiki/Components/Component - Budget UI]]"
  - "[[Wiki/Data/Firestore Helpers]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Budget Protection Layers

> Four independent layers protect against runaway Gemini spend. Each layer operates independently.

## Layer 1 — GCP Billing Alert

GCP budget alert at **$95/month** → Pub/Sub → Cloud Function → `budget/current.killSwitch: true`.

## Layer 2 — Firestore Kill-Switch

`checkBudget()` throws `BudgetExceededError` if `killSwitch: true`. Called before every `generateContent()`.

## Layer 3 — Monthly Spend Limit

`checkBudget()` throws `BudgetExceededError` if `spent >= limit` ($100). Auto-resets on new month.

## Layer 4 — Per-Call Cost Tracking

After every `generateContent()` response (including failed validation — cost recorded before ZodError is thrown):
```typescript
recordCost({ projectId, agentName, model, promptTokens, outputTokens, regenPlatform? });
// FieldValue.increment(cost) on budget/current.spent
// Writes cost_log entry with optional regenPlatform field
```

## Pricing Map (`src/lib/budget/pricing.ts`)

```typescript
"gemini-2.5-flash":    { input: 0.15, output: 0.60 }   // per 1M tokens
"gemini-2.5-flash-8b": { input: 0.0375, output: 0.15 }
"gemini-2.0-flash":    { input: 0.10, output: 0.40 }
```

## Refund System

Three refund types, all in `src/lib/budget/refund.ts`:

### 1. Pipeline-wide refund (`processRefund`)
Stage-aware — called from orchestrator catch block:

| Failure Stage | Refund Type | What's Returned |
|--------------|------------|----------------|
| Pre-SKO (ingest/analyze/extract fail) | `"full"` | All project costs |
| Post-SKO (synthesis fails) | `"synthesis_only"` | Only synthesis agent costs |
| `BudgetExceededError` | None | Safety stop, not a failure |

### 2. Per-platform synthesis refund (`processPlatformSynthesisRefund`)
Called from orchestrator for each key in `outputs.errors` after synthesis:
- Filters cost_log for `synthesize_{platform}` entries
- Decrements `budget/current.spent`
- Writes `refund_log` entry: `{ reason: "synthesis_failed", attempt: 0, agentNames: ["synthesize_{platform}"] }`

### 3. Failed-regen refund (`processRegenRefund`)
Called from `regenerate.ts` catch block when regen fails:
- Filters cost_log by agentName (`regenerate_{platform}` or `refine_tone`) AND timestamp >= `regenStartTimeMs`
- Decrements `budget/current.spent`
- Computes attempt number by counting prior `regenerate_{platform}` entries in cost_log before `regenStartTimeMs` (NOT from refund_log count — that would include synthesis_failed entries and inflate the number)
- Writes `refund_log` entry: `{ reason: "regen_failed", attempt: N }`

**The attempt number in refund_log must match `CostBreakdown`'s `attemptIndex`** (1-based position of the regen group for that platform).

## `CostBreakdown` Integration

`useProjectRefunds` subscribes to the `refund_log` subcollection. `CostBreakdown` uses:
- `initialRefundedAgents` (from `attempt=0, reason=synthesis_failed` entries) → strikethrough on initial generation rows
- `regenRefundedKeys` (from `attempt>0, reason=regen_failed`) → key format: `"platform:attemptIndex"` → strikethrough on entire regen group

`cost_log` entries tagged with `regenPlatform` are grouped under "Regeneration N · {platform}" sections. Entries without `regenPlatform` appear under "Initial generation".

## `BudgetExceededError` Rules

- Always re-throw from inner agent try-catch blocks
- Never triggers refunds
- Sets `project.status = "budget_exceeded"` (terminal)

## Pre-flight Validation

`runPreflightCheck()` in `src/lib/pipeline/preflight.ts` — lightweight check before expensive inputs. ~$0.0001 vs $0.018+ for full extraction. Throws `PreflightError` → 422 to user, no credits spent.

## Cross-References

- Budget hook: [[Hook - useBudget]]
- Cost breakdown UI: [[Component - Budget UI]]
- Pipeline integration: [[Wiki/Pipeline/Orchestrator]]
- Per-project cost hook: [[Wiki/Hooks/Hook - useProjectCost]]
- Refund hook: `src/hooks/useProjectRefunds.ts`
