---
type: reference
domain: infrastructure
source_file: apphosting.yaml, .env.local
created: 2026-04-11
updated: 2026-04-18
status: current
tags:
  - reference
  - infrastructure
  - environment
related:
  - "[[Wiki/Infrastructure/Deployment]]"
  - "[[Wiki/Infrastructure/Auth & Firestore Security]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Environment Variables

> All environment variables used by Zapocalypse. Auth is via ADC — no API keys in config.

## Variables

| Variable | Availability | Description |
|----------|-------------|-------------|
| `GOOGLE_CLOUD_PROJECT` | BUILD + RUNTIME | GCP project ID: `your-firebase-project-id` |
| `GOOGLE_CLOUD_LOCATION` | BUILD + RUNTIME | Vertex AI region: `us-central1` (default if unset) |
| `GEMINI_MODEL` | BUILD + RUNTIME | Gemini model name. Must be `gemini-2.5-flash` — only available model on Vertex for this project |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | BUILD + RUNTIME | Firebase client web API key (intentionally public — embedded in browser bundle) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | BUILD + RUNTIME | `your-firebase-project-id.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | BUILD + RUNTIME | `your-firebase-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | BUILD + RUNTIME | `your-firebase-project-id.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | BUILD + RUNTIME | `your_messaging_sender_id` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | BUILD + RUNTIME | Web app ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | BUILD + RUNTIME | Analytics (optional) |
| `NEXT_PUBLIC_ALLOWED_USER_EMAIL` | BUILD + RUNTIME | Owner email for client-side auth gate (`src/lib/auth/allowed.ts`). Embedded in browser bundle at build time. |
| `ALLOWED_USER_EMAIL` | RUNTIME only | Same email, server-side only — no `NEXT_PUBLIC_` prefix. Used by `requireAllowedUser()` in API routes. |

> **Removed:** `GEMINI_API_KEY` — eliminated as of 2026-04-12. Auth is now via Application Default Credentials (ADC). Old key `AIzaSyAq...RRo` must be disabled in GCP console.

## Usage in Code

### Server-side (API routes, agents)
```typescript
// gemini-client.ts — Vertex AI mode, ADC auth
const project = process.env.GOOGLE_CLOUD_PROJECT;      // required
const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
new GoogleGenAI({ vertexai: true, project, location });

// firebase/admin.ts
initializeApp({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
```

### Client-side (hooks, components)
```typescript
// firebase/client.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,  // public, not secret
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};
```

## Critical Rules

1. **`NEXT_PUBLIC_*` must have `availability: [BUILD, RUNTIME]` in `apphosting.yaml`** — they are inlined at build time. Missing at build = `undefined` in production.
2. **`FIREBASE_CONFIG`** — do NOT set manually. Auto-injected by Firebase App Hosting.
3. **No `GEMINI_API_KEY`** — Vertex AI uses ADC. Production: App Hosting SA with `roles/aiplatform.user`. Local: `gcloud auth application-default login`.
4. **`NEXT_PUBLIC_FIREBASE_API_KEY` is intentionally public** — this is the Firebase client config key (not an AI key). It's embedded in the browser bundle by design; Firebase Security Rules protect data access.
5. **`gemini-2.5-flash` only** — `gemini-2.0-flash` and `gemini-2.5-flash-8b` return 404 on Vertex for this project.
6. **`ALLOWED_USER_EMAIL` must NOT have `NEXT_PUBLIC_` prefix** — it's server-only. The client-side allowed email is hardcoded in `src/lib/auth/allowed.ts` as `ALLOWED_EMAIL` (client bundle) while the API routes read from this env var (rotatable without rebuild).

## Local Development Setup (first time)

```bash
# Activate pre-commit secret scanner
git config core.hooksPath .githooks

# Set up Vertex AI access
gcloud auth application-default login
gcloud config set project your-firebase-project-id
```

Then create `.env.local`:
```bash
GOOGLE_CLOUD_PROJECT=your-firebase-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GEMINI_MODEL=gemini-2.5-flash
NEXT_PUBLIC_FIREBASE_API_KEY=...
ALLOWED_USER_EMAIL=<owner-email>
# (see .env.example for full list)
```

## Cross-References

- Deployment config: [[Wiki/Infrastructure/Deployment]] (`apphosting.yaml`)
- Gemini client: [[Wiki/Data/Gemini Client]]
- Auth architecture: [[Wiki/Infrastructure/Auth & Firestore Security]]
- Auth decision: [[Wiki/Decisions/Decisions - AI and Model Selection]]
