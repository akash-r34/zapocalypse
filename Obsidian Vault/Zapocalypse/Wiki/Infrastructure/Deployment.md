---
type: reference
domain: infrastructure
source_file: apphosting.yaml, firebase.json
created: 2026-04-11
updated: 2026-04-18
status: current
tags:
  - reference
  - infrastructure
  - deployment
related:
  - "[[Wiki/Infrastructure/Environment Variables]]"
  - "[[Wiki/Project/Current Status]]"
  - "[[Wiki/Infrastructure/Auth & Firestore Security]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/phase_status]]"
---

# Deployment

> Firebase App Hosting on Cloud Run. Auto-deploys from the `main` branch. Scale-to-zero. Timeout 300s (pipeline-safe). Auth via ADC — no API keys in config.

## Platform

**Firebase App Hosting** — managed Next.js hosting on Cloud Run.

- GCP project: `your-firebase-project-id`
- Region: `us-central1`
- Live URL: `https://zapocalypse--your-firebase-project-id.us-central1.hosted.app`

## `apphosting.yaml`

```yaml
runConfig:
  minInstances: 0       # scale-to-zero (no idle cost)
  maxInstances: 2
  timeoutSeconds: 300   # 5 minutes — covers full pipeline runtime
  memoryMiB: 1024
  cpu: 1

env:
  - variable: GOOGLE_CLOUD_PROJECT
    value: your-firebase-project-id
    availability: [BUILD, RUNTIME]
  - variable: GOOGLE_CLOUD_LOCATION
    value: us-central1
    availability: [BUILD, RUNTIME]
  - variable: GEMINI_MODEL
    value: gemini-2.5-flash
    availability: [BUILD, RUNTIME]
  - variable: NEXT_PUBLIC_FIREBASE_*
    availability: [BUILD, RUNTIME]  # NEXT_PUBLIC_ must be available at BUILD time
```

> **No `GEMINI_API_KEY`** — removed 2026-04-12. Vertex AI auth is via the runtime service account (ADC), not an API key.

## IAM Requirements

The App Hosting runtime service account needs:

| Role | Purpose |
|------|---------|
| `roles/aiplatform.user` | Vertex AI `GenerateContent` calls |
| `roles/firebase.sdkAdminServiceAgent` | Firebase Admin SDK |
| `roles/firebaseapphosting.computeRunner` | App Hosting execution |
| `roles/storage.objectViewer` | Asset access |

Verify / grant:
```bash
gcloud projects add-iam-policy-binding your-firebase-project-id \
  --member="serviceAccount:firebase-app-hosting-compute@your-firebase-project-id.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## Key Deployment Constraints

### `NEXT_PUBLIC_*` vars must be in `apphosting.yaml`

`.env.local` is local-only. `NEXT_PUBLIC_` vars are inlined at Next.js build time. If missing from `apphosting.yaml` with `availability: [BUILD, RUNTIME]`, production gets `undefined`.

### Timeout 300s

The default Cloud Run timeout is 60s. `apphosting.yaml` overrides to 300s. This is required because pipelines run 30-120s. The fire-and-forget pattern means the route handler itself returns in <1s; the timeout protects the async pipeline execution.

### `minInstances: 0`

Scale-to-zero — no cold-start cost when idle. Cold-start penalty is ~1-2s; acceptable for a dev/personal tool.

## Security: Pre-commit Secret Scanner

All commits are scanned before they land. The hook lives at `.githooks/pre-commit` and calls `scripts/scan-secrets.sh`.

Activate once per clone:
```bash
git config core.hooksPath .githooks
```

The scanner blocks: `AIzaSy...` Google API keys (except the public Firebase client key), private keys, and service-account JSON files. The `NEXT_PUBLIC_FIREBASE_API_KEY` in `apphosting.yaml` is on the allow-list — it's intentionally public.

## Firestore

- Mode: Native (not Datastore)
- Region: `us-central1`
- Rules: `firestore.rules` — locked to single owner via `isOwner()` (email + `email_verified`)
- Deploy rules separately: `firebase deploy --only firestore:rules --project your-firebase-project-id`
- `firebase.json` has `"firestore": { "rules": "firestore.rules" }` to enable the above deploy command
- Admin SDK (server-side) bypasses all rules — pipeline writes are unaffected

See [[Wiki/Infrastructure/Auth & Firestore Security]] for the full rules and auth architecture.

## Firebase Admin SDK

`src/lib/firebase/admin.ts` — `initFirebaseAdmin()` called once in each API route handler. Uses `applicationDefault()` credentials (automatically provided by Firebase App Hosting environment — same ADC that Vertex AI uses).

## Connectivity Test (Vertex AI)

```bash
node scripts/test-vertex.mjs
```

Confirms ADC auth, Vertex endpoint, and `gemini-2.5-flash` availability before deploying.

## GitHub / CI

No CI pipeline configured. Manual deploys via `firebase deploy` or App Hosting auto-deploy from `main` branch.

## Cross-References

- Env vars: [[Wiki/Infrastructure/Environment Variables]]
- Live status: [[Wiki/Project/Current Status]]
- Auth + Firestore rules: [[Wiki/Infrastructure/Auth & Firestore Security]]
- Fire-and-forget pattern: [[Wiki/Architecture/Fire and Forget Pattern]]
- Gemini client: [[Wiki/Data/Gemini Client]]
