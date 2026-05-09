---
type: schema
created: 2026-04-11
updated: 2026-04-11
tags:
  - schema
  - meta
---

# Zapocalypse Wiki — LLM Maintenance Schema

> This is the governing document for the Zapocalypse Second Brain wiki. Any LLM maintaining this wiki must read this file first. It defines the architecture, conventions, page types, and operational workflows.

---

## Architecture: Three Layers

```
Sources/   ← Immutable originals. Synced from the repo via sync-vault.sh. LLM reads, never writes.
Wiki/      ← LLM-maintained interlinked pages. The processed, structured knowledge base.
Templates/ ← Templater templates for creating new pages. LLM uses as a starting point.
```

**The key principle:** Sources are raw input. Wiki is compiled knowledge. The wiki is a persistent, compounding artifact — it gets richer with every source sync and every question asked.

**Sync flow:**
```
Development → .claude/memory/ updated → sync-vault.sh → Sources/ updated → LLM ingests → Wiki/ updated
```

The LLM writes everything in `Wiki/`. Humans curate `Sources/` and ask questions. Never modify `Sources/` files directly — they are overwritten on each sync.

---

## Page Types

Six types. Use exactly one per page.

| Type | `type` value | When to create |
|------|-------------|---------------|
| **Overview** | `overview` | High-level summary of a subsystem. Links to all child entity pages. One per domain area. |
| **Entity** | `entity` | One concrete implementation artifact: a single agent, hook, schema, component, route. |
| **Concept** | `concept` | A design pattern or principle spanning multiple entities (e.g., "Fire and Forget Pattern"). |
| **Decision** | `decision` | Clustered architectural decisions with rationale and consequences. |
| **Status** | `status` | Living document: phase history, roadmap, current project state. |
| **Reference** | `reference` | Lookup tables, cheat sheets, quick-reference data without prose. |

**Decision rule:** Is it one concrete implementation artifact? → Entity. Does it explain a pattern spanning multiple artifacts? → Concept.

---

## Frontmatter Schema

Every page MUST have valid YAML frontmatter. The `updated` field MUST be set on every edit.

### Overview
```yaml
---
type: overview
domain: <architecture|pipeline|data|hooks|ui|infrastructure|project>
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: current
tags:
  - overview
  - <domain>
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---
```

### Entity
```yaml
---
type: entity
entity_kind: <agent|component|hook|schema|collection|api-route|utility>
domain: <pipeline|data|hooks|ui|infrastructure>
source_file: src/path/to/file.ts
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: current       # current | stale | deprecated
tags:
  - entity
  - <entity_kind>
  - <domain>
related:
  - "[[Related Page]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---
```

### Concept
```yaml
---
type: concept
domain: <architecture|pipeline|data|hooks|ui|infrastructure>
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: current
tags:
  - concept
  - <domain>
related:
  - "[[Related Entity or Concept]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---
```

### Decision
```yaml
---
type: decision
domain: <ai|pipeline|data|ui|infrastructure|product>
decided: YYYY-MM-DD
updated: YYYY-MM-DD
status: current
tags:
  - decision
  - <domain>
sources:
  - "[[Sources/Memory/decisions]]"
---
```

### Status
```yaml
---
type: status
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - status
  - project
---
```

### Reference
```yaml
---
type: reference
domain: <css|firestore|env|api|pricing>
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: current
tags:
  - reference
  - <domain>
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---
```

---

## Wikilink Conventions

- Use `[[Page Name]]` wikilinks for the **first mention** of any entity in each section. Subsequent mentions in the same section use plain text.
- Cross-domain links are especially valuable — a pipeline page linking to a schema page, a hook page linking to a Firestore path.
- **Every new page MUST be linked from at least `index.md` and one other wiki page.** No orphans.
- Use `[[Page Name|display text]]` when the link target name differs from the natural text (e.g., `[[Schema - SKO|SKO schema]]`).
- Prefer wiki page names that are unambiguous: `Agent - Ingest` not just `Ingest`.

---

## Code Excerpt Conventions

This wiki includes **full code excerpts** — the goal is LLM-completeness without needing to read source files.

