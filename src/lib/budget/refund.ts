import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getProjectCostLog, markProjectRefunded, writeRefundLogEntry } from "@/src/lib/firestore/helpers";
import { pipelineLogger } from "@/src/lib/pipeline/logger";
import type { Timestamp } from "firebase-admin/firestore";

/**
 * Agent names that belong to the synthesis phase.
 * Verified against actual agentName strings passed to recordCost() in each agent file.
 * refine_tone and regenerate_* are user-triggered, not main-pipeline agents.
 */
const SYNTHESIS_AGENTS = new Set([
  "synthesize_twitter",
  "synthesize_linkedin",
  "synthesize_newsletter",
  "synthesize_veo",
  "synthesize_dark_social",
  "score_hooks",
  "authenticate",
]);

/**
 * Calculate and apply a stage-aware refund for a failed pipeline run.
 *
 * - "full": refund all costs (failed before extraction delivered value)
 * - "synthesis_only": refund only synthesis-phase costs (extraction succeeded — SKO retained)
 *
 * Uses FieldValue.increment(-amount) to atomically decrement budget/current.spent.
 * Never throws — errors are logged so they don't shadow the original pipeline error.
 */
export async function processRefund(
  projectId: string,
  stage: "full" | "synthesis_only"
): Promise<void> {
  try {
    const costLog = await getProjectCostLog(projectId);

    if (costLog.length === 0) {
      pipelineLogger.info({
        projectId,
        agent: "refund",
        message: "No cost log entries found — skipping refund",
      });
      return;
    }

    const entriesToRefund =
      stage === "full"
        ? costLog
        : costLog.filter((entry) => SYNTHESIS_AGENTS.has(entry.agentName));

    const refundAmount = entriesToRefund.reduce((sum, entry) => sum + entry.costUsd, 0);

    if (refundAmount <= 0) {
      pipelineLogger.info({
        projectId,
        agent: "refund",
        message: `No refundable costs for stage "${stage}"`,
      });
      return;
    }

    const db = getFirestore();
    await db.doc("budget/current").update({
      spent: FieldValue.increment(-refundAmount),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await markProjectRefunded(projectId, refundAmount, stage);

    pipelineLogger.info({
      projectId,
      agent: "refund",
      message: `Refunded $${refundAmount.toFixed(6)} (stage: ${stage})`,
      amount: refundAmount,
    });
  } catch (err) {
    pipelineLogger.error({
      projectId,
      agent: "refund",
      message: "Refund processing failed — project may not be marked as refunded",
      error: (err as Error).message,
    });
  }
}

/**
 * Refund the cost of a single first-gen platform failure.
 *
 * Filters cost_log entries by agentName === `synthesize_{platform}`, decrements
 * budget/current.spent, and writes a refund_log entry (attempt=0, reason="synthesis_failed").
 * Returns the refunded amount (0 if nothing to refund). Never throws.
 */
export async function processPlatformSynthesisRefund(
  projectId: string,
  platform: string
): Promise<number> {
  try {
    const costLog = await getProjectCostLog(projectId);
    const agentName = `synthesize_${platform}`;

    const entriesToRefund = costLog.filter((e) => e.agentName === agentName);
    const refundAmount = entriesToRefund.reduce((sum, e) => sum + e.costUsd, 0);

    if (refundAmount <= 0) {
      pipelineLogger.info({ projectId, agent: "refund", message: `No synthesis costs to refund for ${platform}` });
      return 0;
    }

    const db = getFirestore();
    await db.doc("budget/current").update({
      spent: FieldValue.increment(-refundAmount),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await writeRefundLogEntry(projectId, {
      platform,
      amount: refundAmount,
      reason: "synthesis_failed",
      attempt: 0,
      agentNames: [agentName],
    });

    pipelineLogger.info({
      projectId,
      agent: "refund",
      message: `Synthesis refund $${refundAmount.toFixed(6)} for ${platform}`,
      amount: refundAmount,
    });

    return refundAmount;
  } catch (err) {
    pipelineLogger.error({
      projectId,
      agent: "refund",
      message: `Synthesis refund failed for ${platform}: ${(err as Error).message}`,
    });
    return 0;
  }
}

/**
 * Refund the cost of a failed regeneration attempt (retry or feedback-based refine).
 *
 * Filters cost_log entries by:
 *   - agentName: `regenerate_{platform}` or `refine_tone`
 *   - timestamp >= regenStartTimeMs (only entries written during this attempt)
 *
 * Atomically decrements budget/current.spent and writes a refund_log entry.
 * Returns the refunded amount (0 if nothing to refund).
 * Never throws.
 */
export async function processRegenRefund(
  projectId: string,
  platform: string,
  regenStartTimeMs: number
): Promise<number> {
  try {
    const costLog = await getProjectCostLog(projectId);
    const regenAgents = new Set([`regenerate_${platform}`, "refine_tone"]);

    const entriesToRefund = costLog.filter((entry) => {
      if (!regenAgents.has(entry.agentName)) return false;
      const ts = entry.timestamp as unknown as Timestamp;
      const entryMs = ts?.toMillis ? ts.toMillis() : 0;
      return entryMs >= regenStartTimeMs;
    });

    const refundAmount = entriesToRefund.reduce((sum, e) => sum + e.costUsd, 0);

    if (refundAmount <= 0) {
      pipelineLogger.info({ projectId, agent: "refund", message: `No regen costs to refund for ${platform}` });
      return 0;
    }

    const db = getFirestore();
    await db.doc("budget/current").update({
      spent: FieldValue.increment(-refundAmount),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Determine attempt number by counting prior regenerate_{platform} entries in the cost_log
    // (already fetched above). Each one represents a completed prior regen attempt (success or
    // failure), which matches the 1-based attemptIndex CostBreakdown assigns to each regen group.
    // Using refund_log count was wrong: synthesis_failed entries (attempt=0) inflate the count,
    // causing attempt=2 when CostBreakdown expects attempt=1 for the first regen.
    const regenAgentName = `regenerate_${platform}`;
    const priorRegenCount = costLog.filter((e) => {
      if (e.agentName !== regenAgentName) return false;
      const ts = e.timestamp as unknown as Timestamp;
      const entryMs = ts?.toMillis ? ts.toMillis() : 0;
      return entryMs < regenStartTimeMs;
    }).length;

    await writeRefundLogEntry(projectId, {
      platform,
      amount: refundAmount,
      reason: "regen_failed",
      attempt: priorRegenCount + 1,
      agentNames: entriesToRefund.map((e) => e.agentName),
    });

    pipelineLogger.info({
      projectId,
      agent: "refund",
      message: `Regen refund $${refundAmount.toFixed(6)} for ${platform}`,
      amount: refundAmount,
    });

    return refundAmount;
  } catch (err) {
    pipelineLogger.error({
      projectId,
      agent: "refund",
      message: `Regen refund failed for ${platform}: ${(err as Error).message}`,
    });
    return 0;
  }
}
