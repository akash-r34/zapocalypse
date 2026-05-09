---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/sko.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
related:
  - "[[Wiki/Architecture/Hub and Spoke via SKO]]"
  - "[[Wiki/Pipeline/Agent - Extract]]"
  - "[[Wiki/Concepts/Additive Tone Fingerprinting]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - SKO

> The Structured Knowledge Object schema — the central hub artifact produced by the extraction agent and consumed by all synthesis agents.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/sko.ts

const SemanticChunkSchema = z.object({
  id: z.string(),
  heading: z.string(),
  key_insight: z.string(),
  supporting_data: z.string().nullable(),
  emotional_valence: z.string(),
  relevance_score: z.number().min(0).max(1),
});

const AudiencePersonaSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  pain_points: z.array(z.string()),
  desired_outcomes: z.array(z.string()),
});

export const AdditiveFingerprintSchema = z.object({
  analogy_style: z.string().optional(),
  sentence_cadence: z.enum(["low", "medium", "high"]).optional(),
  signature_phrases: z.array(z.string()).optional(),
  storytelling_structure: z.string().optional(),
  humor_type: z.string().optional(),
  colloquialisms: z.array(z.string()).optional(),
  explanation_pattern: z.string().optional(),
});

export const BrandToneFingerprintSchema = z.object({
  // Subtractive (always present)
  voice: z.string(),
  style: z.string(),
  vocabulary_level: z.string(),
  preferred_structures: z.array(z.string()),
  avoid: z.array(z.string()),
}).merge(AdditiveFingerprintSchema);  // adds all additive fields as optional

export const SKOSchema = z.object({
  core_thesis: z.string(),
  audience_persona: AudiencePersonaSchema,
  viral_hooks: z.array(z.string()).min(3).max(10),
  semantic_chunks: z.array(SemanticChunkSchema).min(1),
  brand_tone_fingerprint: BrandToneFingerprintSchema,
});

export type SKO = z.infer<typeof SKOSchema>;
```

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `core_thesis` | `string` | 3-5 sentence thesis of the source content |
| `audience_persona.primary` | `string` | Primary target audience description |
| `audience_persona.secondary` | `string` | Secondary target audience description |
| `audience_persona.pain_points` | `string[]` | What the audience struggles with |
| `audience_persona.desired_outcomes` | `string[]` | What the audience wants to achieve |
| `viral_hooks` | `string[]` (3-10) | Candidate hook phrases for platform content |
| `semantic_chunks[].id` | `string` | Unique identifier for this chunk |
| `semantic_chunks[].heading` | `string` | Section heading |
| `semantic_chunks[].key_insight` | `string` | The core insight from this section |
| `semantic_chunks[].supporting_data` | `string \| null` | Evidence or data points |
| `semantic_chunks[].emotional_valence` | `string` | Emotional tone (e.g., "urgent", "inspiring") |
| `semantic_chunks[].relevance_score` | `number` (0-1) | How relevant to the audience persona |

## Brand Tone Fingerprint Fields

### Subtractive (always present — constrains output)
| Field | Type | Purpose |
|-------|------|---------|
| `voice` | `string` | Overall voice characterization |
| `style` | `string` | Writing style description |
| `vocabulary_level` | `string` | e.g., "technical", "conversational" |
| `preferred_structures` | `string[]` | Sentence/paragraph patterns to use |
| `avoid` | `string[]` | AI slop phrases, clichés to eliminate |

### Additive (all optional — cultivated via tone refinement)
| Field | Type | Purpose |
|-------|------|---------|
| `analogy_style` | `string?` | e.g., "mechanical metaphors" |
| `sentence_cadence` | `"low"\|"medium"\|"high"?` | Rhythm preference |
| `signature_phrases` | `string[]?` | Distinctive phrases this creator uses |
| `storytelling_structure` | `string?` | e.g., "opens with anecdote, pivots to data" |
| `humor_type` | `string?` | e.g., "dry self-deprecation" |
| `colloquialisms` | `string[]?` | Regional/niche language |
| `explanation_pattern` | `string?` | How they explain complex ideas |

## Exported Types

```typescript
export type SKO = z.infer<typeof SKOSchema>;
// Also exported: AdditiveFingerprintSchema, BrandToneFingerprintSchema (used by agent-refine-tone.ts)
```

## Firestore Storage

Written to `projects/{id}/sko/current` as a flat document + `savedAt` timestamp. Read back by `readSKO(projectId)` in selective regeneration.

## Cross-References

- Architectural pattern: [[Wiki/Architecture/Hub and Spoke via SKO]]
- Produced by: [[Wiki/Pipeline/Agent - Extract]]
- Consumed by: [[Wiki/Pipeline/Agent - Synthesize]], [[Wiki/Pipeline/Agent - Hook Scorer]], [[Wiki/Pipeline/Agent - Authenticator]]
- Tone refinement: [[Wiki/Concepts/Additive Tone Fingerprinting]]
- TypeScript type: `src/types/project.ts` for `AdditiveFingerprint`
