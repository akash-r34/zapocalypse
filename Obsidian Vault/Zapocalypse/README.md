# Zapocalypse LLM Wiki

This is a machine-maintained, human-readable knowledge base for the Zapocalypse project.

## What this is

An interlinked Obsidian wiki derived from `.claude/memory/` and project source docs. Every agent, hook, schema, component, architectural decision, and phase of the project has a dedicated page with full code excerpts, cross-references, and source tracebacks.

The wiki is maintained by a Claude instance running in this directory. Humans curate the `Sources/` layer; the LLM compiles the `Wiki/` layer.

## How to navigate

1. **Start at [`index.md`](index.md)** — use the "Semantic Lookup" table at the top to jump directly to the right page for your question
2. **Browse by domain** — Architecture, Pipeline, Data, Hooks, UI, Infrastructure, Decisions, Project
3. **Check health** — [`Wiki/_Health.md`](Wiki/_Health.md) shows stale pages, orphans, and schema violations

## How to update after a code change

```bash
# From the repo root:
./scripts/sync-vault.sh        # Copies .claude/memory/ + docs into Sources/

# Then in a Claude Code session in this directory:
/wiki-ingest                   # Diff-based update of only affected Wiki/ pages
```

## Key meta files

| File | Purpose |
|------|---------|
| [`index.md`](index.md) | Navigation entry point + semantic lookup |
| [`schema.md`](schema.md) | How this wiki is built — page types, frontmatter, conventions |
| [`log.md`](log.md) | Chronological record of all ingests, queries, and lints |
| [`Wiki/_Health.md`](Wiki/_Health.md) | Live Dataview health checks |

## Obsidian plugins required

- **Dataview** — powers health dashboards and query pages
- **Templater** — used for creating new pages from `Templates/`

See [`.obsidian/README-plugins.md`](.obsidian/README-plugins.md) for tested versions.
