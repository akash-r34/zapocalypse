import { z } from "zod";

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
  voice: z.string(),
  style: z.string(),
  vocabulary_level: z.string(),
  preferred_structures: z.array(z.string()),
  avoid: z.array(z.string()),
}).merge(AdditiveFingerprintSchema);

export const SKOSchema = z.object({
  core_thesis: z.string(),
  audience_persona: AudiencePersonaSchema,
  viral_hooks: z.array(z.string()).min(3).max(10),
  semantic_chunks: z.array(SemanticChunkSchema).min(1),
  brand_tone_fingerprint: BrandToneFingerprintSchema,
});

export type SKO = z.infer<typeof SKOSchema>;
