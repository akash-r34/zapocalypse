import { generateStructured } from "@/src/lib/ai/gemini-client";
import { AdditiveFingerprintSchema } from "@/src/lib/ai/schemas/sko";
import { buildRefineTonePrompt } from "@/src/lib/ai/prompts/refine-tone";
import type { AdditiveFingerprint } from "@/src/types/project";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

export async function runRefineToneAgent(
  projectId: string,
  originalFingerprint: AdditiveFingerprint,
  feedback: string,
  platform: string,
  regenPlatform?: string
): Promise<AdditiveFingerprint> {
  const start = Date.now();

  pipelineLogger.info({
    projectId,
    agent: "refine_tone",
    status: "starting",
    message: `Refining brand tone for ${platform} based on user feedback`,
  });

  await checkBudget();

  const refinedFingerprint = await generateStructured({
    prompt: buildRefineTonePrompt(originalFingerprint, feedback, platform),
    schema: AdditiveFingerprintSchema,
    projectId,
    agentName: "refine_tone",
    regenPlatform,
  });

  pipelineLogger.info({
    projectId,
    agent: "refine_tone",
    status: "complete",
    durationMs: Date.now() - start,
    message: "Tone refinement complete",
  });

  return refinedFingerprint;
}
