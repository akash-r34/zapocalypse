---
type: decision
domain: pipeline
source_file: src/lib/pipeline/orchestrator.ts, app/api/pipeline/run/route.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - decision
  - pipeline
  - architecture
related:
  - "[[Wiki/Pipeline/Orchestrator]]"
  - "[[Wiki/Architecture/Fire and Forget Pattern]]"
  - "[[Wiki/Architecture/Hub and Spoke via SKO]]"
sources:
  - "[[Sources/Memory/decisions]]"
---

# Decisions - Pipeline Architecture

> Structural decisions: fire-and-forget, hub-and-spoke, agents as imports, SKO immutability, fault tolerance.

## Hub-and-Spoke via SKO

**Decision:** All 5 platform outputs derive from a single Structured Knowledge Object (SKO), not directly from raw input.

**Why:** Consistency across platforms, semantic deduplication, enables future platform additions without re-processing the source.

**Result:** Agent 2 (Extract) must always produce a valid SKO. Agent 3 (Synthesize) takes SKO as input, never raw content. SKO immutable after creation — new run = new project doc.

See [[Wiki/Architecture/Hub and Spoke via SKO]].

---

## Fire-and-Forget Pipeline

**Decision:** `/api/pipeline/run` returns `202 Accepted` immediately. Orchestrator runs without `await` in the route handler.

**Why:** Pipeline takes 30-120s. Cloud Run default timeout is 60s. Client watches Firestore via `onSnapshot` — doesn't need HTTP response.

**Result:** `void runPipeline({ projectId, mode, value })`. Route creates Firestore doc, fires orchestrator, returns `{ projectId }`. `apphosting.yaml` sets `timeoutSeconds: 300` as backup.

See [[Wiki/Architecture/Fire and Forget Pattern]].

---

## Agents as Function Imports

**Decision:** Pipeline agents are TypeScript functions called directly by the orchestrator — not HTTP route handlers called internally.

**Why:** Eliminates cold-start latency between steps, simpler error propagation, easier to test in isolation.

**Result:** `orchestrator.ts` imports `runIngestionAgent`, `runAnalysisAgent`, etc. directly. There are no `/api/agents/*` endpoints for internal use.

---

## `IngestedContent` as Agent Contract

**Decision:** Agent 1 returns a typed `IngestedContent` object, not raw text. Agent 2 consumes `IngestedContent`.

**Why:** Without a schema, Agent 2 has no reliable structured input and prompt engineering becomes fragile.

**Result:** `src/lib/ai/schemas/ingested-content.ts` defines the Zod schema. Both agents import it.

---

## SKO Immutability

**Decision:** The SKO produced by Agent 2 (Extract) is read-only for Agent 3 (Synthesize). Never mutated inside synthesis.

**Why:** Mutation mid-pipeline risks data corruption across the 5 parallel synthesis tasks. Each platform output must be derived from the same SKO snapshot.

**Result:** `writeSKO()` called once by orchestrator after extraction. `runSynthesisAgent()` takes SKO as input parameter (not a live Firestore ref).

---

## `Promise.allSettled` for Synthesis

**Decision:** The 5 synthesis tasks run in parallel via `Promise.allSettled`. One platform failing must not block others.

**Why:** Each platform output is independent. Sequential synthesis would mean a Twitter error blocks LinkedIn, newsletter, etc.

**Result:** Each settled result checked individually: successes written to Firestore, failures logged to `project.outputErrors`. `allFailed` check: if all 5 fail → `error` state.

---

## Orchestrator Owns All Firestore Writes

**Decision:** Agents return data only — they do not write to Firestore. Orchestrator is responsible for all writes.

**Exception:** Budget tracker reads and writes `budget/current` directly.

**Why:** Centralized write responsibility makes state transitions predictable and auditable. Avoids race conditions.

---

## Tiered Refund Stage Tracking

**Decision:** `currentStage` variable in orchestrator tracks `"pre_extract"` vs `"synthesis"` to enable stage-aware refunds.

**Why:** If synthesis fails after extraction succeeds, blanket refund eats the extraction cost (the "token trap"). SKO retained as user asset.

**Result:** `processRefund(projectId, "synthesis_only")` called for post-SKO failures. `processRefund(projectId, "full")` for pre-SKO failures. `BudgetExceededError` never triggers refunds.

## Cross-References

- Orchestrator code: [[Wiki/Pipeline/Orchestrator]]
- Fire-and-forget: [[Wiki/Architecture/Fire and Forget Pattern]]
- SKO: [[Wiki/Architecture/Hub and Spoke via SKO]]
- Expert critique decisions: [[Decisions - V3 Expert Critique]]
