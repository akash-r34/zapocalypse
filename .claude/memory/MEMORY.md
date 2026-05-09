# Zapocalypse — Project Memory Index

> Read this at the start of every session. Update memory files as decisions are made.

---

## Memory Files

| File | Type | Description |
|------|------|-------------|
| [codebase_architecture.md](./codebase_architecture.md) | project | **COMPLETE codebase map** — all files, schemas, components, data flow, pipeline, Firestore structure, tech debt. Read this instead of re-exploring. Last audited 2026-04-18 (Auth + Firestore rules). |
| [project_context.md](./project_context.md) | project | Core goals, constraints, and key decisions |
| [decisions.md](./decisions.md) | project | Architectural and product decisions log |
| [phase_status.md](./phase_status.md) | project | v1–v2.1 build phase history (all complete) |
| [user_prefs.md](./user_prefs.md) | user | How the user likes to work with Claude |
| [ui_redesign_gemini.md](./ui_redesign_gemini.md) | project | Glass morphism UI overhaul notes (Gemini handover) |
| [sync-checklist.md](./sync-checklist.md) | reference | 5-file memory sync procedure — read when doing a post-commit sync |

---

## Quick Status

- **Current Version:** V3.9.1 — Firebase Auth + Firestore rules (2026-04-18)
- **Pipeline:** `ingesting → analyzing → extracting → synthesizing → scoring → authenticating → complete`
- **Next:** V3 Phase 6 — Multimodal Input & YouTube Support (`v3/phase-6-multimodal`)
- **Active branch:** `main` (feat/auth-firestore-rules merged)
- **GCP Project:** `your-firebase-project-id`
- **Live URL:** https://zapocalypse--your-firebase-project-id.us-central1.hosted.app
- **GitHub Repo:** https://github.com/akash-r34/zapocalypse (private)
- **Last worked on:** 2026-04-18 — Single-user Google Auth: AuthProvider/AuthGate, per-route layouts, requireAllowedUser on API routes, authedFetch client helper, locked firestore.rules (isOwner email+email_verified). `npm run typecheck` exits 0.
- **Branch convention:** `v3/phase-{N}-{name}` — each phase on its own branch, merged to main on completion

---

## How to Update Memory

- **New decision made** → append to `decisions.md`
- **Phase completed** → update `phase_status.md`
- **User corrects approach** → update `user_prefs.md`
- **New constraint discovered** → update `project_context.md`
- **New file added to index** → add row to table above
