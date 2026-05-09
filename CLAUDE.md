@AGENTS.md

# Zapocalypse — Vertical AI Content Factory

> Sequential pipeline: one input → tweets + LinkedIn + newsletter + Veo script via Gemini AI.

## Collaborating agents

Zapocalypse is maintained by **Cursor** (IDE assistant), **Claude Code**, and **Gemini Antigravity** using one shared playbook—not parallel rule forks.

- **Cursor** — Project rules live in `.cursor/rules/` (committed) and should point here; there is no native `/command` UI—when a workflow applies, follow the matching doc under `.claude/commands/`.
- **Claude Code** — Same entry as this file; slash commands map to `.claude/commands/`.
- **Gemini (Antigravity)** — Entry [GEMINI.md](GEMINI.md); architecture and conventions are defined here and in `.claude/`.

**Single source of truth:** `.claude/rules/`, `.claude/commands/`, `.claude/skills/`, and `.claude/memory/` apply to all three.

**Handoffs:** Before every `git commit`, run the memory sync in Rule 3 (checklist: `.claude/memory/sync-checklist.md`). After substantive code edits, mark affected wiki pages `status: stale` and log gaps in `Obsidian Vault/Zapocalypse/log.md` per Rule 1.

---

## Rules

@.claude/rules/ai-gemini.md
@.claude/rules/pipeline-safety.md
@.claude/rules/firestore-schema.md

---

## Skills & Commands

### Slash Commands (`.claude/commands/`)

| Command | When to use |
|---------|-------------|
| `/status` | Start of any session — before touching code |
| `/check-budget` | Before adding or modifying any agent or Gemini call |
| `/validate-sko` | Before and after any change to `src/lib/ai/schemas/sko.ts` |
| `/phase-complete <N>` | Immediately after merging a V3 phase branch to main |
| `/remember <fact>` | When a significant decision or constraint is made mid-session |
| `/sync-vault` | After memory or doc changes; run `./scripts/sync-vault.sh` to back up to the Obsidian Vault |
| `/wiki-ingest` | After vault sync; diff-based wiki updates under `Obsidian Vault/Zapocalypse/Wiki/` (see `.claude/commands/wiki-ingest.md`) |

### Engineering Skills (`.claude/skills/`)

| Skill | Load when... |
|-------|-------------|
| `next-best-practices` | Writing App Router pages, API routes, async patterns |
| `nextjs-app-router-patterns` | Working with layouts, route handlers, server/client boundaries |
| `next-cache-components` | Adding or modifying any `fetch`, `cache()`, or revalidation logic |
| `vercel-react-best-practices` | Optimizing React re-renders, memoization, hooks |
| `firebase-ai-logic` | Working with Firestore helpers, Gemini client, or any agent code |
| `typescript-advanced-types` | Designing new Zod schemas, complex generics |
| `tailwind-design-system` | Adding new CSS variables, `@theme` tokens, glass morphism components |
| `design-system-patterns` | Building new UI components or extending the component hierarchy |
| `frontend-design` | Implementing animations, M3 shapes, or new visual treatments |
| `web-design-guidelines` | Evaluating UX decisions, accessibility, or layout structure |

---

## Context & Memory Rules

### Rule 1 — Wiki-First (MANDATORY for questions AND development)

The **Obsidian wiki is the primary reference** for architecture, agents, hooks, schemas, components, decisions, and project state. It MUST be consulted before opening any source file, memory doc, or launching any Explore agent.

#### Answering questions
1. Open `Obsidian Vault/Zapocalypse/index.md` — use it as the navigation entry point
2. Read the relevant `Wiki/` page(s) — they contain full code excerpts and cross-references
3. **Only if the wiki is insufficient:** fall back to `.claude/memory/codebase_architecture.md`
4. **Only for a targeted edit:** open the actual source file

#### Before starting any development task (REQUIRED — do this before Explore agents or source reads)
1. Open `Obsidian Vault/Zapocalypse/index.md`
2. Identify every component, hook, agent, helper, or schema you will touch — look each one up in the wiki
3. Read those wiki pages in full — they have the code patterns, Firestore paths, and constraints you need
4. **Only if the wiki is missing or insufficient for a specific detail:** then (and only then) use an Explore agent or read a source file
5. Do NOT launch an Explore agent as a first step when a wiki page already covers the topic — this wastes tokens

