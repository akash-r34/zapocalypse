# Zapocalypse Second Brain — User Manual

> How to use the Obsidian LLM wiki as your primary project reference for day-to-day development.

---

## What It Is

A machine-maintained, interlinked wiki that gives any LLM (Claude or Gemini) complete
project context without reading source code. Think of it as a compiled, cross-referenced
version of `.claude/memory/` — optimised for targeted retrieval rather than full context loading.

**The core promise:** Ask Claude anything about architecture, agents, hooks, schemas,
or project state — and it answers from the wiki, not from scanning files.

---

## Structure at a Glance

```
Obsidian Vault/Zapocalypse/
├── index.md              ← Start here. Semantic lookup table + full TOC.
├── schema.md             ← How the wiki works (for LLM maintainers)
├── log.md                ← Chronological record of all ingests and changes
├── README.md             ← Human-facing vault guide
│
├── Sources/              ← Immutable originals. Synced from repo. Never edit.
│   ├── Memory/           ← .claude/memory/ snapshots
│   ├── Rules/            ← .claude/rules/ snapshots
│   └── Docs/             ← CLAUDE.md, GEMINI.md, V3 plans, market research
│
├── Wiki/                 ← LLM-maintained interlinked pages. The knowledge base.
│   ├── Architecture/     ← Stack, patterns (Fire-and-Forget, Hub-and-Spoke, etc.)
│   ├── Pipeline/         ← Orchestrator + all 7 agents
│   ├── Data/             ← Firestore schema, Zod schemas, Gemini client, helpers
│   ├── Hooks/            ← All 15 React hooks
│   ├── Components/       ← All UI components
│   ├── Pages/            ← App pages + API routes
│   ├── Concepts/         ← Cross-cutting design patterns
│   ├── Decisions/        ← Architectural decision records
│   ├── Infrastructure/   ← Deployment, env vars, endpoints
│   ├── Project/          ← Phase history, roadmap, current status
│   ├── _Health.md        ← Live Dataview health dashboard
│   └── _Queries/         ← Pre-baked Dataview lookups
│
└── Templates/            ← Templater templates for new pages
```

---

## Day-to-Day Workflows

### 1. Asking an architecture question

**You:** "How does budget tracking work?"

**What Claude does (automatically, per Rule 1 in CLAUDE.md):**
1. Opens `index.md` → Semantic Lookup table → `Wiki/Concepts/Budget Protection Layers`
2. Reads that page (full code excerpts included)
3. Answers — no source file opened

You don't need to do anything differently. If you want to be explicit:
> "Check the wiki for how X works"

---

### 2. Making a code change

**Before editing:** Claude reads the wiki page for context (e.g. `Wiki/Pipeline/Orchestrator`)

**After editing:** Claude finds the matching wiki page and marks it stale:
```bash
grep -rl "source_file: src/lib/pipeline/orchestrator.ts" "Obsidian Vault/Zapocalypse/Wiki/"
# Then sets status: stale in that page's frontmatter
```
The wiki-maintaining Claude refreshes it on next `/wiki-ingest`. You don't manage this manually.

---

### 3. Completing a phase

After merging a phase branch to `main`, run:
```
/phase-complete <N>
```

This automatically:
- Marks V3 phase checkboxes done in `phase_status.md`
- Updates `MEMORY.md` quick status
- Marks the three wiki project pages stale
- Appends a summary row to `Wiki/Project/Phase History.md`
- Prompts you to run the sync chain

Then complete the sync chain:
```bash
./scripts/sync-vault.sh   # Sync updated memory files into Sources/
/wiki-ingest              # (in vault Claude session) Refresh stale pages
```

---

### 4. Syncing after any significant change

Run from the repo root whenever `.claude/memory/` or `src/docs/` changes:
```bash
./scripts/sync-vault.sh
```

Then in a Claude Code session opened inside `Obsidian Vault/Zapocalypse/`:
```
/wiki-ingest
```

The ingest is diff-based — it reads `git diff HEAD~1` to find changed sources and only
updates affected pages. A full 78-page re-read never happens unless you do a full ingest.

**Preview before committing:**
```
/wiki-ingest dry-run
```
Prints what *would* change without editing anything.

