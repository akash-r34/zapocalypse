import { z } from "zod";

export const IngestedContentSchema = z.object({
  sourceType: z.enum(["url", "text", "file"]),
  title: z.string(),
  rawContent: z.string(),
  contentSections: z.array(
    z.object({
      heading: z.string(),
      body: z.string(),
    })
  ),
  metadata: z.object({
    author: z.string().nullable(),
    publishDate: z.string().nullable(),
    wordCount: z.number().int().nonnegative(),
  }),
});

export type IngestedContent = z.infer<typeof IngestedContentSchema>;
