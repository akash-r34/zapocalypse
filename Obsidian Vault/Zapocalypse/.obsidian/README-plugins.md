# Obsidian Plugin Requirements

This vault requires two community plugins. Install via Settings → Community Plugins.

| Plugin | ID | Min Version | Purpose |
|--------|----|-------------|---------|
| Dataview | `dataview` | 0.5.66 | Powers `Wiki/_Health.md` health dashboards and `Wiki/_Queries/` lookup pages |
| Templater | `templater-obsidian` | 2.x | Enables `Templates/` page templates for creating new wiki pages |

## Installation

1. Open Obsidian → Settings → Community Plugins → Browse
2. Search for "Dataview" → Install → Enable
3. Search for "Templater" → Install → Enable

## Notes

- Dataview queries in `_Health.md` require the vault to be fully indexed (may take a moment on first open)
- If Dataview tables show "No results" unexpectedly, check that frontmatter YAML is valid on the affected pages
- Templater templates live in `Templates/` — configure Templater to point at this folder in its settings
