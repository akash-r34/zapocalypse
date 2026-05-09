import { z } from "zod";

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
  audience_persona_used: z.string(),
  scoring_methodology: z.string(),
});

export type HookDimensionScores = z.infer<typeof HookDimensionScoresSchema>;
export type HookVariant = z.infer<typeof HookVariantSchema>;
export type ScoredHook = z.infer<typeof ScoredHookSchema>;
export type HookScoreResult = z.infer<typeof HookScoreResultSchema>;
