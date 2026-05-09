---
type: reference
domain: architecture
created: 2026-04-12
updated: 2026-04-12
status: current
tags:
  - reference
  - meta
---

# Recently Updated Wiki Pages

> Live Dataview query — pages sorted by most recent update.

```dataview
TABLE updated, type, domain, status FROM "Wiki"
WHERE type != null
SORT updated DESC
LIMIT 20
```
