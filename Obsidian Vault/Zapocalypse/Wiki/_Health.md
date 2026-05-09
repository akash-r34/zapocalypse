---
type: reference
domain: architecture
created: 2026-04-12
updated: 2026-04-14
status: current
tags:
  - reference
  - meta
---

# Wiki Health Dashboard

> Live health check for the Zapocalypse wiki. Run after every ingest to catch drift.

---

## Stale Pages

Pages with `status: stale` — need refresh on next `/wiki-ingest`:

```dataview
TABLE updated, domain FROM "Wiki"
WHERE status = "stale"
SORT updated ASC
```

---

## Old Pages (> 30 days since last update)

Pages marked `current` but not updated recently — verify against source:

```dataview
TABLE updated, type, domain FROM "Wiki"
WHERE status = "current" AND date(updated) < date(today) - dur(30 days)
SORT updated ASC
```

---

## Orphan Candidates

Pages with no inbound links — may be unreachable in the wiki graph:

```dataview
TABLE file.inlinks AS "Inbound Links", type FROM "Wiki"
WHERE type != "overview" AND length(file.inlinks) = 0
SORT type ASC
```

*Note: Overview pages are excluded — they are intentionally navigation hubs linked from `index.md` but not heavily linked-to.*

---

## Missing Required Frontmatter

Pages without `type` or `updated` — schema violation:

```dataview
TABLE file.path FROM "Wiki"
WHERE !type OR !updated
```

---

## Cross-References

- Schema and conventions: [[schema]]
- Ingest workflow: [[schema]] or run `/wiki-ingest` in vault session
- Activity log: [[log]]
