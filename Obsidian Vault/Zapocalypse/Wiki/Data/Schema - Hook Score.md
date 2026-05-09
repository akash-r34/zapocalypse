---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/hook-score.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
related:
  - "[[Wiki/Pipeline/Agent - Hook Scorer]]"
  - "[[Wiki/Components/Component - HookLeaderboard]]"
  - "[[Wiki/Components/Component - Scoring UI]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Hook Score

> Output schema of Agent 3.5 (Hook Scorer). Scores all hooks across all platforms on 4 dimensions.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/hook-score.ts

const HookDimensionScoresSchema = z.object({
  novelty: z.number().min(0).max(1),
  emotional_resonance: z.number().min(0).max(1),
  niche_relevance: z.number().min(0).max(1),
  shareability: z.number().min(0).max(1),
});

const HookVariantSchema = z.object({
  text: z.string(),
  rationale: z.string(),
});

const ScoredHookSchema = z.object({
  hook_id: z.string(),
  platform: z.enum(["twitter", "linkedin", "newsletter", "dark_social"]),
  original_text: z.string(),
  scores: HookDimensionScoresSchema,
  composite_score: z.number().min(0).max(1),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  reasoning: z.string(),
  ab_variants: z.array(HookVariantSchema).max(2).optional(),
});

export const HookScoreResultSchema = z.object({
  hooks: z.array(ScoredHookSchema).min(1),
  top_hook_id: z.string(),
  audience_persona_used: z.string(),  // documents which persona anchored scoring
  scoring_methodology: z.string(),
});

export type HookDimensionScores = z.infer<typeof HookDimensionScoresSchema>;
export type HookVariant = z.infer<typeof HookVariantSchema>;
export type ScoredHook = z.infer<typeof ScoredHookSchema>;
export type HookScoreResult = z.infer<typeof HookScoreResultSchema>;
```

## Dimension Scores

All 4 dimensions are 0-1 floats. `composite_score` is derived from these.

| Dimension | Measures |
|-----------|---------|
| `novelty` | How surprising or non-obvious the claim is |
| `emotional_resonance` | Curiosity, urgency, desire, or FOMO evoked |
| `niche_relevance` | Fit with the SKO's audience persona |
| `shareability` | Viral potential, clear value proposition |

## A/B Variants

`ab_variants` (max 2) are only generated for hooks with `composite_score >= 0.70`. Each variant includes a `rationale` explaining what was changed and why.

## Platforms Covered

Note: `veo` is NOT in the platform enum — Veo scripts don't have discrete hooks in the scoring model.

## Firestore Storage

Written to `projects/{id}/hook_scores/current`.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Hook Scorer]]
- UI: [[Wiki/Components/Component - HookLeaderboard]], [[Wiki/Components/Component - Scoring UI]] (`HookScoreBadge`)
- Hook subscription: [[Wiki/Hooks/Hook - useHookScores]]
