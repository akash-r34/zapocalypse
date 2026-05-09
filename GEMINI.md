# Gemini (Antigravity) — Tri-agent collaboration

Zapocalypse is shared by **Cursor** (IDE assistant), **Claude Code**, and **Gemini Antigravity**. All three use the same `.claude/` rules, commands, skills, and memory workflows. This file is Gemini’s entry point; [CLAUDE.md](CLAUDE.md) is the canonical overview and applies to Cursor and Claude Code as well.

## Entry points

- **Cursor** — Committed rules in `.cursor/rules/` (e.g. `zapocalypse.mdc`) apply in the IDE and direct the agent to `CLAUDE.md`. There is no native `/command` UI; when a workflow applies, follow the checklist in the matching file under `.claude/commands/`.
- **Claude Code** — `CLAUDE.md` plus slash commands backed by `.claude/commands/`.
- **Gemini (Antigravity)** — This file (`GEMINI.md`) plus [CLAUDE.md](CLAUDE.md) for full architecture and Quick Reference.

## Cursor

Cursor follows [CLAUDE.md](CLAUDE.md) and `.claude/` the same way as the other assistants. Do not maintain Cursor-only copies of rules, skills, or memory.

## Agent configuration and mapping (Gemini)

- **Architecture and conventions:** [CLAUDE.md](CLAUDE.md)
- **Workflows:** `.claude/commands/` — treat these as first-class workflows (see table below).
- **Rules:** `.claude/rules/*.md`
- **Memory:** `.claude/memory/` and, when applicable, Claude global project memory under `~/.claude/projects/-Users-akashr-Zapocalypse/memory/`. Update as decisions are made (Memory sync below).

## Emulated hooks (safety and validation)

Gemini does not have native `settings.json` pre/post tool hooks, so you **must** internally emulate these:

1. **Typecheck hook:** Before deploying or after significant edits, proactively run `npm run typecheck --silent`.
2. **Budget safety hook:** Whenever editing `src/lib/pipeline/orchestrator.ts`, actively verify that `checkBudget()` is present.
3. **Destructive command hook:** Before running `rm -rf`, `drop table`, `delete from`, or any `firebase * delete` command, print a warning and wait for the user to explicitly confirm.

## Guidelines

- **Next.js / stack:** Follow [CLAUDE.md](CLAUDE.md) and `.claude/memory/codebase_architecture.md`; see [AGENTS.md](AGENTS.md) if populated.
- **Tailwind v4:** CSS-first configuration, no `tailwind.config.ts`.
- **M3 theming:** Respect the Material 3 dynamic color system.
- **Budget:** Always check budget before any Gemini/Vertex AI calls using `src/lib/budget/tracker.ts`.

## Shared rules (iron-clad)

The following mandates apply to **Cursor, Claude Code, and Gemini** so handovers stay consistent.

### 0. Wiki-first lookup (primary reference)

The **Obsidian wiki** is the primary reference for architecture, agents, hooks, schemas, components, decisions, and project state. Check it before `.claude/memory/` or source files.

**Lookup flow:**

1. Open `Obsidian Vault/Zapocalypse/index.md` — use the Semantic Lookup table where present.
2. Read the relevant `Wiki/` page(s) — they contain code excerpts and cross-references.
3. **Only if the wiki is insufficient:** fall back to `.claude/memory/codebase_architecture.md`.
4. **Only for a targeted edit:** open the actual source file.

**Before starting any development task (REQUIRED):**
1. Open `Obsidian Vault/Zapocalypse/index.md`
2. Read every wiki page for the components, agents, hooks, or helpers you will touch
3. Only if the wiki is missing or insufficient for a specific detail: open source files or memory docs
4. Do NOT read source files or spawn searches as a first step when a wiki page covers the topic — this wastes tokens

**When the wiki is missing or outdated:**

- Do the work using source files as fallback.
- Append a gap note to `Obsidian Vault/Zapocalypse/log.md`:

  ```markdown
  ## [YYYY-MM-DD] gap | <topic> | discovered during <task>
  <One sentence describing what's missing or wrong in the wiki>
  ```

### 1. Memory and context sync checklist (critical)

