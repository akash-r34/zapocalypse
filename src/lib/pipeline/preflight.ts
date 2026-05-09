import { z } from "zod";
import { generateStructured } from "@/src/lib/ai/gemini-client";
import { checkBudget } from "@/src/lib/budget/tracker";
import { BudgetExceededError } from "@/src/types/budget";
import { pipelineLogger } from "./logger";

export class PreflightError extends Error {
  constructor(reason?: string) {
    super(reason ?? "Content rejected by pre-flight validation");
    this.name = "PreflightError";
  }
}

const PreflightResultSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional(),
});

const PREFLIGHT_MODEL = "gemini-2.5-flash";
// Only run preflight for heavy inputs — not worth the cost for short text
const PREFLIGHT_MIN_LENGTH = 5000;
// Sample 1500 chars from each of: start, middle, end
const SAMPLE_SIZE = 1500;

function sampleContent(content: string): string {
  if (content.length <= SAMPLE_SIZE * 3) return content;
  const mid = Math.floor(content.length / 2);
  const start = content.slice(0, SAMPLE_SIZE);
  const middle = content.slice(mid - SAMPLE_SIZE / 2, mid + SAMPLE_SIZE / 2);
  const end = content.slice(-SAMPLE_SIZE);
  return `[START]\n${start}\n\n[MIDDLE]\n${middle}\n\n[END]\n${end}`;
}

/**
 * Lightweight pre-flight validation before expensive extraction.
 * Skipped for short inputs (<5000 chars). Fault-tolerant: if the API call
 * itself fails, logs a warning and lets the pipeline continue.
 * Throws PreflightError if content is invalid.
 * Throws BudgetExceededError if budget is exceeded (propagated to stop the pipeline).
 */
export async function runPreflightCheck(rawContent: string, projectId: string): Promise<void> {
  if (rawContent.length < PREFLIGHT_MIN_LENGTH) return;

  await checkBudget();

  const sample = sampleContent(rawContent);

  const prompt = `You are a content validator. Analyze the following content sample and determine if it is valid for AI processing.

Set valid=false ONLY if the content:
- Is clearly not human-generated dialogue or writing (e.g., binary data, corrupted text, pure code with no explanation)
- Contains no substantive information (e.g., blank pages, repeated filler text, single repeated character)
- Is a silent screen recording transcript with no speech or narration

Set valid=true for any real article, blog post, podcast transcript, video transcript, presentation, document, or essay — even if technical or niche.

Content sample:
${sample}`;

  try {
    const result = await generateStructured({
      prompt,
      schema: PreflightResultSchema,
      projectId,
      agentName: "preflight",
      model: PREFLIGHT_MODEL,
    });

    if (!result.valid) {
      pipelineLogger.warn({
        projectId,
        agent: "preflight",
        message: "Pre-flight validation rejected content",
        reason: result.reason,
      });
      throw new PreflightError(result.reason);
    }

    pipelineLogger.info({ projectId, agent: "preflight", message: "Pre-flight check passed" });
  } catch (err) {
    if (err instanceof PreflightError) throw err;
    if (err instanceof BudgetExceededError) throw err;

    // API failure — log and let pipeline continue (fault-tolerant)
    pipelineLogger.warn({
      projectId,
      agent: "preflight",
      message: "Pre-flight check encountered API error — allowing pipeline to continue",
      error: (err as Error).message,
    });
  }
}
