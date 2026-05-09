import { getFirestore, FieldValue } from "firebase-admin/firestore";
import type { PipelineStatus, ToneRefinement } from "@/src/types/project";
import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { SynthesisOutputs } from "@/src/lib/pipeline/agent-synthesize";
import type { InformationGainScore } from "@/src/lib/ai/schemas/information-gain";
import type { ToneCheckResult } from "@/src/lib/ai/schemas/tone-check";
import type { C2PAManifest } from "@/src/lib/ai/schemas/c2pa-manifest";
import type { HookScoreResult } from "@/src/lib/ai/schemas/hook-score";

export function projectRef(projectId: string) {
  return getFirestore().collection("projects").doc(projectId);
}

export async function createProject(projectId: string, sourceType: "url" | "text" | "file"): Promise<void> {
  await projectRef(projectId).set({
    id: projectId,
    status: "ingesting" satisfies PipelineStatus,
    sourceType,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    regenerationCount: 0,
  });
}

export async function updateProjectStatus(
  projectId: string,
  status: PipelineStatus,
  error?: string
): Promise<void> {
  const data: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (error) data.error = error;
  await projectRef(projectId).update(data);
}

export async function updateRegenerationStatus(
  projectId: string,
  platform: string,
  status: "processing" | "complete" | "error",
  error?: string,
  refundedAmount?: number,
  intent?: "retry" | "refine"
): Promise<void> {
  const update: Record<string, unknown> = {
    [`regenerationState.${platform}.status`]: status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (status === "processing") {
    update[`regenerationState.${platform}.startedAt`] = FieldValue.serverTimestamp();
    if (intent) {
      update[`regenerationState.${platform}.intent`] = intent;
    }
  } else {
    update[`regenerationState.${platform}.completedAt`] = FieldValue.serverTimestamp();
  }
  if (error) {
    update[`regenerationState.${platform}.error`] = error;
  }
  if (refundedAmount !== undefined && refundedAmount > 0) {
    update[`regenerationState.${platform}.refundedAmount`] = refundedAmount;
  }
  await projectRef(projectId).update(update);
}

export async function getRegenerationCount(
  projectId: string,
  platform: string
): Promise<number> {
  const db = getFirestore();
  const snap = await db
    .collection("projects")
    .doc(projectId)
    .collection("tone_history")
    .where("platform", "==", platform)
    .count()
    .get();
  return snap.data().count;
}

export async function readSKO(projectId: string): Promise<SKO | null> {
  const db = getFirestore();
  const snapshot = await db
    .collection("projects")
    .doc(projectId)
    .collection("sko")
    .doc("current")
    .get();
  
  if (!snapshot.exists) return null;
  return snapshot.data() as SKO;
}

export async function writeAnalysis(projectId: string, score: InformationGainScore): Promise<void> {
  const db = getFirestore();
  await db
    .collection("projects")
    .doc(projectId)
    .collection("analysis")
    .doc("current")
    .set({ ...score, savedAt: FieldValue.serverTimestamp() });
}

export async function writeSKO(projectId: string, sko: SKO): Promise<void> {
  const db = getFirestore();
  await db
    .collection("projects")
    .doc(projectId)
    .collection("sko")
    .doc("current")
    .set({ ...sko, savedAt: FieldValue.serverTimestamp() });
}

export async function writeToneRefinement(
  projectId: string,
  refinement: Omit<ToneRefinement, "id" | "timestamp">
): Promise<void> {
  const db = getFirestore();
  const refinementRef = db
    .collection("projects")
    .doc(projectId)
    .collection("tone_history")
    .doc();

  // JSON round-trip strips undefined — optional AdditiveFingerprint fields
  // would otherwise cause "Cannot use undefined as a Firestore value".
  const clean = JSON.parse(JSON.stringify(refinement)) as typeof refinement;

  await refinementRef.set({
    ...clean,
    id: refinementRef.id,
    timestamp: FieldValue.serverTimestamp(),
  });
}

export async function writeRegeneratedOutput(
  projectId: string,
  platform: string,
  output: unknown
): Promise<void> {
  const db = getFirestore();
  const projectDoc = projectRef(projectId);
  const outputDoc = projectDoc.collection("outputs").doc(platform);

  await db.runTransaction(async (transaction) => {
    // Read project doc to check whether this platform previously failed.
    // If outputErrors[platform] exists this is the first success after a failure —
    // don't show REGENERATED badge and clear the error entry.
    const projectSnap = await transaction.get(projectDoc);
    const outputErrors = (projectSnap.data()?.outputErrors ?? {}) as Record<string, string>;
    const isFirstSuccessAfterFailure = !!outputErrors[platform];

    transaction.set(outputDoc, {
      ...(output as Record<string, unknown>),
      generatedAt: FieldValue.serverTimestamp(),
      ...(isFirstSuccessAfterFailure ? {} : { isRegenerated: true }),
    });

    const projectUpdate: Record<string, unknown> = {
      regenerationCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (isFirstSuccessAfterFailure) {
      projectUpdate[`outputErrors.${platform}`] = FieldValue.delete();
    }
    transaction.update(projectDoc, projectUpdate);
  });
}

export async function writeOutputs(
  projectId: string,
  outputs: SynthesisOutputs
): Promise<void> {
  const db = getFirestore();
  const outputsCol = db
    .collection("projects")
    .doc(projectId)
    .collection("outputs");

  const writes: Promise<FirebaseFirestore.WriteResult>[] = [];

  if (outputs.twitter) {
    writes.push(
      outputsCol.doc("twitter").set({
        ...outputs.twitter,
        generatedAt: FieldValue.serverTimestamp(),
      })
    );
  }
  if (outputs.linkedin) {
    writes.push(
      outputsCol.doc("linkedin").set({
        ...outputs.linkedin,
        generatedAt: FieldValue.serverTimestamp(),
      })
    );
  }
  if (outputs.newsletter) {
    writes.push(
      outputsCol.doc("newsletter").set({
        ...outputs.newsletter,
        generatedAt: FieldValue.serverTimestamp(),
      })
    );
  }
  if (outputs.veo) {
    writes.push(
      outputsCol.doc("veo").set({
        ...outputs.veo,
        generatedAt: FieldValue.serverTimestamp(),
      })
    );
  }
  if (outputs.dark_social) {
    writes.push(
      outputsCol.doc("dark_social").set({
        ...outputs.dark_social,
        generatedAt: FieldValue.serverTimestamp(),
      })
    );
  }

  await Promise.all(writes);

  const updateData: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (Object.keys(outputs.errors).length > 0) {
    updateData.outputErrors = outputs.errors;
  }
  await projectRef(projectId).update(updateData);
}

export async function writeToneCheck(
  projectId: string,
  result: ToneCheckResult,
  outputErrors?: Record<string, string>
): Promise<void> {
  const db = getFirestore();
  // Strip per_platform entries for platforms that failed to generate — prevents 0-score
  // entries from appearing in ToneCheckBadge alongside the real failed-platform section.
  let filteredResult = result;
  if (outputErrors && Object.keys(outputErrors).length > 0) {
    const filteredPerPlatform = Object.fromEntries(
      Object.entries(result.per_platform ?? {}).filter(([platform]) => !outputErrors[platform])
    );
    filteredResult = { ...result, per_platform: filteredPerPlatform };
  }
  await db
    .collection("projects")
    .doc(projectId)
    .collection("tone_check")
    .doc("current")
    .set({ ...filteredResult, savedAt: FieldValue.serverTimestamp() });
}

export async function writeHookScores(projectId: string, result: HookScoreResult): Promise<void> {
  const db = getFirestore();
  await db
    .collection("projects")
    .doc(projectId)
    .collection("hook_scores")
    .doc("current")
    .set({ ...result, savedAt: FieldValue.serverTimestamp() });
}

export interface CostLogEntry {
  agentName: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  costUsd: number;
  timestamp: FirebaseFirestore.Timestamp;
}

export async function writeProjectMeta(
  projectId: string,
  meta: { title: string; sourcePreview: string }
): Promise<void> {
  await projectRef(projectId).update({
    title: meta.title,
    sourcePreview: meta.sourcePreview,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function writeSourceContent(
  projectId: string,
  title: string,
  rawContent: string
): Promise<void> {
  const db = getFirestore();
  await db
    .collection("projects")
    .doc(projectId)
    .collection("source")
    .doc("current")
    .set({ title, rawContent, savedAt: FieldValue.serverTimestamp() });
}

export async function writeTotalCost(projectId: string, totalCost: number): Promise<void> {
  await projectRef(projectId).update({ totalCost, updatedAt: FieldValue.serverTimestamp() });
}

export async function getProjectCostLog(projectId: string): Promise<CostLogEntry[]> {
  const db = getFirestore();
  const snap = await db
    .collection("projects")
    .doc(projectId)
    .collection("cost_log")
    .orderBy("timestamp", "asc")
    .get();
  return snap.docs.map((d) => d.data() as CostLogEntry);
}

export interface RefundLogEntry {
  platform: string;
  amount: number;
  reason: "synthesis_failed" | "regen_failed";
  attempt: number;
  agentNames: string[];
  createdAt: FirebaseFirestore.FieldValue;
}

export async function writeRefundLogEntry(
  projectId: string,
  entry: Omit<RefundLogEntry, "createdAt">
): Promise<void> {
  const db = getFirestore();
  await db
    .collection("projects")
    .doc(projectId)
    .collection("refund_log")
    .add({ ...entry, createdAt: FieldValue.serverTimestamp() });
}

export async function getRefundLogEntryCount(
  projectId: string,
  platform: string
): Promise<number> {
  const db = getFirestore();
  const snap = await db
    .collection("projects")
    .doc(projectId)
    .collection("refund_log")
    .where("platform", "==", platform)
    .count()
    .get();
  return snap.data().count;
}

export async function updateToneCheckForPlatform(
  projectId: string,
  platform: string,
  platformResult: { match_score: number; deviations: string[]; suggested_fixes: string[] },
  slopFlags: Array<{ platform: string; item_index: number; pattern: string; severity: string; suggestion: string }> = []
): Promise<void> {
  const db = getFirestore();
  const toneCheckRef = db
    .collection("projects")
    .doc(projectId)
    .collection("tone_check")
    .doc("current");

  // Single read — handles both the missing-document case (initial auth failed, doc never created)
  // and the normal update case. Using .update() would throw NOT_FOUND on a missing document,
  // which gets silently swallowed by the fire-and-forget cascade, leaving tone stuck at 0%.
  const snap = await toneCheckRef.get();
  const existing = snap.exists ? (snap.data() as Record<string, unknown>) : {};

  // Merge this platform's result into the full per_platform map in memory
  const existingPerPlatform = (existing.per_platform ?? {}) as Record<string, { match_score: number }>;
  const mergedPerPlatform = { ...existingPerPlatform, [platform]: platformResult };

  // Recompute overall score from all platforms
  const scores = Object.values(mergedPerPlatform).map((p) => p.match_score);
  const overall = scores.reduce((s, v) => s + v, 0) / scores.length;

  // Replace slop flags for this platform with the fresh set; retain flags from other platforms
  const existingFlags = Array.isArray(existing.ai_slop_flags) ? (existing.ai_slop_flags as typeof slopFlags) : [];
  const updatedFlags = [
    ...existingFlags.filter((f) => f.platform !== platform),
    ...slopFlags,
  ];

  // set() creates the document if missing. Passing the full merged per_platform map
  // (not dot-notation) means set() correctly writes all platforms in one shot.
  await toneCheckRef.set({
    per_platform: mergedPerPlatform,
    overall_match_score: overall,
    passed: overall >= 0.7,
    ai_slop_flags: updatedFlags,
    savedAt: FieldValue.serverTimestamp(),
  });
}

export async function markProjectRefunded(
  projectId: string,
  amount: number,
  stage: "full" | "synthesis_only"
): Promise<void> {
  const update: Record<string, unknown> = {
    refunded: true,
    refundedAmount: amount,
    refundStage: stage,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (stage === "synthesis_only") {
    update.skoRetained = true;
  }
  await projectRef(projectId).update(update);
}

export async function getMonthlyRefundTotal(): Promise<number> {
  const db = getFirestore();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const snap = await db
    .collection("projects")
    .where("refunded", "==", true)
    .where("updatedAt", ">=", startOfMonth)
    .get();

  return snap.docs.reduce((sum, d) => {
    const data = d.data();
    return sum + (typeof data.refundedAmount === "number" ? data.refundedAmount : 0);
  }, 0);
}

export async function writeC2PAManifests(
  projectId: string,
  manifests: Record<string, C2PAManifest>
): Promise<void> {
  const db = getFirestore();
  const c2paCol = db.collection("projects").doc(projectId).collection("c2pa");
  await Promise.all(
    Object.entries(manifests).map(([platform, manifest]) =>
      c2paCol.doc(platform).set({ ...manifest, savedAt: FieldValue.serverTimestamp() })
    )
  );
}

export async function writeC2PAManifest(
  projectId: string,
  platform: string,
  manifest: C2PAManifest
): Promise<void> {
  const db = getFirestore();
  await db
    .collection("projects")
    .doc(projectId)
    .collection("c2pa")
    .doc(platform)
    .set({ ...manifest, savedAt: FieldValue.serverTimestamp() });
}

/**
 * Read all platform output docs for a project and return them as a SynthesisOutputs-compatible
 * shape so hook scoring and authentication can be re-run after selective regeneration.
 */
export async function readAllPlatformOutputs(projectId: string): Promise<Record<string, unknown>> {
  const db = getFirestore();
  const snap = await db
    .collection("projects")
    .doc(projectId)
    .collection("outputs")
    .get();
  const result: Record<string, unknown> = {};
  for (const doc of snap.docs) {
    result[doc.id] = doc.data();
  }
  return result;
}

interface SigningKeyData {
  privateKeyPem: string;
  publicKeyPem: string;
  thumbprint: string;
}

export async function readSigningKey(): Promise<SigningKeyData | null> {
  const db = getFirestore();
  const snap = await db.collection("system").doc("c2pa_signing_key").get();
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data || typeof data.privateKeyPem !== "string" || typeof data.publicKeyPem !== "string" || typeof data.thumbprint !== "string") {
    return null;
  }
  return { privateKeyPem: data.privateKeyPem, publicKeyPem: data.publicKeyPem, thumbprint: data.thumbprint };
}

export async function writeSigningKey(keyData: SigningKeyData): Promise<void> {
  const db = getFirestore();
  await db.collection("system").doc("c2pa_signing_key").set({
    ...keyData,
    savedAt: FieldValue.serverTimestamp(),
  });
}
