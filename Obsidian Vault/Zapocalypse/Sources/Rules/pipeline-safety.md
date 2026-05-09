# Rules: Pipeline & Orchestrator Safety

## Input validation
- Validate ALL input BEFORE creating the Firestore project doc.
- URL: `fetch()` with 10s timeout, reject if >500KB or non-text/html content-type.
- Text: reject if <100 chars or >50,000 chars.
- File: reject if >5MB or not text/pdf/docx.
- YouTube URLs: return a user-friendly error suggesting they paste the transcript as text.
- On validation failure: return `400` from the route handler — do NOT create a project doc.

## Fire-and-forget pattern
- `/api/pipeline/run` creates the Firestore project doc, then calls `runPipeline(projectId, input)` WITHOUT `await`.
- Route returns `202 Accepted` with `{ projectId }` immediately.
- Do NOT `await` the orchestrator in the route handler — this would block until pipeline completes and risk timeout.
- `apphosting.yaml` sets `timeoutSeconds: 300` as a backup.

## State machine
- Valid transitions only: `idle → ingesting → analyzing → extracting → synthesizing → scoring → authenticating → complete | error | budget_exceeded`
- Write every state transition to Firestore before starting the next agent — if the process crashes, the last known state is persisted.
- `budget_exceeded` and `error` are terminal — never transition out of them automatically.

## Budget checks
- Budget must be checked before Agent 1, Agent 2, and Agent 3 independently.
- A single check at pipeline start is NOT sufficient — costs accumulate per agent.
- On `BudgetExceededError`: set Firestore status to `budget_exceeded`, stop pipeline, do not call remaining agents.

## Agent execution
- Agents are direct function imports — never use `fetch('/api/agents/...')` internally.
- Agent 3 uses `Promise.allSettled` for the 4 synthesis tasks — one platform failing must not block others.
- Each settled result must be checked: write successes to Firestore, log failures per-platform.

## SKO immutability
- The SKO produced by Agent 2 is read-only for Agent 3. Never mutate it inside synthesis.
- If SKO validation fails (Zod parse error), set pipeline to `error` state — do not attempt synthesis with invalid data.

## Firestore writes
- Orchestrator is responsible for all Firestore writes. Agents return data only — they do not write directly.
- Exception: budget tracker reads and writes `budget/current` directly.

## No silent failures
- Every caught error in the orchestrator must either: (a) set pipeline state to `error` with a message, or (b) be a per-platform synthesis failure logged to the platform's Firestore doc.
- Do not swallow errors with empty catch blocks.