Run the memory sync **only after the user explicitly confirms the current work is functioning correctly** — signals like "it works", "tests pass", "looks good", or "deploy it". Do NOT sync proactively before commits or suggest it unprompted. Once triggered, update all memory structures in this exact order:

1. `.claude/memory/codebase_architecture.md` — describe any logic/file changes exhaustively.
2. `.claude/memory/phase_status.md` — mark work complete, list files and decisions.
3. `.claude/memory/MEMORY.md` — versions, phase, branch, last audited dates.
4. `~/.claude/projects/-Users-akashr-Zapocalypse/memory/project_state.md` — state, branch, phase table, what was added.
5. `~/.claude/projects/-Users-akashr-Zapocalypse/memory/MEMORY.md` — last worked on and new file entries.
6. **Vault sync:** Run `./scripts/sync-vault.sh`, then run the pseudo-command `/wiki-ingest` to propagate diffs.

Full step-by-step order: `.claude/memory/sync-checklist.md`.

### 2. Implementation rules (`.claude/rules/`)

- **`firestore-schema.md`:** Exact collection paths, singleton models, required subcollection paths. Use typed helpers in `src/lib/firestore/helpers.ts`. Never use `any` or `DocumentData`.
- **`ai-gemini.md`:** Only one singleton in `gemini-client.ts`. Always enforce Zod JSON schemas via `z.toJSONSchema` (never the `zod-to-json-schema` package). Accumulate cost atomically via `FieldValue.increment()`.
- **`pipeline-safety.md`:** Strict state-machine progressions, do not swallow errors, validations complete before creating the initial project document, orchestrator runs asynchronously (fire-and-forget). Budget checks independently for Agent 1, Agent 2, and Agent 3.

### 3. Core constraints

- **Budget ($95/100):** Never bypass `checkBudget()`. Never retry on `BudgetExceededError`.
- **Architecture:** No auth (single-user), no real Veo calls, Vertex AI models only.
- **UI:** Tailwind v4 (CSS-first) + M3 dynamic theming. No `tailwind.config.ts`.
- **Git:** Develop on `v3/phase-{N}-{name}` branches; merge to `main` with detailed, synced commits.

## Workflow commands (`.claude/commands/`)

Invoke these at the right moment, or when the user names them. Treat them as checklists (Cursor and Gemini emulate; Claude Code may use native slash commands where configured).

| Command | When to use |
|---------|-------------|
| `/status` | Start of any session — before touching code |
| `/check-budget` | Before adding or modifying any agent or Gemini call |
| `/validate-sko` | Before and after any change to `src/lib/ai/schemas/sko.ts` |
| `/phase-complete <N>` | Immediately after merging a V3 phase branch to main |
| `/remember <fact>` | When a significant decision or constraint is made mid-session |
| `/sync-vault` | After memory or doc changes; run `./scripts/sync-vault.sh` to back up to the Obsidian Vault |
| `/wiki-ingest` | After vault sync; diff-based wiki updates under `Obsidian Vault/Zapocalypse/Wiki/` (see `.claude/commands/wiki-ingest.md`) |

**Detailed behaviors** (e.g. `/status` Obsidian checks, `/phase-complete` checklists) remain in each command file under `.claude/commands/`.

## Adopted engineering skills

Engineering skills live in both `.gemini/skills/` and `.claude/skills/` (identical content). Load them when work touches their domain:

| Skill | Load when... |
|-------|-------------|
| `next-best-practices` | App Router pages, API routes, async patterns, caching |
| `nextjs-app-router-patterns` | Layouts, route handlers, server/client component boundaries |
| `next-cache-components` | Any `fetch`, `cache()`, or revalidation logic |
| `vercel-react-best-practices` | React re-renders, memoization, hooks, event handler patterns |
| `firebase-ai-logic` | Firestore helpers, Gemini client, or any agent code |
| `typescript-advanced-types` | New Zod schemas, complex generics, `satisfies` patterns |
| `tailwind-design-system` | CSS variables, `@theme` tokens, glass morphism components |
| `design-system-patterns` | New UI components or extending the component hierarchy |
| `frontend-design` | Animations, M3 shapes, new visual treatments |
| `web-design-guidelines` | UX decisions, accessibility, layout structure |
