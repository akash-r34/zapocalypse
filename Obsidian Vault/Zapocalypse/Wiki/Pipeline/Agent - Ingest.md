---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-ingest.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - agent
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Data/Schema - Ingested Content]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Agent - Ingest

> Agent 1: converts raw input (URL / text / file) into a structured `IngestedContent` object for downstream agents.

## Signature

```typescript
// src/lib/pipeline/agent-ingest.ts

interface IngestInput {
  projectId: string;
  mode: "url" | "text" | "file";
  value: string;  // URL string, raw text, or file content as text
}

export async function runIngestionAgent(input: IngestInput): Promise<IngestedContent>
```

## Flow

```typescript
await checkBudget();  // throws BudgetExceededError if over limit

if (mode === "url") {
  const extracted = await extractFromUrl(value);  // article extractor
  rawInput = `Title: ${extracted.title}\n\n${extracted.content}`;
} else {
  rawInput = value;  // text or file content passed as-is
}

const prompt = buildIngestPrompt(mode, rawInput);
return await generateStructured({ prompt, schema: IngestedContentSchema, projectId, agentName: "ingest" });
```

## Input Modes

| Mode | Source | Pre-processing |
|------|--------|---------------|
| `url` | Web URL | `extractFromUrl()` strips HTML, extracts title/author/date |
| `text` | Raw text | Passed directly to Gemini |
| `file` | File content as string | Passed directly to Gemini |

**Important:** YouTube URLs are rejected by `extractFromUrl()` — throws `UrlExtractionError`. Users should paste transcripts as text.

## Output: `IngestedContent`

See full schema at [[Wiki/Data/Schema - Ingested Content]].

```typescript
{
  sourceType: "url" | "text" | "file";
  title: string;
  rawContent: string;
  contentSections: Array<{ heading: string; body: string }>;
  metadata: {
    author?: string;
    publishDate?: string;
    wordCount: number;
  };
}
```

## Post-Processing by Orchestrator

After `runIngestionAgent` returns, the orchestrator:
1. Calls `writeProjectMeta(projectId, { title, sourcePreview: rawContent.slice(0, 200) })` — stores title on the project doc for dashboard display
2. Fire-and-forgets `writeSourceContent(projectId, title, rawContent)` — stores full raw content in a subcollection

The agent itself does NOT write to Firestore.

## Dependencies

| Module | Purpose |
|--------|---------|
| `[[Wiki/Data/Gemini Client]]` | `generateStructured()` |
| `url-extractor.ts` | `extractFromUrl()` — `@extractus/article-extractor` wrapper |
| `checkBudget()` | From `src/lib/budget/tracker.ts` |
| `buildIngestPrompt()` | From `src/lib/ai/prompts/ingest.ts` |

## Cross-References

- Output schema: [[Wiki/Data/Schema - Ingested Content]]
- Calls: [[Wiki/Data/Gemini Client]]
- Next agent: [[Agent - Analyst]]
- Orchestrator context: [[Orchestrator]]
