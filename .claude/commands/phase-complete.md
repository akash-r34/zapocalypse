# /phase-complete — Mark Phase as Done

$ARGUMENTS should be the phase number (e.g. `1`).

1. In `phase_status.md`, mark all checkboxes for that phase as `[x]`
2. Update the "Current Phase" header to the next phase
3. Update the "Quick Status" block in `MEMORY.md`
4. Print a summary of what was completed and what comes next
5. Mark wiki phase pages stale by setting `status: stale` in frontmatter of:
   - `Obsidian Vault/Zapocalypse/Wiki/Project/Current Status.md`
   - `Obsidian Vault/Zapocalypse/Wiki/Project/Phase History.md`
   - `Obsidian Vault/Zapocalypse/Wiki/Project/Roadmap.md`
6. Append a summary row to the Phase History wiki page:
   - Under the relevant phase section, add: ✅ Phase N complete (YYYY-MM-DD) — `<one-sentence summary of what was built>`
7. Remind: "Run `./scripts/sync-vault.sh` then `/wiki-ingest` to complete the phase wiki refresh."
