/**
 * Kill-switch handler — called by Cloud Function when GCP Billing Alert fires.
 *
 * Deployment: Create a Cloud Function (2nd gen) triggered by Pub/Sub topic
 * `billing-alerts`. The GCP Budget Alert publishes to this topic when spend
 * reaches the $95 threshold configured in the GCP Console.
 *
 * Cloud Function entry point: `handleBillingAlert` (exported below).
 * Runtime: nodejs20, memory: 256MB, timeout: 60s.
 *
 * To deploy:
 *   gcloud functions deploy handleBillingAlert \
 *     --gen2 --runtime nodejs20 --region us-central1 \
 *     --trigger-topic billing-alerts \
 *     --entry-point handleBillingAlert \
 *     --source ./src/lib/budget
 */

import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialise Admin SDK (idempotent — safe to call multiple times)
function ensureAdminInit() {
  if (getApps().length === 0) initializeApp();
}

export interface PubSubMessage {
  data: string; // base64-encoded JSON
  attributes?: Record<string, string>;
}

/**
 * Cloud Function entry point.
 * Sets `budget/current.killSwitch = true` in Firestore.
 * The orchestrator reads this flag before each agent call via `checkBudget()`.
 */
export async function handleBillingAlert(message: PubSubMessage): Promise<void> {
  ensureAdminInit();

  // Decode and log the billing alert payload for audit purposes
  const payload = message.data
    ? Buffer.from(message.data, "base64").toString("utf8")
    : "{}";

  console.log(JSON.stringify({ event: "billing_alert", payload }));

  const db = getFirestore();
  await db.doc("budget/current").set(
    {
      killSwitch: true,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(JSON.stringify({ event: "kill_switch_activated" }));
}
