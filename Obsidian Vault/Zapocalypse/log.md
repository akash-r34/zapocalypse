---
type: log
created: 2026-04-11
updated: 2026-04-11
tags:
  - log
  - meta
---

# Zapocalypse Wiki — Activity Log

> Append-only chronological record of all wiki operations: ingests, queries, lints, and major updates.
> Format: `## [YYYY-MM-DD HH:MM] <operation> | <subject> | <N pages affected>`

---

## [2026-04-11 00:00] bootstrap | initial wiki build | 87 files

**Operation:** Full bootstrap ingest from `.claude/memory/` (V3.5, Phase 5 complete)

**Sources ingested:**
- `Sources/Memory/codebase_architecture.md` (35KB) — primary source for all entity pages
- `Sources/Memory/decisions.md` (16KB) — decomposed into 3 decision cluster pages
- `Sources/Memory/phase_status.md` (23KB) — decomposed into Phase History, Roadmap, Current Status
- `Sources/Memory/project_context.md` (4KB) — Architecture Overview, Current Status, Deployment
- `Sources/Memory/ui_redesign_gemini.md` (5KB) — Glass Morphism Theme, Dual Agent Collaboration
- `Sources/Memory/user_prefs.md` — stored in Sources only (not decomposed)
- `Sources/Rules/ai-gemini.md` — absorbed into [[Wiki/Data/Gemini Client]], [[Wiki/Concepts/Budget Protection Layers]]
- `Sources/Rules/firestore-schema.md` — absorbed into [[Wiki/Data/Data Model Overview]], [[Wiki/Data/Firestore Helpers]]
- `Sources/Rules/pipeline-safety.md` — absorbed into [[Wiki/Pipeline/Pipeline Overview]], [[Wiki/Pipeline/Orchestrator]]
- `Sources/Docs/V3 Development Plan.md` — absorbed into [[Wiki/Project/Roadmap]], [[Wiki/Project/Phase History]]
- `Sources/Docs/V3_Critique_transcript.md` — absorbed into [[Wiki/Decisions/Decisions - V3 Expert Critique]]
- `Sources/Docs/V3 Market research.md` — absorbed into [[Wiki/Project/Roadmap]]

**Structure created:**
- 3 root files (index.md, log.md, schema.md)
- 5 Architecture pages
- 9 Pipeline pages
- 14 Data pages
- 16 Hooks pages
- 17 Component pages
- 4 Pages/Routes pages
- 4 Concept pages
- 3 Infrastructure pages
- 3 Decision pages
- 3 Project/Status pages
- 6 Templates

**Project state at bootstrap:** V3.5, Phases 1-5 complete, Phase 6 (Multimodal) next

---

## [2026-04-11 00:01] lint | link audit + index fix | 1 file updated

**Operation:** Link audit after full bootstrap

**Changes:**
- `index.md` — removed stale `Hook - useC2PAManifest` (singular) entry. Both `useC2PAManifest` and `useC2PAManifests` are in the same source file (`src/hooks/useC2PAManifests.ts`); consolidated to single `[[Wiki/Hooks/Hook - useC2PAManifests]]` entry.

**Verified:** All 78 wiki pages created. No other red links detected. All pages have ≥2 inbound wikilinks via cross-reference sections.

---

## [2026-04-11 00:02] ingest | V3 Market research coverage fix | 6 files updated

**Operation:** Coverage gap fix — `Sources/Docs/V3 Market research.md` was synced but not wikilinked from any wiki page body.

**Changes:**
- `Wiki/Project/Roadmap.md` — added "Market Research Origins" table mapping 10 implemented + 4 pending recommendations to wiki pages; added to `sources:` frontmatter
- `Wiki/Concepts/Additive Tone Fingerprinting.md` — added to `sources:` frontmatter ("AI Slop" pain point origin)
- `Wiki/Concepts/Budget Protection Layers.md` — added to `sources:` frontmatter ("Credit Trap" + "Fair-Play Credits" origin)
- `Wiki/Concepts/C2PA Signing.md` — added to `sources:` frontmatter (C2PA "Digital Proof" recommendation origin)
- `Wiki/Decisions/Decisions - V3 Expert Critique.md` — added to `sources:` frontmatter (market research informed the critique)
- `Wiki/Pipeline/Agent - Analyst.md` — added to `sources:` frontmatter ("Information Gain Auditor" recommendation origin)

