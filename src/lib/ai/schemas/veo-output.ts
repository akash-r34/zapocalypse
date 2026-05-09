import { z } from "zod";

export const VeoScriptSchema = z.object({
  title: z.string(),
  hook_seconds: z.number().int().positive(),
  scenes: z.array(
    z.object({
      scene_number: z.number().int().positive(),
      duration_seconds: z.number().int().positive(),
      visual_description: z.string(),
      voiceover: z.string(),
      on_screen_text: z.string().optional(),
    })
  ).min(3),
  total_duration_seconds: z.number().int().positive(),
  aspect_ratio: z.enum(["9:16", "16:9", "1:1"]),
  style_notes: z.string(),
});

export const VeoOutputSchema = z.object({
  script: VeoScriptSchema,
  platform_note: z.string(),
});

export type VeoScript = z.infer<typeof VeoScriptSchema>;
export type VeoOutput = z.infer<typeof VeoOutputSchema>;
