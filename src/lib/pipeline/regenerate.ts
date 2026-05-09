import { z } from "zod";
import { generateStructured } from "@/src/lib/ai/gemini-client";
import { readSKO, writeToneRefinement, writeRegeneratedOutput, updateRegenerationStatus, updateToneCheckForPlatform, writeHookScores, writeC2PAManifest, readAllPlatformOutputs } from "@/src/lib/firestore/helpers";
import { runRefineToneAgent } from "./agent-refine-tone";
import { runToneCheckForPlatform } from "./agent-authenticate";
import { runHookScoringAgent } from "./agent-score-hooks";
import { generateC2PAManifest } from "./c2pa-generator";
import {
  buildTwitterPrompt,
  buildLinkedInPrompt,
  buildNewsletterPrompt,
  buildVeoPrompt,
  buildDarkSocialPrompt,
} from "@/src/lib/ai/prompts/synthesize";
import { TwitterOutputSchema } from "@/src/lib/ai/schemas/twitter-output";
import { LinkedInOutputSchema } from "@/src/lib/ai/schemas/linkedin-output";
import { NewsletterOutputSchema } from "@/src/lib/ai/schemas/newsletter-output";
import { VeoOutputSchema } from "@/src/lib/ai/schemas/veo-output";
import { DarkSocialSnippetSchema } from "@/src/lib/ai/schemas/dark-social-output";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";
import { processRegenRefund } from "@/src/lib/budget/refund";
import type { AdditiveFingerprint } from "@/src/types/project";
import type { SynthesisOutputs } from "./agent-synthesize";

export type SupportedPlatform = "twitter" | "linkedin" | "newsletter" | "veo" | "dark_social";