---

### 5. Checking project status

```
/status
```

Reads `Wiki/Project/Current Status.md` first (canonical). Falls back to
`.claude/memory/phase_status.md` only if the wiki page is stale.

---

### 6. Something is missing from the wiki

If Claude hits a question the wiki can't answer:
1. It falls back to `.claude/memory/` or source files and completes the task
2. Appends a gap entry to `Obsidian Vault/Zapocalypse/log.md`:
   ```
   ## [YYYY-MM-DD] gap | <topic> | discovered during <task>
   <One sentence describing what's missing.>
   ```
3. Next `/wiki-ingest` picks up the gap and creates or updates the missing page

You can also file gaps manually — just open `log.md` and append the entry above.

---

## Slash Commands Reference

| Command | When to use |
|---------|-------------|
| `/status` | Start of every session — canonical phase + next work |
| `/wiki-ingest` | After `sync-vault.sh` — updates only changed wiki pages |
| `/wiki-ingest dry-run` | Preview what would change without editing |
| `/check-budget` | Before adding any agent or Gemini call |
| `/validate-sko` | Before/after editing `src/lib/ai/schemas/sko.ts` |
| `/phase-complete <N>` | After merging a phase branch to main |
| `/remember <fact>` | Mid-session significant decision or constraint |

---

## Maintenance Schedule

| Trigger | Action |
|---------|--------|
| After every `git commit` | `sync-vault.sh` → `/wiki-ingest` (checklist step 6) |
| After every phase merge | `/phase-complete N` → `sync-vault.sh` → `/wiki-ingest` |
| Session start (log entry > 7 days old) | `/wiki-ingest` before answering any architecture question |
| Any time | `/status` to orient yourself |

**Rule of thumb:** If `log.md`'s most recent `ingest` entry is older than the latest
commit to `.claude/memory/`, the wiki is stale. Run the sync chain.

---

## Health Check

Open `Obsidian Vault/Zapocalypse/Wiki/_Health.md` in Obsidian (requires Dataview plugin) to see:

- **Stale pages** — `status: stale`, need `/wiki-ingest`
- **Old pages** — `status: current` but not updated in 30+ days
- **Orphans** — pages with zero inbound links (may be unreachable)
- **Schema violations** — pages missing required frontmatter

Or via grep:
```bash
grep -rl "status: stale" "Obsidian Vault/Zapocalypse/Wiki/"
```

---

## Quick Navigation Cheat Sheet

| I want to know… | Page |
|-----------------|------|
| Pipeline flow end-to-end | `Wiki/Pipeline/Pipeline Overview` |
| What the SKO contains | `Wiki/Data/Schema - SKO` |
| How budget protection works | `Wiki/Concepts/Budget Protection Layers` |
| How tone fingerprinting works | `Wiki/Concepts/Additive Tone Fingerprinting` |
| How C2PA signing works | `Wiki/Concepts/C2PA Signing` |
| All Firestore collection paths | `Wiki/Data/Data Model Overview` |
| How Gemini calls are structured | `Wiki/Data/Gemini Client` |
| CSS glass morphism tokens | `Wiki/Concepts/Glass Morphism Theme` |
| Current phase + next work | `Wiki/Project/Current Status` |
| Phases 6–8 scope | `Wiki/Project/Roadmap` |
| Deployment config | `Wiki/Infrastructure/Deployment` |
| All env vars | `Wiki/Infrastructure/Environment Variables` |
| Why a decision was made | `Wiki/Decisions/*` |

The full semantic lookup table with wikilinks lives in `index.md` → "Semantic Lookup".

---

## Key Principles

1. **Wiki first, source never** — if a wiki page exists, don't open the source file for context
2. **Gap → log → ingest** — missing knowledge flows through `log.md`, not through ad-hoc file reads
3. **Stale is safe** — a stale page is better than no page; it still has old cross-references and won't cause errors
4. **Sync chain** — `code change → memory sync → sync-vault.sh → /wiki-ingest` is the full loop
5. **Sources/ are sacred** — never edit `Sources/`; they're overwritten on every `sync-vault.sh` run