**Result:** `Sources/Docs/V3 Market research.md` now has 6 inbound wikilinks from wiki pages.

---

## [2026-04-12] gap | Vertex AI migration | discovered during SDK swap — ✅ RESOLVED
Gemini Client wiki page stated "NOT Vertex AI". Resolved in ingest below — all 5 affected pages rewritten for Vertex mode, ADC auth, `GOOGLE_CLOUD_LOCATION`, and `roles/aiplatform.user` IAM requirement.

---

## [2026-04-12] ingest | Vertex AI migration + security hardening | 6 pages updated

**Changed sources:** `Sources/Memory/codebase_architecture.md`, `Sources/Memory/decisions.md`, `Sources/Memory/phase_status.md`, `Sources/Memory/project_context.md`, `Sources/Memory/sync-checklist.md`, `Sources/Rules/ai-gemini.md`, `Sources/Docs/CLAUDE.md`, `Sources/Docs/GEMINI.md`

**Pages updated:**
- [[Wiki/Data/Gemini Client]] — full rewrite: Vertex AI constructor, ADC auth, no API key, `gemini-2.5-flash` only, `scripts/test-vertex.mjs`
- [[Wiki/Decisions/Decisions - AI and Model Selection]] — superseded "switched to API key" entry; new "migrated to Vertex" decision; model availability table
- [[Wiki/Infrastructure/Environment Variables]] — removed `GEMINI_API_KEY`, added `GOOGLE_CLOUD_LOCATION`, ADC setup instructions, first-time dev setup
- [[Wiki/Infrastructure/Deployment]] — updated `apphosting.yaml` snippet, IAM requirements table, pre-commit scanner section, Vertex connectivity test
- [[Wiki/Architecture/Tech Stack]] — SDK row updated to Vertex mode, model pricing table with Vertex availability column
- [[Wiki/Architecture/Dual Agent Collaboration]] — renamed to "Tri-Agent Collaboration" (Cursor added); memory sync rule updated (only after confirmed working)

**Gaps resolved:** Vertex AI migration gap (noted 2026-04-12)

**Summary:** Vertex AI migration fully reflected in wiki — auth model, env vars, IAM, model constraints, and security hardening all documented.

---

## [2026-04-12 00:00] refinement | Tier 2 + Tier 3 robustness + polish | 11 changes

**Operation:** Tier 2 (robustness) and Tier 3 (polish) refinements to the wiki-first infrastructure.

**Changes:**
- `.gitignore` (repo root) — added Obsidian per-machine UI state exclusions (workspace.json, graph.json, app.json); community-plugins.json and core-plugins.json remain tracked
- `.claude/commands/phase-complete.md` — extended with steps 5–7: mark wiki phase pages stale, append summary row to Phase History, prompt to run sync-vault + /wiki-ingest
- `.claude/commands/wiki-ingest.md` — added dry-run mode documentation at top
- `schema.md` — added three new sections: "Ingest Cadence" (4 triggers), "Tag Taxonomy" (canonical type/domain/entity tags + known extensions), "Log Entry Schema" (formal grammar for all log entries)
- `Wiki/_Health.md` — **new**: Dataview health dashboard (stale, old, orphans, missing frontmatter)
- `Wiki/_Queries/Recently Updated.md` — **new**: Dataview query sorted by updated desc
- `Wiki/_Queries/By Domain.md` — **new**: Dataview queries grouped by all 7 domains
- `.obsidian/README-plugins.md` — **new**: required plugin versions and setup instructions
- `README.md` (vault root) — **new**: human-facing vault guide (< 40 lines)
- `index.md` — linked `_Health` and `_Queries/` under "## Meta"

**Result:** Tier 1 made the wiki-first loop correct. Tier 2 makes it robust (drift detection, phase-merge integration, gitignore hygiene, formal conventions). Tier 3 adds navigational polish for both human and LLM readers.

---

## [2026-04-11 00:04] refinement | Tier 1 wiki-first loop closure | 8 changes

**Operation:** Tier 1 refinements to make the wiki-first protocol hold end-to-end across all agents, commands, and tooling.