export async function runSelectiveRegeneration(
  projectId: string,
  platform: SupportedPlatform,
  feedback: string,
  retryOnly = false
): Promise<unknown> {
  const start = Date.now();
  // Record wall-clock time before any Gemini calls so processRegenRefund can
  // identify cost_log entries that belong to this specific attempt.
  const regenStartTimeMs = Date.now();

  try {
  await updateRegenerationStatus(projectId, platform, "processing", undefined, undefined, retryOnly ? "retry" : "refine");

  pipelineLogger.info({
    projectId,
    agent: "regenerate",
    status: "starting",
    message: retryOnly
      ? `Retry synthesis starting for ${platform}`
      : `Selective regeneration starting for ${platform}`,
  });

  // 1. Read SKO from Firestore
  const sko = await readSKO(projectId);
  if (!sko) {
    throw new Error(`SKO not found for project ${projectId}`);
  }

  // 2. Extract original fingerprint
  const originalFingerprint: AdditiveFingerprint = {
    analogy_style: sko.brand_tone_fingerprint.analogy_style,
    sentence_cadence: sko.brand_tone_fingerprint.sentence_cadence,
    signature_phrases: sko.brand_tone_fingerprint.signature_phrases,
    storytelling_structure: sko.brand_tone_fingerprint.storytelling_structure,
    humor_type: sko.brand_tone_fingerprint.humor_type,
    colloquialisms: sko.brand_tone_fingerprint.colloquialisms,
    explanation_pattern: sko.brand_tone_fingerprint.explanation_pattern,
  };

  // 3. Refine tone fingerprint (skipped in retry mode — just re-synthesise with original)
  let refinedAdditive: AdditiveFingerprint = originalFingerprint;

  if (!retryOnly && feedback) {
    refinedAdditive = await runRefineToneAgent(
      projectId,
      originalFingerprint,
      feedback,
      platform,
      platform  // regenPlatform — tags refine_tone cost_log entry to this platform's regen group
    );

    await writeToneRefinement(projectId, {
      platform,
      feedback,
      original_fingerprint: originalFingerprint,
      refined_fingerprint: refinedAdditive,
    });
  }

  // 4. Budget check
  await checkBudget();

  // 5. Build prompt & schema
  let prompt: string;
  let schema: z.ZodTypeAny;

  switch (platform) {
    case "twitter":
      prompt = buildTwitterPrompt(sko, undefined, refinedAdditive);
      schema = TwitterOutputSchema;
      break;
    case "linkedin":
      prompt = buildLinkedInPrompt(sko, undefined, refinedAdditive);
      schema = LinkedInOutputSchema;
      break;
    case "newsletter":
      prompt = buildNewsletterPrompt(sko, undefined, refinedAdditive);
      schema = NewsletterOutputSchema;
      break;
    case "veo":
      prompt = buildVeoPrompt(sko, refinedAdditive);
      schema = VeoOutputSchema;
      break;
    case "dark_social":
      prompt = buildDarkSocialPrompt(sko, refinedAdditive);
      schema = DarkSocialSnippetSchema;
      break;
    default:
      throw new Error(`Unsupported platform for regeneration: ${platform}`);
  }

  // 6. Generate New Output
  const regeneratedOutput = await generateStructured({
    prompt,
    schema,
    projectId,
    agentName: `regenerate_${platform}`,
    regenPlatform: platform,
  });

  // 7. Write Result and mark complete — done BEFORE cascade so the UI shows the output immediately
  await writeRegeneratedOutput(projectId, platform, regeneratedOutput);
  await updateRegenerationStatus(projectId, platform, "complete");

  pipelineLogger.info({
    projectId,
    agent: "regenerate",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Selective regeneration complete for ${platform}`,
  });

  // 8. Post-regen cascade: tone check, hook scores, C2PA — fire-and-forget so the UI isn't blocked
  void Promise.allSettled([
    // 8a. Tone check for this platform
    (async () => {
      const { platformResult, slopFlags } = await runToneCheckForPlatform(
        projectId, sko, platform, regeneratedOutput, platform
      );
      await updateToneCheckForPlatform(projectId, platform, platformResult, slopFlags);
    })().catch((err) => {
      pipelineLogger.warn({ projectId, agent: "authenticate",
        message: `Post-regen tone check failed for ${platform} (non-fatal): ${(err as Error).message}` });
    }),

    // 8b. Re-score hooks using all current outputs (replaces this platform's output)
    (async () => {
      const allOutputs = await readAllPlatformOutputs(projectId);
      allOutputs[platform] = regeneratedOutput;
      const synthesisOutputs: SynthesisOutputs = {
        twitter: (allOutputs["twitter"] ?? null) as SynthesisOutputs["twitter"],
        linkedin: (allOutputs["linkedin"] ?? null) as SynthesisOutputs["linkedin"],
        newsletter: (allOutputs["newsletter"] ?? null) as SynthesisOutputs["newsletter"],
        veo: (allOutputs["veo"] ?? null) as SynthesisOutputs["veo"],
        dark_social: (allOutputs["dark_social"] ?? null) as SynthesisOutputs["dark_social"],
        errors: {},
      };
      const hookScores = await runHookScoringAgent(projectId, sko, synthesisOutputs, platform);
      await writeHookScores(projectId, hookScores);
    })().catch((err) => {
      pipelineLogger.warn({ projectId, agent: "score_hooks",
        message: `Post-regen hook scoring failed for ${platform} (non-fatal): ${(err as Error).message}` });
    }),

    // 8c. Refresh C2PA manifest for this platform
    (async () => {
      const manifest = await generateC2PAManifest(platform, regeneratedOutput);
      await writeC2PAManifest(projectId, platform, manifest);
    })().catch((err) => {
      pipelineLogger.warn({ projectId, agent: "c2pa",
        message: `Post-regen C2PA refresh failed for ${platform} (non-fatal): ${(err as Error).message}` });
    }),
  ]);

  return regeneratedOutput;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Regeneration failed";
    pipelineLogger.error({
      projectId,
      agent: "regenerate",
      status: "error",
      message: `Selective regeneration failed for ${platform}: ${message}`,
    });
    // Refund any Gemini costs incurred during this failed attempt.
    const refundedAmount = await processRegenRefund(projectId, platform, regenStartTimeMs);
    await updateRegenerationStatus(projectId, platform, "error", message, refundedAmount).catch(() => {});
    throw err;
  }
}