- **Function signatures:** Always include return type and all parameter types.
- **Zod schemas:** Include every field name, type, and constraint (min/max, enum values). Use TypeScript code blocks.
- **Component props:** Include the full props interface or type.
- **Implementation logic:** Include key code blocks where the logic is non-obvious (e.g., state machine transitions, retry logic, cost tracking pattern).
- **Source file path:** Always set `source_file` in frontmatter for entity pages. Use the path relative to the repo root.
- Code blocks use ` ```typescript ` for TypeScript/TSX, ` ```bash ` for shell commands, ` ```yaml ` for Firestore structures.

---

## Operations

### Diff-Based Ingest (PREFERRED — only processes what changed)

Run after `sync-vault.sh` has updated `Sources/`. Do NOT re-read everything — only diff what changed.

**Step 1 — Identify changed sources**

From the repo root, run:
```bash
git diff HEAD~1 --name-only -- .claude/memory/ .claude/rules/ src/docs/ CLAUDE.md GEMINI.md AGENTS.md
```
This gives exact files changed since last commit. Map each path to its `Sources/` equivalent:
- `.claude/memory/foo.md` → `Sources/Memory/foo.md`
- `.claude/rules/bar.md` → `Sources/Rules/bar.md`
- `src/docs/baz.md` → `Sources/Docs/baz.md`

Alternatively, if not working from git: compare file modification timestamps of `Sources/` files against the most recent `## [YYYY-MM-DD HH:MM] ingest` entry in `[[log]]`.

**Step 2 — Find affected wiki pages**

For each changed source file, grep the `Wiki/` tree for pages that reference it in `sources:` frontmatter:
```bash
grep -rl "Sources/Memory/foo" "Wiki/"
```
Only those pages need updating.

**Step 3 — Read and update**

For each affected wiki page:
1. Read the changed `Sources/` file (targeted read, not full re-read of vault)
2. Read the wiki page
3. Update only the sections whose source content has changed
4. Set `updated: YYYY-MM-DD` in frontmatter

**Step 4 — Handle gaps from `[[log]]`**

Check `[[log]]` for entries tagged `gap` since the last ingest:
```
## [YYYY-MM-DD] gap | <topic> | discovered during <task>
```
For each gap: create a new wiki page if the topic warrants one, or add a section to an existing page. Then update the log entry to show it was resolved.

**Step 5 — Create new pages if needed**

If a changed source introduces new agents, hooks, schemas, or components not yet in the wiki, create pages using `Templates/`. Add to `[[index]]`.

**Step 6 — Log the ingest**
```
## [YYYY-MM-DD HH:MM] ingest | <source file name(s)> | <N pages affected>
Changed sources: Sources/Memory/foo.md, Sources/Docs/bar.md
Pages updated: [[Page1]], [[Page2]], ...
Gaps resolved: [[Page3]] (was noted YYYY-MM-DD)
Summary: <one sentence of what changed>
```

### Full Ingest (use only for bootstrap or major structural changes)

Run when starting fresh or after a large multi-file restructure where diff-based is impractical.

1. Read every file in `Sources/`
2. For each source, identify all wiki pages it informs
3. Update all stale pages, create missing ones
4. Rebuild `[[index]]` if structure changed
5. Log with `## [...] ingest | full | <N pages>`

### Query (answering questions using the wiki)

1. Start from `[[index]]` to find relevant wiki pages
2. Read relevant `Wiki/` pages — **not** `Sources/` directly
3. Cross-reference related pages via wikilinks
4. If the answer synthesizes novel insight worth keeping, file it back as a new page (type: `concept` or `reference`) and link it from `[[index]]`
5. If the query reveals gaps (missing pages, stale info), note them in `[[log]]`

### Lint (health check — run periodically)

Check for:
- **Orphan pages:** Pages with no inbound `[[wikilinks]]` from other wiki pages
- **Stale pages:** `status: current` but `updated` is more than 30 days old while source has changed
- **Broken links:** `[[Page Name]]` references that don't resolve to a file
- **Missing frontmatter:** Pages without required fields (`type`, `updated`, `status`)
- **Missing index entries:** Pages in `Wiki/` not listed in `[[index]]`
- **Content gaps:** Important entities mentioned in passing but lacking their own page

Lint output goes to `[[log]]`:
```
## [YYYY-MM-DD] lint | <N issues found>
- Orphans: [[Page1]], [[Page2]]
- Stale: [[Page3]] (last updated YYYY-MM-DD)
- Gaps: <description>
```

---

## Content Style

Write for an LLM reader — be precise, not conversational.

- Lead every page with a **one-sentence summary** immediately after the frontmatter
- Use tables for structured data (Firestore paths, function signatures, prop lists)
- Use code blocks for all TypeScript, shell, and YAML
- Include `source_file` paths so a reader can navigate to the exact file
- Soft limit: ~300 lines per page. If a page exceeds this, consider splitting by entity
- Status pages (`Current Status`, `Phase History`) are exceptions — they grow over time
- Do not summarize obvious things ("this function returns a value") — focus on constraints, edge cases, and non-obvious behaviors

---

## Sync Protocol

