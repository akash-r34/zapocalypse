---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/ingested-content.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
related:
  - "[[Wiki/Pipeline/Agent - Ingest]]"
  - "[[Wiki/Pipeline/Agent - Analyst]]"
  - "[[Wiki/Pipeline/Agent - Extract]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Ingested Content

> Output schema of Agent 1 (Ingest). Represents structured content extracted from any input type.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/ingested-content.ts

export const IngestedContentSchema = z.object({
  sourceType: z.enum(["url", "text", "file"]),
  title: z.string(),
  rawContent: z.string(),
  contentSections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
    })
  ),
  metadata: z.object({
    author: z.string().nullable(),
    publishDate: z.string().nullable(),
    wordCount: z.number().int().nonnegative(),
  }),
});

export type IngestedContent = z.infer<typeof IngestedContentSchema>;
```

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `sourceType` | `"url"\|"text"\|"file"` | How the content was provided |
| `title` | `string` | Title extracted from content (used in dashboard + project meta) |
| `rawContent` | `string` | Full text content (stored to subcollection via `writeSourceContent`) |
| `contentSections` | `Array<{heading, body}>` | Structured sections for downstream agents |
| `metadata.author` | `string \| null` | Author if detectable (URL mode primarily) |
| `metadata.publishDate` | `string \| null` | Publish date if detectable |
| `metadata.wordCount` | `number` | Total word count (non-negative integer) |

## Post-Ingestion Usage

After `runIngestionAgent` returns, the orchestrator:
- Writes `title` and `sourcePreview` (first 200 chars of `rawContent`) to the project doc via `writeProjectMeta()`
- Fire-and-forgets `writeSourceContent()` to store full raw content in a subcollection

`IngestedContent` is then passed to:
- [[Wiki/Pipeline/Agent - Analyst]] for scoring
- [[Wiki/Pipeline/Agent - Extract]] for SKO production

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Ingest]]
- Consumed by: [[Wiki/Pipeline/Agent - Analyst]], [[Wiki/Pipeline/Agent - Extract]]
