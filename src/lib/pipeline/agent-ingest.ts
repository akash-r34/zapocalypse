import { generateStructured } from "@/src/lib/ai/gemini-client";
import { IngestedContentSchema, type IngestedContent } from "@/src/lib/ai/schemas/ingested-content";
import { buildIngestPrompt } from "@/src/lib/ai/prompts/ingest";
import { extractFromUrl } from "./url-extractor";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

interface IngestInput {
  projectId: string;
  mode: "url" | "text" | "file";
  value: string; // URL string, text content, or file content as text
}

export async function runIngestionAgent(input: IngestInput): Promise<IngestedContent> {
  const { projectId, mode, value } = input;
  const start = Date.now();

  pipelineLogger.info({ projectId, agent: "ingest", status: "starting", message: "Agent 1 starting" });

  await checkBudget();

  let rawInput: string;

  if (mode === "url") {
    pipelineLogger.info({ projectId, agent: "ingest", message: "Fetching URL content" });
    const extracted = await extractFromUrl(value);
    rawInput = `Title: ${extracted.title}\n\n${extracted.content}`;
  } else {
    rawInput = value;
  }

  const prompt = buildIngestPrompt(mode, rawInput);

  const result = await generateStructured({
    prompt,
    schema: IngestedContentSchema,
    projectId,
    agentName: "ingest",
  });

  pipelineLogger.info({
    projectId,
    agent: "ingest",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Agent 1 complete — ${result.metadata.wordCount} words ingested`,
  });

  return result;
}
