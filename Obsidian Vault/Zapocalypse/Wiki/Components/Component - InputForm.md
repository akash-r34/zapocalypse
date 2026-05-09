---
type: entity
entity_kind: component
domain: ui
source_file: src/components/pipeline/InputForm.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - pipeline
related:
  - "[[Wiki/Pages/Page - Create]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - InputForm

> Single-textarea input with auto-detection of URL vs text vs file. Supports drag-drop file upload.

## Props

```typescript
interface InputFormProps {
  onSubmit: (input: { mode: InputMode; value: string | File }) => Promise<void>;
  disabled?: boolean;
}
```

## State

```typescript
rawInput: string
file: File | null
modeOverride: InputMode | null
loading: boolean
error: string | null
dragging: boolean
```

## Auto-Detection Logic

```typescript
// URL: matches /^https?:\/\/\S+$/ with no newline
// File: file state is set
// Text: default
```

User can manually override via Chip buttons. Shows "Will process as: [mode]" indicator.

## Drag-Drop

Accepts file drag-drop onto the textarea area. Sets `file` state and switches to "file" mode.

## `onSubmit` Contract

```typescript
{ mode: "url" | "text" | "file", value: string | File }
```
Unchanged from V1 — consumers handle mode-specific processing.

## Cross-References

- Used by: [[Wiki/Pages/Page - Create]]
- Validation: [[Wiki/Pipeline/Agent - Ingest]] (server-side, via `validateUrl/validateText/validateFile`)
