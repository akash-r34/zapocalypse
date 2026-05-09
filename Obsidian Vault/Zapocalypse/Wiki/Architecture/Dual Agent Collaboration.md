---
type: concept
domain: architecture
created: 2026-04-11
updated: 2026-04-12
status: current
tags:
  - concept
  - architecture
related:
  - "[[Wiki/Project/Current Status]]"
sources:
  - "[[Sources/Memory/ui_redesign_gemini]]"
  - "[[Sources/Memory/project_context]]"
  - "[[Sources/Docs/GEMINI.md]]"
  - "[[Sources/Docs/CLAUDE.md]]"
---

# Tri-Agent Collaboration

> Claude Code, Gemini CLI ("Antigravity"), and Cursor share one codebase, one memory system, and one set of rules. No agent maintains a private ruleset.

## The Three Agents

| Agent | Tool | Primary Role |
|-------|------|-------------|
| **Claude** | Claude Code | Planning, complex refactors, new features, architecture decisions |
| **Gemini** | Gemini CLI (`@google/gemini-cli`, model: `gemini-2.5-pro`) | UI implementation, alignment parity, bulk maintenance |
| **Cursor** | Cursor IDE | In-editor AI assistance; follows `CLAUDE.md` via `.cursor/rules/zapocalypse.mdc` |

The V3.3 glass morphism UI was built primarily by Gemini. Starting V3.6, Gemini (Antigravity) has achieved 100% rule and command parity with Claude for safe coworking. Cursor joined the tri-agent setup in V3.6 via committed IDE rules.

## Single Source of Truth

All three agents read from `.claude/` — there are no Cursor-only or Gemini-only rule forks:

```
.claude/
├── memory/          ← All agents read this first
├── rules/           ← ai-gemini.md, pipeline-safety.md, firestore-schema.md
├── commands/        ← /status, /check-budget, /validate-sko, etc.
└── skills/          ← Engineering skill files
.cursor/rules/
└── zapocalypse.mdc  ← Directs Cursor to CLAUDE.md; no duplicated rules
```

## Shared Memory System

All agents read from and write to `.claude/memory/` (8 files).

```
.claude/memory/
├── codebase_architecture.md  ← Primary reference (read before opening source files)
├── decisions.md               ← Architectural decisions log
├── phase_status.md            ← Phase history and current state
├── project_context.md         ← Core goals and constraints
├── user_prefs.md              ← User working style
├── ui_redesign_gemini.md      ← Gemini handover notes (V3.3 glass morphism)
├── sync-checklist.md          ← Memory sync procedure
└── MEMORY.md                  ← Master index
```

## Memory Sync Rule

Memory sync (all 5 files in `sync-checklist.md`) runs **only after the user confirms the current work is functioning** — signals like "it works", "tests pass", "looks good". Agents do NOT sync proactively before commits or suggest it unprompted.

## Handover Protocol

When one agent hands back to another:
1. The completing agent updates `.claude/memory/` per the sync-checklist
2. The new agent reads `codebase_architecture.md` before opening any source file
3. Wiki is the primary reference — check `Obsidian Vault/Zapocalypse/index.md` first

## Configuration Files

Each agent has its own entry point, but all point to the same `.claude/` playbook:

- **`CLAUDE.md`** (root) — Claude's entry: slash commands, skills, memory rules, hard constraints
- **`GEMINI.md`** (root) — Gemini's entry: emulated hooks, workflow parity, same rules
- **`.cursor/rules/zapocalypse.mdc`** — Cursor's entry: `alwaysApply: true`, directs to `CLAUDE.md`

All three agree on:
- Budget: $100/mo, kill-switch at $95, `checkBudget()` before every Gemini call
- Zod v4: native `z.toJSONSchema()`, never `zod-to-json-schema`
- No auth (single-user app)
- Tailwind v4 CSS-first theming, `--glass-*` vars only
- Agents as direct imports, never HTTP calls
- Vertex AI mode, ADC auth, `gemini-2.5-flash` only

## Gemini-Specific Notes (V3.3 handover)

From `ui_redesign_gemini.md`, Gemini left explicit warnings for Claude:

> - **DO NOT** alter CSS opacities on glass panels — they are precisely calibrated
> - **DO NOT** revert to SVG logos — PNGs processed by `sharp` script are intentional
> - **DO NOT** hardcode color classes — use `--glass-*` CSS variables only
> - **DO NOT** remove `BackgroundElements` floating orbs — they are the adaptive ambient layer

## Slash Commands (All Three Agents)

| Command | Purpose |
|---------|---------|
| `/status` | Read memory, print concise status report |
| `/check-budget` | Verify every agent has budget checks |
| `/validate-sko` | Validate SKO schema integrity |
| `/phase-complete <N>` | Mark a phase done, update memory |
| `/remember <fact>` | Save fact to appropriate memory file |
| `/sync-vault` | Run `sync-vault.sh` to back up to Obsidian |
| `/wiki-ingest` | Diff-based wiki update after vault sync |

## Cross-References

- Memory files: `Sources/Memory/`
- Claude configuration: `Sources/Docs/CLAUDE.md`
- Gemini configuration: `Sources/Docs/GEMINI.md`
- Project status: [[Wiki/Project/Current Status]]
