---
type: reference
domain: infrastructure
source_file: scripts/purge-old-projects.mjs
created: 2026-04-14
updated: 2026-04-14
status: current
tags:
  - reference
  - infrastructure
  - maintenance
  - firestore
related:
  - "[[Wiki/Data/Data Model Overview]]"
  - "[[Wiki/Infrastructure/Deployment]]"
  - "[[Wiki/Infrastructure/Environment Variables]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Maintenance Scripts

> One-off operational scripts for managing Firestore data. All scripts live in `scripts/` and are excluded from version control via `.gitignore`. They use the Firebase Admin SDK with ADC auth — the same credential pattern as the pipeline server.

---

## purge-old-projects.mjs

**Purpose:** Delete all project trees from Firestore whose `createdAt` is before the start of the current month (local timezone). Designed to be run manually on an ad-hoc basis to keep Firestore tidy and reduce storage costs.

### Scope

**Deleted:** entire `projects/{id}` document tree, including every subcollection:
- `analysis/current`
- `sko/current`
- `outputs/{platform}` (twitter, linkedin, newsletter, veo, dark_social)
- `cost_log/{auto-id}`
- `refund_log/{auto-id}`
- `hook_scores/current`
- `tone_check/current`
- `c2pa/{platform}`
- `tone_history/{auto-id}`
- `source/current` (if present)

**Preserved (not touched):**
- `budget/current` — singleton budget state
- `system/c2pa_signing_key` — ECDSA keypair, reused forever

### Auth

Uses ADC (Application Default Credentials) — same as the pipeline. Ensure credentials are active before running:

```bash
gcloud auth application-default login
gcloud config set project your-firebase-project-id
```

### Required Environment Variable

| Var | Value | Notes |
|-----|-------|-------|
| `GOOGLE_CLOUD_PROJECT` | `your-firebase-project-id` | Primary. Falls back to `GCLOUD_PROJECT`, then `NEXT_PUBLIC_FIREBASE_PROJECT_ID`. |

Alternatively, set `FIREBASE_SERVICE_ACCOUNT_KEY` to a local service account JSON key file path (same as the pipeline's local dev pattern).

### Usage

#### Dry run (always run this first)

Prints the cutoff date, total count of matching projects, up to 10 sample IDs, and the oldest/newest `createdAt` timestamps. Makes no changes.

```bash
GOOGLE_CLOUD_PROJECT=your-firebase-project-id node scripts/purge-old-projects.mjs
```

Example output:
```
Cutoff (local start-of-month): Wed Apr 01 2026 00:00:00 GMT+0530 (India Standard Time)
Cutoff token: 2026-04-01
Matching projects: 17
Sample project IDs: [ 'f07bed62-...', '8fe4679c-...', ... ]
Oldest createdAt: 2026-03-22T13:02:02.401Z
Newest createdAt: 2026-03-29T18:15:23.468Z
Dry-run only. Re-run with --execute to delete.
```

#### Execute deletion

**Two flags are required** — missing or mismatched token aborts with a non-zero exit:

1. `--execute` — enables destructive mode
2. `--yes-delete-before=YYYY-MM-01` — must exactly match the cutoff token printed by dry-run

```bash
GOOGLE_CLOUD_PROJECT=your-firebase-project-id node scripts/purge-old-projects.mjs \
  --execute \
  --yes-delete-before=2026-04-01
```

Logs each deletion (`Deleting projects/<id> ...`), prints final count, and runs a verification query at the end. If any project fails to delete, the script prints the failed IDs and exits with code 1.

#### Additional flags

| Flag | Default | Description |
|------|---------|-------------|
| `--limit=N` | 500 | Page size for Firestore query paging |
| `--sample=N` | 10 | Number of sample project IDs to print in dry-run |
| `--help` | — | Print usage |

### Safety rules

- Default is **dry-run** — no writes happen without `--execute`.
- The `--yes-delete-before` token must match the script's computed cutoff string exactly. Prevents accidental execution against a different month.
- Uses `db.recursiveDelete()` (preferred) with a `BulkWriter` for safe, throttled deletes. Falls back to manual `listCollections()` recursion if `recursiveDelete` is unavailable.
- Errors per project are caught individually — one failure does not stop remaining deletions.
- Post-run verification query confirms zero remaining projects before the cutoff.
- Script exits non-zero if any deletes fail or if the verification query returns > 0 remaining matches.

### Side effects to be aware of

- Deleting old projects removes their `cost_log` entries. This means the **SpendChart** on the dashboard (which queries per-project `cost_log`) will show no spend for deleted months.
- The **Recent Projects** list and **useArtifactPreviews** hook only reference projects that still exist in Firestore — deleted projects will disappear from the dashboard automatically on next load.

---

## Cross-References

- All Firestore paths: [[Wiki/Data/Data Model Overview]]
- ADC auth setup: [[Wiki/Infrastructure/Deployment]]
- Env vars: [[Wiki/Infrastructure/Environment Variables]]
