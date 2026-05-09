# /wiki-ingest — Diff-Based Wiki Ingest

Run after `./scripts/sync-vault.sh` to update only the wiki pages affected by changed source files. Do NOT re-read everything — only process what changed.

**Dry-run mode:** If invoked as `/wiki-ingest dry-run`, perform Steps 1–2 only (identify changed sources and find affected wiki pages) but **do not edit any file**. Print the would-be update list — changed sources, affected pages, open gaps — then stop. Use this to preview a large ingest before committing.

---

## Step 1 — Identify changed sources

From the repo root, run:
```bash
git diff HEAD~1 --name-only -- .claude/memory/ .claude/rules/ src/docs/ CLAUDE.md GEMINI.md AGENTS.md
```

Map each changed path to its `Sources/` equivalent:
- `.claude/memory/foo.md` → `Sources/Memory/foo.md`
- `.claude/rules/bar.md` → `Sources/Rules/bar.md`
- `CLAUDE.md` / `GEMINI.md` / `AGENTS.md` → `Sources/Docs/<filename>`
- `src/docs/baz.md` → `Sources/Docs/baz.md`

If not working from git (e.g., files synced outside a commit): compare modification timestamps of `Sources/` files against the most recent `## [YYYY-MM-DD HH:MM] ingest` entry in `log.md`.

---

## Step 2 — Find affected wiki pages

For each changed source file, grep the `Wiki/` tree for pages that reference it in `sources:` frontmatter:
```bash
grep -rl "Sources/Memory/foo" "Wiki/"
```
Only those pages need updating.

---

## Step 3 — Update affected pages

For each affected wiki page:
1. Read the changed `Sources/` file (targeted read)
2. Read the wiki page
3. Update only the sections whose source content has changed
4. Set `updated: YYYY-MM-DD` in frontmatter

---

## Step 4 — Resolve open gaps

Check `log.md` for unresolved `[gap]` entries since the last ingest:
```
## [YYYY-MM-DD] gap | <topic> | discovered during <task>
```
For each gap: create a new wiki page if the topic warrants one, or add a section to an existing page. Then update the log entry to show it was resolved.

---

## Step 5 — Create new pages if needed

If a changed source introduces new agents, hooks, schemas, or components not yet in the wiki, create pages using `Templates/`. Add entries to `index.md`.

---

## Step 6 — Log the ingest

Append to `log.md`:
```
## [YYYY-MM-DD HH:MM] ingest | <source file name(s)> | <N pages affected>
Changed sources: Sources/Memory/foo.md, Sources/Docs/bar.md
Pages updated: [[Page1]], [[Page2]], ...
Gaps resolved: [[Page3]] (was noted YYYY-MM-DD)
Summary: <one sentence of what changed>
```
