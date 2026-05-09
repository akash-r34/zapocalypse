import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";

const firebaseConfig = {
  // In Firebase App Hosting, FIREBASE_CONFIG is auto-injected.
  // For local dev, these values come from your Firebase project settings.
  // They are safe to expose — Firestore rules enforce access control.
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

export function getClientApp(): FirebaseApp {
  if (!_app) {
    const existing = getApps();
    _app = existing.length > 0 ? existing[0]! : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getClientFirestore(): Firestore {
  if (!_db) {
    _db = getFirestore(getClientApp());
  }
  return _db;
}

export function getClientAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getClientApp());
  }
  return _auth;
}

export const googleProvider = new GoogleAuthProvider();
