import { z } from "zod";

const PlatformToneResultSchema = z.object({
  match_score: z.number().min(0).max(1),
  deviations: z.array(z.string()),
  suggested_fixes: z.array(z.string()),
});

const AISlopFlagSchema = z.object({
  platform: z.string(),
  item_index: z.number().int(),
  pattern: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  suggestion: z.string(),
});

export const ToneCheckResultSchema = z.object({
  overall_match_score: z.number().min(0).max(1),
  per_platform: z.record(z.string(), PlatformToneResultSchema),
  ai_slop_flags: z.array(AISlopFlagSchema),
  passed: z.boolean(),
});

export type ToneCheckResult = z.infer<typeof ToneCheckResultSchema>;
export type AISlopFlag = z.infer<typeof AISlopFlagSchema>;
