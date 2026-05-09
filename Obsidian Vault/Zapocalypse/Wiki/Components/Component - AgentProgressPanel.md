---
type: entity
entity_kind: component
domain: ui
source_file: src/components/pipeline/AgentProgressPanel.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - pipeline
related:
  - "[[Wiki/Pages/Page - Project Detail]]"
  - "[[Component - ProgressRing]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - AgentProgressPanel

> Collapsible step list showing each agent's status. Secondary to `ProgressRing` — lives inside a `<details>` element.

## Props

```typescript
interface AgentProgressPanelProps {
  status: PipelineStatus;
  errorMessage?: string;
}
```

## 6 Agent Steps

```
📥 Ingest
🔬 Analyst
🧠 Extract
✍️  Synthesize
🎯 Hook Scorer
🛡️ Authenticator
```

## Step States

| State | Visual |
|-------|--------|
| `pending` | `opacity-30` |
| `active` | Pulse dot animation |
| `done` | Checkmark |
| `error` | All steps red |

## Cross-References

- Used by: [[Wiki/Pages/Page - Project Detail]]
- Primary indicator: [[Component - ProgressRing]]
