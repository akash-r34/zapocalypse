import { z } from "zod";

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
