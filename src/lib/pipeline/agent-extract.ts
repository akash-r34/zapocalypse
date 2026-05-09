import { generateStructured } from "@/src/lib/ai/gemini-client";
import { SKOSchema, type SKO } from "@/src/lib/ai/schemas/sko";
import type { IngestedContent } from "@/src/lib/ai/schemas/ingested-content";
import type { InformationGainScore } from "@/src/lib/ai/schemas/information-gain";
import { buildExtractPrompt } from "@/src/lib/ai/prompts/extract";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

export async function runExtractionAgent(
  projectId: string,
  ingested: IngestedContent,
  analysisScore?: InformationGainScore
): Promise<SKO> {
  const start = Date.now();

  pipelineLogger.info({ projectId, agent: "extract", status: "starting", message: "Agent 2 starting" });

  await checkBudget();

  const prompt = buildExtractPrompt(ingested, analysisScore);

  const result = await generateStructured({
    prompt,
    schema: SKOSchema,
    projectId,
    agentName: "extract",
  });

  pipelineLogger.info({
    projectId,
    agent: "extract",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Agent 2 complete — ${result.semantic_chunks.length} chunks, ${result.viral_hooks.length} hooks`,
  });

  return result;
}
