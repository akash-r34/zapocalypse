---
type: concept
domain: architecture
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - concept
  - architecture
  - pipeline
related:
  - "[[Wiki/Pipeline/Orchestrator]]"
  - "[[Wiki/Pages/API Routes]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Rules/pipeline-safety]]"
  - "[[Sources/Memory/decisions]]"
---

# Fire and Forget Pattern

> The API route returns `202 Accepted` immediately and the pipeline runs asynchronously, writing state transitions to Firestore that the client watches via `onSnapshot`.

## The Problem

The full pipeline (7 agents, ~10-30 seconds) would exceed Next.js route timeout if `await`ed in a route handler. Firebase App Hosting sets `timeoutSeconds: 300` as a backup but the preferred approach is never blocking.

## Implementation

### API Route (`app/api/pipeline/run/route.ts`)

```typescript
export async function POST(request: Request) {
  const body = await request.json();

  // 1. Validate input — 400 on failure, before any Firestore writes
  await validateInput(body);

  // 2. Create Firestore project doc synchronously
  const projectId = generateId();
  await createProject(projectId, body.mode);

  // 3. Fire and forget — NO await
  void runPipeline({ projectId, mode: body.mode, value: body.value });

  // 4. Return immediately
  return NextResponse.json({ projectId }, { status: 202 });
}
```

Key: `void runPipeline(...)` — the `void` keyword explicitly discards the Promise. The route does not await it.

### Orchestrator (`src/lib/pipeline/orchestrator.ts`)

The orchestrator writes Firestore status at every state transition:

```typescript
async function runPipeline(input: PipelineInput): Promise<void> {
  await updateProjectStatus(projectId, "ingesting");
  const ingested = await runIngestionAgent(input);

  await updateProjectStatus(projectId, "analyzing");
  const score = await runAnalysisAgent(projectId, ingested)
    .catch(() => NEUTRAL_ANALYSIS_SCORE);  // fault-tolerant

  await updateProjectStatus(projectId, "extracting");
  const sko = await runExtractionAgent(projectId, ingested, score);

  await updateProjectStatus(projectId, "synthesizing");
  const outputs = await runSynthesisAgent(projectId, sko, score);

  // ... scoring, authenticating, complete
}
```

Every `await updateProjectStatus(...)` call writes to Firestore before the next agent starts. If the Cloud Run instance crashes, the last known state is persisted.

### Client-Side Watching

The client (`app/project/[projectId]/page.tsx`) uses [[Wiki/Hooks/Hook - useProject]] which subscribes via Firestore `onSnapshot`:

```typescript
// Simplified
onSnapshot(projectRef(projectId), (doc) => {
  setProject(doc.data());
});
```

The UI updates in real time as each agent completes, without polling.

## Error Handling in Fire-and-Forget

```typescript
// Orchestrator top-level catch
try {
  // ... pipeline stages
} catch (err) {
  if (err instanceof BudgetExceededError) {
    await updateProjectStatus(projectId, "budget_exceeded");
    await processRefund(projectId, "full");
  } else {
    await updateProjectStatus(projectId, "error", err.message);
    await processRefund(projectId, determineRefundStage());
  }
}
```

`error` and `budget_exceeded` are **terminal states** — never automatically retried.

## Why Not Use Server-Sent Events or WebSockets?

Firestore `onSnapshot` gives real-time updates without managing a persistent connection. Firebase App Hosting (Cloud Run) scales to zero between requests — SSE/WebSocket connections would prevent scale-down. `onSnapshot` is a pull-based subscription over HTTPS that works with scale-to-zero.

## Selective Regeneration

The same pattern applies to `/api/pipeline/regenerate`:
```typescript
void runSelectiveRegeneration(projectId, platform, feedback);
return NextResponse.json({ status: "processing" }, { status: 202 });
```

The client watches `project.regenerationState[platform]` via `useProject`.

## Cross-References

- Implementation: [[Wiki/Pipeline/Orchestrator]]
- API route: [[Wiki/Pages/API Routes]]
- Client hook: [[Wiki/Hooks/Hook - useProject]]
- Error states: [[Wiki/Pipeline/Pipeline Overview]]
