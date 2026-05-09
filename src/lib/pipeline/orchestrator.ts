import { BudgetExceededError } from "@/src/types/budget";
import { runIngestionAgent } from "./agent-ingest";
import { runAnalysisAgent } from "./agent-analyze";
import { runExtractionAgent } from "./agent-extract";
import { runSynthesisAgent } from "./agent-synthesize";
import { runAuthenticatorAgent } from "./agent-authenticate";
import { runHookScoringAgent } from "./agent-score-hooks";
import { runPreflightCheck, PreflightError } from "./preflight";
import { processRefund, processPlatformSynthesisRefund } from "@/src/lib/budget/refund";
import {
  updateProjectStatus,
  writeSKO,
  writeOutputs,
  writeAnalysis,
  writeToneCheck,
  writeC2PAManifests,
  writeHookScores,
  writeProjectMeta,
  writeSourceContent,
  getProjectCostLog,
  writeTotalCost,
} from "@/src/lib/firestore/helpers";
import { pipelineLogger } from "./logger";
import { NEUTRAL_ANALYSIS_SCORE, type InformationGainScore } from "@/src/lib/ai/schemas/information-gain";

export interface PipelineInput {
  projectId: string;
  mode: "url" | "text" | "file";
  value: string;
}

/**
 * Fire-and-forget pipeline orchestrator.
 * Call this without awaiting — it writes state to Firestore as it progresses.
 * The client watches Firestore via onSnapshot for real-time updates.
 */
