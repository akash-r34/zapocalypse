import { generateStructured } from "@/src/lib/ai/gemini-client";
import { InformationGainScoreSchema, type InformationGainScore } from "@/src/lib/ai/schemas/information-gain";
import type { IngestedContent } from "@/src/lib/ai/schemas/ingested-content";
import { buildAnalyzePrompt } from "@/src/lib/ai/prompts/analyze";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

export async function runAnalysisAgent(
  projectId: string,
  ingested: IngestedContent
): Promise<InformationGainScore> {
  const start = Date.now();

  pipelineLogger.info({ projectId, agent: "analyze", status: "starting", message: "Analyst Agent starting — scoring originality" });

  await checkBudget();

  const prompt = buildAnalyzePrompt(ingested);

  const result = await generateStructured({
    prompt,
    schema: InformationGainScoreSchema,
    projectId,
    agentName: "analyze",
  });

  pipelineLogger.info({
    projectId,
    agent: "analyze",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Analyst complete — grade ${result.grade} (${result.overall_score.toFixed(1)}/10), classification: ${result.content_classification}`,
  });

  return result;
}
