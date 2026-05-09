---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/linkedin-output.ts
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
  - "[[Wiki/Components/Component - LinkedInPreview]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - LinkedIn Output

> Output schema for the LinkedIn platform synthesizer. Produces posts + an optional document carousel.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/linkedin-output.ts

export const LinkedInPostSchema = z.object({
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  angle: z.string(),
  estimated_read_time_seconds: z.number().int().positive(),
  answer_block: z.string().max(500).optional(),
});

export const CarouselSlideSchema = z.object({
  page_number: z.number().int().min(1),
  headline: z.string(),
  body: z.string(),
  visual_suggestion: z.string().optional(),
});

export const LinkedInOutputSchema = z.object({
  posts: z.array(LinkedInPostSchema).min(1).max(10),
  document_carousel: z.object({
    title: z.string(),
    slides: z.array(CarouselSlideSchema).min(3).max(10),
    summary: z.string(),
  }).optional(),
});

export type LinkedInPost = z.infer<typeof LinkedInPostSchema>;
export type CarouselSlide = z.infer<typeof CarouselSlideSchema>;
export type LinkedInOutput = z.infer<typeof LinkedInOutputSchema>;
```

## Field Reference

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `posts` | `LinkedInPost[]` | 1-10 | LinkedIn posts |
| `posts[].hook` | `string` | — | Opening hook line |
| `posts[].body` | `string` | — | Post body text |
| `posts[].cta` | `string` | — | Call to action |
| `posts[].angle` | `string` | — | Content angle/framing |
| `posts[].estimated_read_time_seconds` | `number` | positive int | Reading time estimate |
| `posts[].answer_block` | `string?` | max 500 | GEO Q&A block |
| `document_carousel` | optional object | — | LinkedIn document/PDF carousel |
| `document_carousel.slides` | `CarouselSlide[]` | 3-10 | Carousel slides |
| `document_carousel.slides[].visual_suggestion` | `string?` | — | Suggested visual for the slide |

## Document Carousel

The optional carousel generates a LinkedIn "document" (PDF-like slide deck). The `CarouselPreview` component renders it with navigation.

## Firestore Storage

Written to `projects/{id}/outputs/linkedin`.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Synthesize]]
- UI: [[Wiki/Components/Component - LinkedInPreview]]
