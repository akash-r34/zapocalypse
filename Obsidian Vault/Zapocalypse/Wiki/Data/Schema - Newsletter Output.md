---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/newsletter-output.ts
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
  - "[[Wiki/Components/Component - NewsletterPreview]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Newsletter Output

> Output schema for the Newsletter platform synthesizer. Produces a structured email newsletter.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/newsletter-output.ts

export const NewsletterOutputSchema = z.object({
  subject_line: z.string(),
  preview_text: z.string().max(150),
  sections: z.array(
    z.object({
      heading: z.string(),
      content: z.string(),
    })
  ).min(3),
  cta: z.object({
    text: z.string(),
    context: z.string(),
  }),
  estimated_read_time_minutes: z.number().int().positive(),
});

export type NewsletterOutput = z.infer<typeof NewsletterOutputSchema>;
```

## Field Reference

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `subject_line` | `string` | — | Email subject line |
| `preview_text` | `string` | max 150 chars | Preview text shown in email clients |
| `sections` | `Array<{heading, content}>` | min 3 | Newsletter body sections |
| `cta.text` | `string` | — | Call to action text |
| `cta.context` | `string` | — | Context/framing for the CTA |
| `estimated_read_time_minutes` | `number` | positive int | Estimated reading time |

## Firestore Storage

Written to `projects/{id}/outputs/newsletter`.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Synthesize]]
- UI: [[Wiki/Components/Component - NewsletterPreview]]
