# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it via a GitHub issue or by emailing the repository owner directly.

Please **do not** open a public issue for security vulnerabilities.

## Scope

This is a personal portfolio project. The Firestore rules enforce single-user access — no data is accessible to the public. The Firebase Web API key (`NEXT_PUBLIC_FIREBASE_*`) is intentionally public and safe when backed by proper Firestore security rules.

## Setup Notes for Forks

When deploying your own instance:
- Replace `<owner-email>` in `firestore.rules` with your Google account email before deploying rules.
- Set `NEXT_PUBLIC_ALLOWED_USER_EMAIL` and `ALLOWED_USER_EMAIL` to your email in `apphosting.yaml` and `.env.local`.
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Rotate the Firebase Web API key in the GCP console if you fork from git history.
