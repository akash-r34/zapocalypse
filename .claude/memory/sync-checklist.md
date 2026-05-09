---
name: memory-sync-checklist
description: Step-by-step checklist for syncing all 5 memory files after any code change. Read this when doing a sync.
type: reference
---

# Memory Sync Checklist

**When:** After the user confirms the current work is functioning correctly — NOT before every commit automatically. Wait for explicit confirmation ("it works", "looks good", "tests pass") before running this sync. Do not prompt for sync or suggest it until then.
**Order matters** — update all 5 in sequence.

---

## 1. `.claude/memory/codebase_architecture.md` ← MOST IMPORTANT

The file that replaces code reading. Must be comprehensive enough that a future Claude session never needs to open a source file for context.

- **New file created:** Add to directory layout AND add a dedicated entry: exported functions with full signatures, props interfaces, key state, imports from project files, one-sentence purpose.
- **Existing file modified:** Update the corresponding entry — signature, behavior, props, notes. Delete stale information.
- **File deleted:** Remove its entry entirely.
- Update version number and "Last audited" date in the header.

**Sufficient means:** A future Claude reading only this file can answer: What does this export? Params and return types? Component props? What does it subscribe to? What does it write to Firestore? Constraints and edge cases?

---

## 2. `.claude/memory/phase_status.md`

- Mark the completed phase/feature ✅ with date
- Append new section: files created (path + purpose), files modified (path + what changed), key design decisions (non-obvious choices + WHY), user-facing motivation
- Update V3 phase table row

---

## 3. `.claude/memory/MEMORY.md`

- Update "Current Version" + date
- Update "Next" phase
- Update "Active branch" + "Last worked on"
- Update "Last audited" date for `codebase_architecture.md` table row

---

## 4. `~/.claude/projects/-Users-akashr-Zapocalypse/memory/project_state.md`

- Update "Current State" date
- Update "Active branch" + "Last merged"
- Update phase table rows
- Append "V3 Phase N — What Was Added" section with files + design decisions

---

## 5. `~/.claude/projects/-Users-akashr-Zapocalypse/memory/MEMORY.md`

- Update "Last worked on" line
- Add new index entries for any new memory files created

---

## 6. Obsidian Wiki Sync

Run from the repo root:
```bash
./scripts/sync-vault.sh
```
Then, in the vault Claude session (working directory: `Obsidian Vault/Zapocalypse/`), invoke:
```
/wiki-ingest
```
This runs the diff-based ingest: identifies which `Sources/` files changed, finds the wiki pages that reference them, and updates only those pages. Prevents silent wiki drift after every commit.