**Changes:**
- `index.md` — added "Semantic Lookup" table (16 intent → page entries) above "## Start Here"
- `CLAUDE.md` (repo root) — extended Rule 1 with: "When editing code" stale-marking procedure (grep + `status: stale`); 3 worked example flows (lookup, code edit, gap discovery)
- `GEMINI.md` (repo root) — added "Rule 0 — Wiki-First Lookup" section mirroring CLAUDE.md Rule 1, so Gemini also uses the wiki as primary reference
- `scripts/sync-vault.sh` — after rsync, idempotently prepends "WIKI REFERENCE COPY — NOT AUTHORITATIVE" header to `Sources/Docs/CLAUDE.md`, `GEMINI.md`, and `AGENTS.md`
- `.claude/commands/wiki-ingest.md` — **new file**: 6-step diff-based ingest workflow (git diff → grep sources → update pages → resolve gaps → create new pages → log)
- `.claude/commands/status.md` — updated to read `Wiki/Project/Current Status.md` first, then fall back to `.claude/memory/phase_status.md` if stale
- `.claude/memory/sync-checklist.md` — appended Step 6: run `sync-vault.sh` then `/wiki-ingest`

**Result:** The wiki-first loop is now closed: parent Claude and Gemini both check the wiki first; edits trigger stale-marking; sync-vault.sh preserves non-authoritative headers; `/wiki-ingest` is a first-class command; the post-commit checklist includes wiki propagation.

---

## [2026-04-11 00:03] schema | wiki-first lookup + diff ingest protocol | 3 files

**Operation:** Meta-changes to wire up the parent Claude to use this wiki as primary reference.

**Changes:**
- `CLAUDE.md` (repo root) — Rule 1 replaced with "Wiki-First Lookup". Parent Claude now checks `Obsidian Vault/Zapocalypse/index.md` before `.claude/memory/` or source files. Gap discovery protocol added: gaps noted in this `log.md` so wiki-maintaining Claude picks them up on next ingest.
- `Sources/Docs/CLAUDE.md` — added HTML comment header marking it as a synced reference copy, not authoritative instructions. Prevents any Claude reading this file from treating it as live CLAUDE.md directives.
- `schema.md` — replaced old "Ingest" operation with "Diff-Based Ingest" as the preferred workflow. Uses `git diff` (or timestamp comparison) to identify changed source files, greps `sources:` frontmatter to find affected wiki pages, updates only those pages. Full ingest retained for bootstrap/restructure cases. Gap resolution step added (reads `[gap]` log entries and closes them).

## [2026-04-14 00:00] ingest | codebase_architecture, decisions, firestore-schema | 7 pages updated, 1 page created

Changed sources: Sources/Memory/codebase_architecture.md, Sources/Memory/decisions.md, Sources/Memory/MEMORY.md, Sources/Rules/firestore-schema.md

Pages updated: [[Data/Data Model Overview]], [[Data/Firestore Helpers]], [[Pipeline/Agent - Authenticator]], [[Concepts/Budget Protection Layers]], [[Components/Component - Budget UI]], [[Hooks/Hook - useProjectCost]], [[Hooks/Hooks Overview]]

Pages created: [[Hooks/Hook - useProjectRefunds]]

Gaps resolved: none (no open [gap] entries)

Summary: V3.8 regen UX polish — added refund_log schema, regenPlatform field on cost_log, writeRegeneratedOutput conditional isRegenerated + outputErrors clearing, updateToneCheckForPlatform set() pattern, runToneCheckForPlatform key normalization, post-regen cascade architecture, processRegenRefund attempt-number fix, CostBreakdown grouping logic, new useProjectRefunds hook.

## [2026-04-14 05:30] ingest | codebase_architecture, phase_status, MEMORY | 5 pages updated

Changed sources: Sources/Memory/codebase_architecture.md, Sources/Memory/phase_status.md, Sources/Memory/MEMORY.md

Pages updated: [[Components/Component - OutputTabs]], [[Hooks/Hook - useSourceContent]], [[Components/Component - Budget UI]], [[Project/Current Status]], [[Project/Phase History]]

Gaps resolved: none

