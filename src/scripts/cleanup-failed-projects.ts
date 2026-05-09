import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";

/**
 * PROJECT CLEANUP SCRIPT
 * 
 * This script deletes projects from Firestore that have an "error" status.
 * It also deletes their subcollections (sko, outputs).
 * 
 * Usage: 
 *   npx tsx src/scripts/cleanup-failed-projects.ts [--dry-run]
 */

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  console.log(`Starting cleanup... ${DRY_RUN ? "[DRY RUN]" : "[LIVE DELETION]"}`);

  // Initialize Firebase Admin
  if (getApps().length === 0) {
    // Try to use FIREBASE_SERVICE_ACCOUNT_KEY if available
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Default credentials (works with gcloud auth application-default login)
      initializeApp();
    }
  }

  const db = getFirestore();
  const projectsCol = db.collection("projects");

  // Query projects with error status
  const snapshot = await projectsCol.where("status", "==", "error").get();

  if (snapshot.empty) {
    console.log("No projects with 'error' status found.");
    return;
  }

  console.log(`Found ${snapshot.size} projects with 'error' status.`);

  for (const doc of snapshot.docs) {
    const projectId = doc.id;
    const projectData = doc.data();
    console.log(`Processing project: ${projectId} (${projectData.sourcePreview || "no preview"})`);

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would delete project ${projectId} and its subcollections.`);
      continue;
    }

    // Delete subcollections
    // Firestore doesn't provide a direct way to delete subcollections in one go, 
    // so we delete documents in known subcollections: 'sko' and 'outputs'
    
    const skoCol = projectsCol.doc(projectId).collection("sko");
    const skoSnap = await skoCol.get();
    for (const skoDoc of skoSnap.docs) {
      await skoDoc.ref.delete();
      console.log(`  Deleted sko document: ${skoDoc.id}`);
    }

    const outputsCol = projectsCol.doc(projectId).collection("outputs");
    const outputsSnap = await outputsCol.get();
    for (const outputDoc of outputsSnap.docs) {
      await outputDoc.ref.delete();
      console.log(`  Deleted output document: ${outputDoc.id}`);
    }

    // Delete the project document itself
    await doc.ref.delete();
    console.log(`  Deleted project document: ${projectId}`);
  }

  console.log("Cleanup finished.");
}

main().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
