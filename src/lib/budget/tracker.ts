import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { BudgetExceededError, type BudgetDoc } from "@/src/types/budget";
import { calculateCost } from "./pricing";

const BUDGET_LIMIT = 100; // USD per month
const BUDGET_DOC_PATH = "budget/current";

export async function checkBudget(): Promise<void> {
  const db = getFirestore();
  const ref = db.doc(BUDGET_DOC_PATH);
  const snap = await ref.get();

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  if (!snap.exists) {
    // Initialize budget doc on first use
    await ref.set({
      spent: 0,
      limit: BUDGET_LIMIT,
      killSwitch: false,
      budgetMonth: currentMonth,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  const data = snap.data() as BudgetDoc;

  // Reset if month has changed
  if (data.budgetMonth !== currentMonth) {
    await ref.update({
      spent: 0,
      budgetMonth: currentMonth,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  // Cloud Billing Alert sets killSwitch via Pub/Sub → Cloud Function
  if (data.killSwitch) {
    throw new BudgetExceededError(data.spent, data.limit);
  }

  if (data.spent >= data.limit) {
    throw new BudgetExceededError(data.spent, data.limit);
  }
}

interface RecordCostParams {
  projectId: string;
  agentName: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  /** Set to the platform name when this call is part of a selective regeneration cascade. */
  regenPlatform?: string;
}

export async function recordCost(params: RecordCostParams): Promise<void> {
  const { projectId, agentName, model, promptTokens, outputTokens, regenPlatform } = params;
  const costDelta = calculateCost(model, promptTokens, outputTokens);

  if (costDelta <= 0) return;

  const db = getFirestore();

  // Atomically increment monthly spend
  await db.doc(BUDGET_DOC_PATH).update({
    spent: FieldValue.increment(costDelta),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Log per-call cost to project subcollection for audit trail
  const entry: Record<string, unknown> = {
    agentName,
    model,
    promptTokens,
    outputTokens,
    costUsd: costDelta,
    timestamp: FieldValue.serverTimestamp(),
  };
  if (regenPlatform) {
    entry.regenPlatform = regenPlatform;
  }

  await db
    .collection("projects")
    .doc(projectId)
    .collection("cost_log")
    .add(entry);
}
