---
type: reference
domain: infrastructure
source_file: app/api/pipeline/
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - reference
  - infrastructure
  - api
related:
  - "[[Wiki/Pages/API Routes]]"
  - "[[Wiki/Architecture/Fire and Forget Pattern]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# API Endpoints

> Quick-reference table for all HTTP API routes. See [[Wiki/Pages/API Routes]] for full implementation details.

## Endpoints

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| `POST` | `/api/pipeline/run` | 202 | Start new pipeline run |
| `POST` | `/api/pipeline/regenerate` | 202 | Regenerate one platform output |

## `POST /api/pipeline/run`

```
Request:  { mode: "url"|"text"|"file", value: string, fileName?, fileType?, fileSize? }
Response: { projectId: string }  →  202 Accepted
Errors:   { error: string }      →  400 (invalid), 422 (validation fail)
```

**Flow:** Validate → `createProject()` → `void runPipeline()` → return `{ projectId }`

## `POST /api/pipeline/regenerate`

```
Request:  { projectId: string, platform: SupportedPlatform, feedback?: string, retry?: boolean }
Response: { status: "processing" }  →  202 Accepted
Errors:   { error: string }         →  400 (invalid), 429 (max 3 regens reached)
```

**Flow:** Validate → check regen count → `void runSelectiveRegeneration()` → return `{ status: "processing" }`

## No Other API Routes

There are **no** `/api/agents/*` endpoints for internal use. Agents are direct TypeScript function imports. The only API routes are the two above, both returning 202.

## Cross-References

- Full route code: [[Wiki/Pages/API Routes]]
- Fire-and-forget pattern: [[Wiki/Architecture/Fire and Forget Pattern]]
- Called by: [[Wiki/Pages/Page - Create]], [[Wiki/Components/Component - FeedbackForm]]