export async function runPipeline(input: PipelineInput): Promise<void> {
  const { projectId, mode, value } = input;

  // Track which stage we reached — determines refund tier on failure.
  // "pre_extract": failed before SKO was persisted → full refund
  // "synthesis": failed after SKO was persisted → synthesis-only refund
  let currentStage: "pre_extract" | "synthesis" = "pre_extract";

  pipelineLogger.info({ projectId, message: "Pipeline started", status: "ingesting" });

  try {
    // Agent 1: Ingest
    await updateProjectStatus(projectId, "ingesting");
    const ingested = await runIngestionAgent({ projectId, mode, value });

    // Persist title and source preview so UI can display them immediately.
    // writeSourceContent stores the full raw content in a subcollection — fire-and-forget.
    await writeProjectMeta(projectId, {
      title: ingested.title,
      sourcePreview: ingested.rawContent.slice(0, 200),
    });
    writeSourceContent(projectId, ingested.title, ingested.rawContent).catch((err) => {
      pipelineLogger.warn({ projectId, agent: "ingest", message: "writeSourceContent failed (non-fatal)", error: (err as Error).message });
    });

    // Agent 1.5: Analyze — fault-tolerant, falls back to neutral score on failure
    await updateProjectStatus(projectId, "analyzing");
    let analysisScore: InformationGainScore = NEUTRAL_ANALYSIS_SCORE;
    try {
      analysisScore = await runAnalysisAgent(projectId, ingested);
      await writeAnalysis(projectId, analysisScore);
    } catch (analysisErr) {
      if (analysisErr instanceof BudgetExceededError) throw analysisErr;
      pipelineLogger.warn({
        projectId,
        agent: "analyze",
        message: "Analysis failed — continuing with neutral score",
        error: (analysisErr as Error).message,
      });
    }

    // Pre-flight: lightweight check before expensive extraction (skipped for short inputs)
    await runPreflightCheck(ingested.rawContent, projectId);

    // Agent 2: Extract → SKO (receives analysis score for weighted extraction)
    await updateProjectStatus(projectId, "extracting");
    const sko = await runExtractionAgent(projectId, ingested, analysisScore);

    // Persist SKO (immutable after creation). After this point, extraction value is delivered
    // so only synthesis costs are refundable on failure.
    await writeSKO(projectId, sko);
    currentStage = "synthesis";

    // Agent 3: Synthesize (parallel outputs)
    await updateProjectStatus(projectId, "synthesizing");
    const outputs = await runSynthesisAgent(projectId, sko, analysisScore);

    // Guard: if every platform failed, treat as pipeline error (not silent empty complete)
    const hasAnyOutput =
      outputs.twitter ||
      outputs.linkedin ||
      outputs.newsletter ||
      outputs.veo ||
      outputs.dark_social;

    if (!hasAnyOutput) {
      throw new Error("All synthesis platforms failed — no outputs produced");
    }

    // Write all outputs (includes per-platform errors in outputErrors field)
    await writeOutputs(projectId, outputs);

    // Refund the cost of any platforms that failed during synthesis — best-effort, parallel
    if (Object.keys(outputs.errors).length > 0) {
      await Promise.all(
        Object.keys(outputs.errors).map((platform) =>
          processPlatformSynthesisRefund(projectId, platform).catch((err) => {
            pipelineLogger.warn({
              projectId,
              agent: "refund",
              message: `Per-platform synthesis refund failed for ${platform} (non-fatal)`,
              error: (err as Error).message,
            });
          })
        )
      );
    }

    // Agent 3.5: Score Hooks — fault-tolerant, outputs already written
    await updateProjectStatus(projectId, "scoring");
    try {
      const hookScores = await runHookScoringAgent(projectId, sko, outputs);
      await writeHookScores(projectId, hookScores);
    } catch (scoringErr) {
      if (scoringErr instanceof BudgetExceededError) throw scoringErr;
      pipelineLogger.warn({
        projectId,
        agent: "score_hooks",
        message: "Hook scoring failed — continuing without scores",
        error: (scoringErr as Error).message,
      });
    }

    // Agent 4: Authenticate — fault-tolerant, outputs already written
    await updateProjectStatus(projectId, "authenticating");
    try {
      const authResult = await runAuthenticatorAgent(projectId, sko, outputs);
      await writeToneCheck(projectId, authResult.toneCheck, outputs.errors);
      await writeC2PAManifests(projectId, authResult.manifests);
    } catch (authErr) {
      if (authErr instanceof BudgetExceededError) throw authErr;
      pipelineLogger.warn({
        projectId,
        agent: "authenticate",
        message: "Authentication failed — outputs still available",
        error: (authErr as Error).message,
      });
    }

    // Mark complete
    await updateProjectStatus(projectId, "complete");

    // Write total cost to project doc for fast dashboard display — non-fatal.
    getProjectCostLog(projectId)
      .then((log) => {
        const total = log.reduce((s, e) => s + e.costUsd, 0);
        return writeTotalCost(projectId, total);
      })
      .catch((err) => {
        pipelineLogger.warn({ projectId, agent: "orchestrator", message: "writeTotalCost failed (non-fatal)", error: (err as Error).message });
      });

    pipelineLogger.info({ projectId, message: "Pipeline complete", status: "complete" });
  } catch (err) {
    const error = err as Error;

    if (err instanceof BudgetExceededError) {
      // Budget exceeded is a safety stop — NOT a failure that warrants a refund
      pipelineLogger.error({
        projectId,
        message: "Pipeline stopped: budget exceeded",
        status: "budget_exceeded",
        error: error.message,
      });
      await updateProjectStatus(projectId, "budget_exceeded", error.message).catch((writeErr) => {
        pipelineLogger.error({
          projectId,
          message: "Failed to write budget_exceeded status to Firestore",
          error: (writeErr as Error).message,
        });
      });
      return;
    }

    const isPreflight = err instanceof PreflightError;

    pipelineLogger.error({
      projectId,
      message: isPreflight ? "Pipeline stopped: pre-flight rejected content" : "Pipeline failed",
      status: "error",
      error: error.message,
    });

    await updateProjectStatus(projectId, "error", error.message).catch((writeErr) => {
      pipelineLogger.error({
        projectId,
        message: "Failed to write error status to Firestore",
        error: (writeErr as Error).message,
      });
    });

    // Stage-aware refund: full refund for pre-extraction failures, synthesis-only for post-SKO failures
    await processRefund(projectId, currentStage === "synthesis" ? "synthesis_only" : "full");
  }
}