**Example flows:**

*User asks: "How does budget tracking work?"*
→ Open `index.md` → Semantic Lookup → [[Wiki/Concepts/Budget Protection Layers]] → answer found. No source file read needed.

*User asks to fix a bug in `updateToneCheckForPlatform`:*
→ Open `index.md` → find [[Wiki/Data/Firestore Helpers]] → read the page — it has the function signature, Firestore path, and `set()` vs `update()` pattern. No Explore agent needed.

*User asks to add a new agent step to the orchestrator:*
→ Open `index.md` → read [[Wiki/Pipeline/Orchestrator]] and [[Wiki/Pipeline/Agent - Authenticator]] → only then open `src/lib/pipeline/orchestrator.ts` for the targeted edit.

*User asks about a feature not yet in the wiki:*
→ Fall back to source / `.claude/memory/` → complete the task → append `## [YYYY-MM-DD] gap | <topic> | discovered during <task>` to `Obsidian Vault/Zapocalypse/log.md`.

**When the wiki is insufficient** (missing page, outdated info, discovered during implementation):
- Do the work using source files as fallback
- After completing the task, update `.claude/memory/` per Rule 3
- Append a gap note to `Obsidian Vault/Zapocalypse/log.md`:
  ```
  ## [YYYY-MM-DD] gap | <topic> | discovered during <task>
  <One sentence describing what's missing or wrong in the wiki>
  ```
  The wiki-maintaining Claude will pick this up on next ingest.

**When editing code** — mark the wiki page stale so the next ingest knows to refresh it:
1. Find the wiki page: `grep -rl "source_file: src/lib/budget/tracker.ts" "Obsidian Vault/Zapocalypse/Wiki/"`
2. Open that page and set `status: stale` in its frontmatter
3. The wiki-maintaining Claude refreshes it on the next `/wiki-ingest` run

### Rule 2 — Two Memory Locations, Both Kept in Sync

1. **Local project memory:** `.claude/memory/` — committed to the repo, readable by Cursor, Claude Code, and Gemini.
2. **Claude agent memory:** `~/.claude/projects/-Users-akashr-Zapocalypse/memory/` — cross-session Claude recall.

### Rule 3 — Memory Sync After Confirmed Working

Run the memory sync **only after the user explicitly confirms the current work is functioning** ("it works", "tests pass", "looks good", etc.). Do NOT sync proactively before commits or suggest it unprompted. Update all 5 files in order once triggered. Full checklist: `.claude/memory/sync-checklist.md`.

---

## Quick Reference

### Environment Variables
```bash
GOOGLE_CLOUD_PROJECT=your-firebase-project-id
GOOGLE_CLOUD_LOCATION=us-central1   # Vertex AI region
GEMINI_MODEL=gemini-2.5-flash       # only model available on Vertex for this project
# Auth: Application Default Credentials (ADC) — no GEMINI_API_KEY
# Local dev: gcloud auth application-default login
# Prod: App Hosting runtime SA must have roles/aiplatform.user
# FIREBASE_CONFIG — auto-injected by Firebase App Hosting, do NOT set manually
```

### Common Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

### First-time repo setup (run once after cloning)
```bash
git config core.hooksPath .githooks   # activate pre-commit secret scanner
gcloud auth application-default login # ADC for local Vertex AI access
gcloud config set project your-firebase-project-id
```

### Critical Files — Handle With Care
- `src/lib/pipeline/orchestrator.ts` — backbone, don't refactor without care
- `src/lib/ai/schemas/sko.ts` — changing this breaks everything downstream
- `src/lib/ai/gemini-client.ts` — all AI calls flow through here
- `src/lib/budget/tracker.ts` — cost protection, always test changes

### Hard Constraints
- **No auth** — single-user app; do not add Firebase Auth unless explicitly requested
- **Zod v4** — use `z.toJSONSchema()` natively; do NOT use `zod-to-json-schema` package
- **CSS** — all styling via `--glass-*` vars; `--md-sys-color-*` tokens are fully removed
- **Agents** — direct function imports only; never call `/api/agents/*` internally
- **Stack, types, schemas, architecture** — see `.claude/memory/codebase_architecture.md`
- **Phase history** — see `.claude/memory/phase_status.md`