Summary: Lint cleanup — .firebase/** ESLint ignore, 3 react-hooks/set-state-in-effect fixes (useSourceContent loading init, SpendChart loading init, OutputTabs setRetrying eslint-disable). npm run lint exits 0.

## [2026-04-14 05:45] health-check | wiki integrity scan | 2 broken links fixed

**Checks run:** stale pages, missing frontmatter, broken wikilinks

**Results:**
- Stale pages: 0 (grep false-positive on Dataview query text in _Health.md)
- Missing frontmatter: 0 (all 82 pages have `type` and `updated`)
- Broken wikilinks: 2 found and fixed

**Fixes:**
- `Data/Schema - C2PA Manifest.md` — removed dead `[[Hook - useC2PAManifest]]` (singular, never existed); replaced with `[[Hook - useC2PAManifests]]` with note that both exports live in the same file
- `_Health.md` — replaced dead `[[Wiki/Meta]]` with `[[schema]]` (the actual page with ingest instructions)

**Page dates:** 82 total — 62 on 2026-04-11 (bootstrap), 9 on 2026-04-12, 11 on 2026-04-14

## [2026-04-14 17:14] ingest | MEMORY.md, codebase_architecture.md, phase_status.md | 3 pages updated, 3 pages created
Changed sources: Sources/Memory/MEMORY.md, Sources/Memory/codebase_architecture.md, Sources/Memory/phase_status.md
Pages updated: [[Wiki/Project/Current Status]], [[Wiki/Pages/Page - Dashboard]]
Pages created: [[Wiki/Pages/Page - Landing]], [[Wiki/Pages/Page - Projects]]
Summary: Landing page, dashboard redesign, and all-projects view. Route group (marketing) separates public/workspace. useAllProjects, ProjectCard, 7 marketing components created. Build exits 0. Git checkpoint committed as fc27fc3.

## [2026-04-14 17:45] ingest | MEMORY.md, codebase_architecture.md, phase_status.md | 1 page updated
Changed sources: Sources/Memory/MEMORY.md, Sources/Memory/codebase_architecture.md, Sources/Memory/phase_status.md
Pages updated: [[Wiki/Project/Current Status]]
Summary: Mobile optimization audit — AppShell header condensed for <375px viewports (folder icon, +CTA, tight sub-wordmark), projects filter bar vertical-stacks on mobile. V3.9 on main, Phase 6 next.

## [2026-04-18] gap | Auth & Firestore Security | discovered during Firebase Auth implementation — ✅ RESOLVED
No wiki page existed for Firebase Auth, Firestore security rules, or the auth architecture. Resolved in ingest below — `Wiki/Infrastructure/Auth & Firestore Security.md` created.

## [2026-04-18 00:00] ingest | codebase_architecture, phase_status, MEMORY | 7 pages updated, 1 page created

Changed sources: Sources/Memory/codebase_architecture.md, Sources/Memory/phase_status.md, Sources/Memory/MEMORY.md

Pages updated:
- [[Wiki/Pages/API Routes]] — both routes now show requireAllowedUser step, 401/403 responses, Auth Flow section
- [[Wiki/Components/Component - Layout]] — AppShell sign-out button, AuthGate component entry, route gate layouts table
- [[Wiki/Infrastructure/Environment Variables]] — ALLOWED_USER_EMAIL row + critical rule #6
- [[Wiki/Infrastructure/Deployment]] — Firestore rules section rewritten (locked, deploy command, Admin SDK bypass)
- [[Wiki/Project/Current Status]] — V3.9.1, auth bullet in What's Complete, Phase 7 note updated
- [[Wiki/Project/Phase History]] — V3.9.1 Firebase Auth section added
- `index.md` — new Semantic Lookup row + Infrastructure list entry for Auth & Firestore Security

Pages created:
- [[Wiki/Infrastructure/Auth & Firestore Security]] — full auth architecture: allowed.ts, AuthContext, AuthGate, requireUser, authedFetch, client.ts/admin.ts exports, firestore.rules, end-to-end sign-in flow

Gaps resolved: Auth & Firestore Security gap (noted 2026-04-18)

Summary: V3.9.1 Firebase Auth — single-user Google sign-in, per-route AuthGate, requireAllowedUser on API routes, authedFetch client helper, isOwner() Firestore rules. New dedicated wiki page created.
