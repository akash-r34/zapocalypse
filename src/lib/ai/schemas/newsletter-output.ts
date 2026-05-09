import { z } from "zod";

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
