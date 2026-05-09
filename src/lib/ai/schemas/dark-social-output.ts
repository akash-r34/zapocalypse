import { z } from "zod";

export const DarkSocialSnippetSchema = z.object({
  slack_message: z.object({
    hook: z.string().max(300),
    body: z.string().max(1500),
    emoji_prefix: z.string(),
  }),
  discord_message: z.object({
    hook: z.string().max(300),
    body: z.string().max(1500),
    embed_title: z.string().optional(),
  }),
  shareable_quote: z.string().max(500),
  context_line: z.string().max(300),
});

export type DarkSocialSnippet = z.infer<typeof DarkSocialSnippetSchema>;
