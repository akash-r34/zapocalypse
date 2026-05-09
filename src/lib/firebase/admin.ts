import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | null = null;

export function initFirebaseAdmin(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  // In Firebase App Hosting, GOOGLE_APPLICATION_CREDENTIALS is auto-configured
  // For local dev, set FIREBASE_SERVICE_ACCOUNT_KEY env var to the JSON key file path
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountPath) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(serviceAccountPath) as object;
    adminApp = initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Default credentials (works in App Hosting + local with gcloud auth application-default login)
    adminApp = initializeApp();
  }

  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(initFirebaseAdmin());
}