`sync-vault.sh` copies from the repo into `Sources/`:
- `.claude/memory/*.md` → `Sources/Memory/`
- `.claude/rules/*.md` → `Sources/Rules/`
- Root docs (CLAUDE.md, GEMINI.md, etc.) + `src/docs/*.md` → `Sources/Docs/`

Run from the repo root: `./scripts/sync-vault.sh`

After each sync:
1. Check which files in `Sources/` have a newer `updated` timestamp than the wiki pages derived from them
2. Run ingest on those files
3. The wiki is allowed to diverge from sources — sources are raw, wiki is processed and may contain cross-references and synthesized insights that don't exist in any single source

---

## Ingest Cadence

Run `/wiki-ingest` in the following situations — do not skip:

| Trigger | Action |
|---------|--------|
| After `./scripts/sync-vault.sh` | Always run immediately after — this is the primary trigger |
| Start of a session | If `git log --oneline .claude/memory/ src/docs/` shows commits newer than the most recent `## [...] ingest` entry in `log.md` |
| Before answering an architecture/phase question | If the most recent `ingest` entry in `log.md` is > 7 days old — refresh first, then answer |
| After any phase merge | `/phase-complete` marks pages stale; run `/wiki-ingest` to refresh them |

**Principle:** The wiki is allowed to lag by one commit — but never by a full session. If you're about to answer "How does X work?" from the wiki and the wiki is week-old, refresh first.

---

## Tag Taxonomy

Every page MUST carry these tags. Use exactly the canonical values — no abbreviations, no plurals.

### Type tags (exactly one per page)

| Tag | Use on |
|-----|--------|
| `entity` | Single concrete artifact (agent, hook, schema, component, route) |
| `overview` | High-level subsystem summary with links to all child pages |
| `concept` | Design pattern spanning multiple entities |
| `decision` | Architectural decision cluster with rationale |
| `status` | Living project-state document |
| `reference` | Lookup table / cheat sheet |

### Domain tags (exactly one per page)

| Tag | Domain |
|-----|--------|
| `architecture` | System design, patterns, principles |
| `pipeline` | Agents, orchestrator, pipeline flow |
| `data` | Firestore schemas, Zod schemas, helpers |
| `hooks` | React hooks |
| `ui` | Components, pages, design system |
| `infrastructure` | Deployment, env vars, API endpoints |
| `project` | Phase history, roadmap, current status |

### Entity kind tags (entity pages only)

| Tag | Use on |
|-----|--------|
| `agent` | Pipeline agent pages |
| `component` | React component pages |
| `hook` | React hook pages |
| `schema` | Zod schema pages |
| `collection` | Firestore collection pages |
| `api-route` | Route handler pages |
| `utility` | Standalone utility / helper pages |
| `page` | App page (`app/**.tsx`) — extended tag for Pages domain |
| `output` | Platform output schema — extended tag for multi-platform schemas |

**Non-canonical tags** (present in current pages, documented for clarity):
- `meta` — index, schema, log files only
- `roadmap` — Roadmap.md only

---

## Log Entry Schema

All `log.md` entries MUST follow this grammar so entries are greppable and parseable:

```
## [YYYY-MM-DD HH:MM] <operation> | <subject> | <N> <unit>

**Operation:** <one-line description of what was done>
**Changes:**
- `path/to/file.md` — what changed (one bullet per file)
**Result:** <one-line outcome or verification>
```

**`<operation>` values** — use exactly one:

| Value | When |
|-------|------|
| `bootstrap` | Initial full-vault creation |
| `ingest` | Diff-based or full source ingest |
| `lint` | Health check run |
| `refinement` | Schema/tooling improvements (not content) |
| `schema` | Changes to schema.md or meta conventions |
| `gap` | Gap discovered during a task (unresolved) |
| `gap-resolved` | Gap from a prior entry now closed |
| `query` | A question answered using the wiki that produced a new page |

**`<N> <unit>` examples:** `3 pages`, `1 file`, `12 issues found`

**Gap entries** use a simplified format (no Changes/Result needed):
```
## [YYYY-MM-DD] gap | <topic> | discovered during <task>
<One sentence describing what is missing or wrong.>
```

---

## Relationship to `.claude/memory/`

`.claude/memory/` and this wiki serve **different purposes**:

| `.claude/memory/` | This wiki |
|-------------------|-----------|
| Flat markdown files | Interlinked graph of pages |
| Loaded into Claude's context window at session start | Selectively queried by page topic |
| Updated by Claude during development | Ingested into wiki after sync |
| 8 files, ~80KB total | ~80+ pages, granular by entity |
| Optimized for context loading | Optimized for targeted retrieval |

**The wiki does not replace `.claude/memory/`.** The memory system is the dev-time source of truth. This wiki is the queryable knowledge base derived from it.
