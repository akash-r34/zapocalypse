---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/twitter-output.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
  - output
related:
  - "[[Wiki/Pipeline/Agent - Synthesize]]"
  - "[[Wiki/Components/Component - TweetCarousel]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Twitter Output

> Output schema for the Twitter/X platform synthesizer. Produces a thread of up to 15 tweets.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/twitter-output.ts

export const TweetSchema = z.object({
  text: z.string().max(280),
  hook: z.string(),
  type: z.enum(["hook", "insight", "data", "cta", "bridge", "contrarian"]),
  answer_block: z.string().max(500).optional(),
});

export const TwitterOutputSchema = z.object({
  tweets: z.array(TweetSchema).min(1).max(15),
  thread_narrative: z.string(),
});

export type Tweet = z.infer<typeof TweetSchema>;
export type TwitterOutput = z.infer<typeof TwitterOutputSchema>;
```

## Field Reference

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `tweets` | `Tweet[]` | 1-15 items | The thread tweets |
| `tweets[].text` | `string` | max 280 chars | Tweet body |
| `tweets[].hook` | `string` | — | The hook angle for this tweet |
| `tweets[].type` | enum | 6 values | Tweet role in the thread |
| `tweets[].answer_block` | `string?` | max 500 chars | GEO-optimized Q&A block for search visibility |
| `thread_narrative` | `string` | — | Summary of the thread arc |

## Tweet Types

| Type | Purpose |
|------|---------|
| `hook` | Opening tweet that grabs attention |
| `insight` | Core insight from a semantic chunk |
| `data` | Data point or verifiable claim |
| `cta` | Call to action |
| `bridge` | Connects two ideas or provides transition |
| `contrarian` | Challenges a common assumption |

## `answer_block`

Optional GEO (Generative Engine Optimization) field — a self-contained Q&A designed to be extracted by search engines/AI crawlers. Added selectively on tweets with high informational density.

## Firestore Storage

Written to `projects/{id}/outputs/twitter` by orchestrator.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Synthesize]]
- UI: [[Wiki/Components/Component - TweetCarousel]]
- Hook scoring: [[Wiki/Pipeline/Agent - Hook Scorer]] scores `hook` fields
