---
type: entity
entity_kind: utility
domain: pipeline
source_file: src/lib/pipeline/orchestrator.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - utility
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Architecture/Fire and Forget Pattern]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Rules/pipeline-safety]]"
---

# Orchestrator

> The orchestrator is the backbone of the pipeline — it runs all agents in sequence, writes every state transition to Firestore, and handles errors, refunds, and budget failures.

## Signature

```typescript
// src/lib/pipeline/orchestrator.ts

export interface PipelineInput {
  projectId: string;
  mode: "url" | "text" | "file";
  value: string;
}

export async function runPipeline(input: PipelineInput): Promise<void>
```

Called fire-and-forget from the API route: `void runPipeline(input)`. Never awaited.

## Full Flow

```typescript
export async function runPipeline(input: PipelineInput): Promise<void> {
  const { projectId, mode, value } = input;
  let currentStage: "pre_extract" | "synthesis" = "pre_extract";

  try {
    // Agent 1: Ingest
    await updateProjectStatus(projectId, "ingesting");
    const ingested = await runIngestionAgent({ projectId, mode, value });
    await writeProjectMeta(projectId, { title: ingested.title, sourcePreview: ingested.rawContent.slice(0, 200) });
    writeSourceContent(projectId, ingested.title, ingested.rawContent).catch(...); // fire-and-forget

    // Agent 1.5: Analyse (fault-tolerant)
    await updateProjectStatus(projectId, "analyzing");
    let analysisScore: InformationGainScore = NEUTRAL_ANALYSIS_SCORE;
    try {
      analysisScore = await runAnalysisAgent(projectId, ingested);
      await writeAnalysis(projectId, analysisScore);
    } catch (analysisErr) {
      if (analysisErr instanceof BudgetExceededError) throw analysisErr; // re-throw budget errors
      // log warning, continue with neutral score
    }

    // Pre-flight check
    await runPreflightCheck(ingested.rawContent, projectId);

    // Agent 2: Extract → SKO
    await updateProjectStatus(projectId, "extracting");
    const sko = await runExtractionAgent(projectId, ingested, analysisScore);
    await writeSKO(projectId, sko);
    currentStage = "synthesis"; // refund tier switches here

    // Agent 3: Synthesize (5 parallel platforms)
    await updateProjectStatus(projectId, "synthesizing");
    const outputs = await runSynthesisAgent(projectId, sko, analysisScore);
    if (!outputs.twitter && !outputs.linkedin && !outputs.newsletter && !outputs.veo && !outputs.dark_social) {
      throw new Error("All synthesis platforms failed");
    }
    await writeOutputs(projectId, outputs);

    // Agent 3.5: Hook Scorer (fault-tolerant)
    await updateProjectStatus(projectId, "scoring");
    try {
      const hookScores = await runHookScoringAgent(projectId, sko, outputs);
      await writeHookScores(projectId, hookScores);
    } catch (scoringErr) {
      if (scoringErr instanceof BudgetExceededError) throw scoringErr;
      // log warning, continue
    }

    // Agent 4: Authenticator (fault-tolerant)
    await updateProjectStatus(projectId, "authenticating");
    try {
      const authResult = await runAuthenticatorAgent(projectId, sko, outputs);
      await writeToneCheck(projectId, authResult.toneCheck);
      await writeC2PAManifests(projectId, authResult.manifests);
    } catch (authErr) {
      if (authErr instanceof BudgetExceededError) throw authErr;
      // log warning, continue
    }

    await updateProjectStatus(projectId, "complete");

    // Write total cost to project doc for dashboard display (non-fatal, fire-and-forget)
    getProjectCostLog(projectId)
      .then((log) => writeTotalCost(projectId, log.reduce((s, e) => s + e.costUsd, 0)))
      .catch(...);

  } catch (err) {
    if (err instanceof BudgetExceededError) {
      await updateProjectStatus(projectId, "budget_exceeded", err.message);
      return; // NO refund for budget exceeded — it's a safety stop
    }
    await updateProjectStatus(projectId, "error", err.message);
    await processRefund(projectId, currentStage === "synthesis" ? "synthesis_only" : "full");
  }
}
```

## Key Design Rules

1. **Status write before agent call** — `updateProjectStatus` is called BEFORE starting each agent. If the process crashes during an agent, Firestore shows the last known state.
2. **Orchestrator owns all Firestore writes** — agents return data only. Orchestrator calls `write*` helpers after receiving agent output.
3. **Exception: budget tracker** — reads/writes `budget/current` directly (by design, not through orchestrator).
4. **`BudgetExceededError` is rethrown everywhere** — never swallowed in fault-tolerant try/catches.
5. **`PreflightError` stops pipeline early** — prevents running expensive extraction on obviously bad content.

## Imports Used

```typescript
import { runIngestionAgent } from "./agent-ingest";
import { runAnalysisAgent } from "./agent-analyze";
import { runExtractionAgent } from "./agent-extract";
import { runSynthesisAgent } from "./agent-synthesize";
import { runAuthenticatorAgent } from "./agent-authenticate";
import { runHookScoringAgent } from "./agent-score-hooks";
import { runPreflightCheck, PreflightError } from "./preflight";
import { processRefund } from "@/src/lib/budget/refund";
import {
  updateProjectStatus, writeSKO, writeOutputs, writeAnalysis,
  writeToneCheck, writeC2PAManifests, writeHookScores,
  writeProjectMeta, writeSourceContent, getProjectCostLog, writeTotalCost
} from "@/src/lib/firestore/helpers";
import { pipelineLogger } from "./logger";
import { NEUTRAL_ANALYSIS_SCORE } from "@/src/lib/ai/schemas/information-gain";
```

## Cross-References

- Architecture pattern: [[Wiki/Architecture/Fire and Forget Pattern]]
- State machine: [[Pipeline Overview]]
- Firestore writes: [[Wiki/Data/Firestore Helpers]]
- Budget system: [[Wiki/Concepts/Budget Protection Layers]]
- Refund logic: details in [[Wiki/Infrastructure/API Endpoints]]
