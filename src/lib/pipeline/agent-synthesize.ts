import { generateStructured } from "@/src/lib/ai/gemini-client";
import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { InformationGainScore } from "@/src/lib/ai/schemas/information-gain";
import { TwitterOutputSchema, type TwitterOutput } from "@/src/lib/ai/schemas/twitter-output";
import { LinkedInOutputSchema, type LinkedInOutput } from "@/src/lib/ai/schemas/linkedin-output";
import { NewsletterOutputSchema, type NewsletterOutput } from "@/src/lib/ai/schemas/newsletter-output";
import { VeoOutputSchema, type VeoOutput } from "@/src/lib/ai/schemas/veo-output";
import { DarkSocialSnippetSchema, type DarkSocialSnippet } from "@/src/lib/ai/schemas/dark-social-output";
import {
  buildTwitterPrompt,
  buildLinkedInPrompt,
  buildNewsletterPrompt,
  buildVeoPrompt,
  buildDarkSocialPrompt,
} from "@/src/lib/ai/prompts/synthesize";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

export interface SynthesisOutputs {
  twitter: TwitterOutput | null;
  linkedin: LinkedInOutput | null;
  newsletter: NewsletterOutput | null;
  veo: VeoOutput | null;
  dark_social: DarkSocialSnippet | null;
  errors: Record<string, string>;
}

export async function runSynthesisAgent(
  projectId: string,
  sko: SKO,
  analysisScore?: InformationGainScore
): Promise<SynthesisOutputs> {
  const start = Date.now();

  pipelineLogger.info({ projectId, agent: "synthesize", status: "starting", message: "Agent 3 starting (5 parallel outputs)" });

  await checkBudget();

  const [twitterResult, linkedinResult, newsletterResult, veoResult, darkSocialResult] =
    await Promise.allSettled([
      generateStructured({ prompt: buildTwitterPrompt(sko, analysisScore), schema: TwitterOutputSchema, projectId, agentName: "synthesize_twitter" }),
      generateStructured({ prompt: buildLinkedInPrompt(sko, analysisScore), schema: LinkedInOutputSchema, projectId, agentName: "synthesize_linkedin" }),
      generateStructured({ prompt: buildNewsletterPrompt(sko, analysisScore), schema: NewsletterOutputSchema, projectId, agentName: "synthesize_newsletter" }),
      generateStructured({ prompt: buildVeoPrompt(sko), schema: VeoOutputSchema, projectId, agentName: "synthesize_veo" }),
      generateStructured({ prompt: buildDarkSocialPrompt(sko), schema: DarkSocialSnippetSchema, projectId, agentName: "synthesize_dark_social" }),
    ]);

  const outputs: SynthesisOutputs = {
    twitter: twitterResult.status === "fulfilled" ? twitterResult.value : null,
    linkedin: linkedinResult.status === "fulfilled" ? linkedinResult.value : null,
    newsletter: newsletterResult.status === "fulfilled" ? newsletterResult.value : null,
    veo: veoResult.status === "fulfilled" ? veoResult.value : null,
    dark_social: darkSocialResult.status === "fulfilled" ? darkSocialResult.value : null,
    errors: {},
  };

  const platforms = ["twitter", "linkedin", "newsletter", "veo", "dark_social"] as const;
  const results = [twitterResult, linkedinResult, newsletterResult, veoResult, darkSocialResult];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "rejected") {
      const platform = platforms[i];
      outputs.errors[platform] = r.reason instanceof Error ? r.reason.message : String(r.reason);
      pipelineLogger.error({
        projectId,
        agent: `synthesize_${platform}`,
        message: `Failed to generate ${platform} output`,
        error: outputs.errors[platform],
      });
    }
  }

  const successCount = platforms.filter((p) => outputs[p] !== null).length;

  pipelineLogger.info({
    projectId,
    agent: "synthesize",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Agent 3 complete — ${successCount}/5 outputs generated`,
  });

  return outputs;
}
