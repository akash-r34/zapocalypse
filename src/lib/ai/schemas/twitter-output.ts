import { z } from "zod";

export const TweetSchema = z.object({
  text: z.string().max(280),
  hook: z.string(),
  type: z.enum(["hook", "insight", "data", "cta", "bridge", "contrarian"]),
  answer_block: z.string().max(500).optional(),
});

export const TwitterOutputSchema = z.object({
  tweets: z.array(TweetSchema).min(1).max(15),
  thread_narrative: z.string(),
});

export type Tweet = z.infer<typeof TweetSchema>;
export type TwitterOutput = z.infer<typeof TwitterOutputSchema>;
