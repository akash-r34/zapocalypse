---
type: entity
entity_kind: page
domain: ui
source_file: app/create/page.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - page
  - ui
related:
  - "[[Wiki/Components/Component - Layout]]"
  - "[[Wiki/Components/Component - InputForm]]"
  - "[[Wiki/Pages/API Routes]]"
  - "[[Wiki/Pages/Page - Project Detail]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Page - Create

> `app/create/page.tsx` — Input form page. Accepts URL, text, or file; POSTs to `/api/pipeline/run`; redirects to project detail on success.

## Route

`/create` — `"use client"` component.

## Submit Handler

```typescript
async function handleSubmit({
  mode,
  value,
}: {
  mode: "url" | "text" | "file";
  value: string | File;
}) {
  let textValue: string;
  let fileType: string | undefined;
  let fileSize: number | undefined;
  let fileName: string | undefined;

  if (value instanceof File) {
    textValue = await value.text();
    fileType = value.type;
    fileSize = value.size;
    fileName = value.name;
  } else {
    textValue = value;
  }

  const res = await fetch("/api/pipeline/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, value: textValue, fileType, fileSize, fileName }),
  });

  const data = await res.json().catch(() => ({})) as { error?: string; projectId?: string };

  if (!res.ok) {
    throw new Error(data.error ?? `Pipeline failed (${res.status})`);
  }

  const { projectId } = data as { projectId: string };
  router.push(`/project/${projectId}`);
}
```

**Key behavior:**
- Files are read client-side via `File.text()` before submission (text/pdf/docx content extracted)
- File metadata (`fileType`, `fileSize`, `fileName`) sent alongside extracted text
- On success (202): navigates to `/project/{projectId}`
- On error: `InputForm` handles display (throws Error with `data.error` message)

## Layout

- `max-w-2xl mx-auto` centered card with `glass-elevated` styling
- Gradient overlay (decorative, `pointer-events-none`)
- Header: "New Project" + subtitle
- `InputForm` rendered inside a nested glass container

## Component Used

`InputForm` — handles tab selection (URL/Text/File), validation UI, and submit state. Props:
```typescript
<InputForm onSubmit={handleSubmit} />
```

The `onSubmit` callback receives `{ mode, value }` from `InputForm` and is responsible for the API call.

## Cross-References

- Input component: [[Component - InputForm]]
- API endpoint: [[Wiki/Pages/API Routes]] (`POST /api/pipeline/run`)
- Redirect target: [[Wiki/Pages/Page - Project Detail]]
- Layout: [[Component - Layout]] (`AppShell`)
