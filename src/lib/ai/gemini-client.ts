import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { z } from "zod";
import { BudgetExceededError } from "@/src/types/budget";
import { checkBudget, recordCost } from "@/src/lib/budget/tracker";

// Singleton — module-level, created once
let _client: GoogleGenAI | null = null;

const DEFAULT_LOCATION = "us-central1";

function getClient(): GoogleGenAI {
  if (!_client) {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? DEFAULT_LOCATION;

    if (!project) {
      throw new Error(
        "GOOGLE_CLOUD_PROJECT env var is required for Vertex AI mode"
      );
    }

    _client = new GoogleGenAI({ vertexai: true, project, location });
  }
  return _client;
}

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

const RETRY_DELAYS_MS = [1000, 2000, 4000];

interface GenerateOptions<T extends z.ZodTypeAny> {
  prompt: string;
  schema: T;
  projectId?: string;
  agentName?: string;
  model?: string;
  /** When set, tags the cost_log entry as belonging to a selective regen cascade for this platform. */
  regenPlatform?: string;
}

export async function generateStructured<T extends z.ZodTypeAny>(
  options: GenerateOptions<T>
): Promise<z.infer<T>> {
  const { prompt, schema, projectId, agentName, model: modelOverride, regenPlatform } = options;
  const effectiveModel = modelOverride ?? MODEL;

  // Zod v4 native JSON Schema export
  const jsonSchema = z.toJSONSchema(schema);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await callGemini(prompt, jsonSchema, effectiveModel);

      // text is a getter (not a method) in @google/genai
      const text = response.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      // Capture usage immediately — tokens are consumed regardless of whether the output validates
      const usage = response.usageMetadata;

      let validated: z.infer<T>;
      try {
        const parsed = JSON.parse(text) as unknown;
        validated = schema.parse(parsed) as z.infer<T>;
      } catch (validationErr) {
        // Record cost best-effort: the API call succeeded and tokens were consumed even though
        // the output couldn't be used. This ensures failed synthesis attempts appear in cost_log
        // so they can be refunded and shown struck-through in the pipeline cost breakdown.
        if (usage && projectId) {
          recordCost({
            projectId,
            agentName: agentName ?? "unknown",
            model: effectiveModel,
            promptTokens: usage.promptTokenCount ?? 0,
            outputTokens: usage.candidatesTokenCount ?? 0,
            regenPlatform,
          }).catch(() => {});
        }
        throw validationErr;
      }

      // Track cost after successful validation
      if (usage && projectId) {
        await recordCost({
          projectId,
          agentName: agentName ?? "unknown",
          model: effectiveModel,
          promptTokens: usage.promptTokenCount ?? 0,
          outputTokens: usage.candidatesTokenCount ?? 0,
          regenPlatform,
        });
      }

      return validated;
    } catch (err) {
      const error = err as Error;

      // Never retry budget errors or validation errors
      if (error instanceof BudgetExceededError) throw error;
      if (error.name === "ZodError") throw error;

      // Only retry on rate limit (429)
      const isRateLimit =
        error.message.includes("429") ||
        error.message.toLowerCase().includes("quota") ||
        error.message.toLowerCase().includes("rate limit");

      if (!isRateLimit || attempt === RETRY_DELAYS_MS.length) {
        lastError = error;
        break;
      }

      const delay = RETRY_DELAYS_MS[attempt];
      await sleep(delay);
      lastError = error;
    }
  }

  throw lastError ?? new Error("generateStructured failed for unknown reason");
}

async function callGemini(
  prompt: string,
  responseSchema: unknown,
  model: string = MODEL
): Promise<GenerateContentResponse> {
  const client = getClient();

  return client.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as Record<string, unknown>,
    },
  });
}

interface GenerateTextOptions {
  prompt: string;
  projectId?: string;
  agentName?: string;
  model?: string;
}

/**
 * Generate unstructured text from Gemini.
 * Includes budget check, retry logic, and cost tracking — same guarantees as generateStructured.
 */
export async function generateText(options: GenerateTextOptions): Promise<string> {
  const { prompt, projectId, agentName, model: modelOverride } = options;
  const effectiveModel = modelOverride ?? MODEL;

  // Belt-and-suspenders: always check budget before calling the API
  await checkBudget();

  const client = getClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: effectiveModel,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");

      const usage = response.usageMetadata;
      if (usage && projectId) {
        await recordCost({
          projectId,
          agentName: agentName ?? "unknown",
          model: effectiveModel,
          promptTokens: usage.promptTokenCount ?? 0,
          outputTokens: usage.candidatesTokenCount ?? 0,
        });
      }

      return text;
    } catch (err) {
      const error = err as Error;

      if (error instanceof BudgetExceededError) throw error;

      const isRateLimit =
        error.message.includes("429") ||
        error.message.toLowerCase().includes("quota") ||
        error.message.toLowerCase().includes("rate limit");

      if (!isRateLimit || attempt === RETRY_DELAYS_MS.length) {
        lastError = error;
        break;
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
      lastError = error;
    }
  }

  throw lastError ?? new Error("generateText failed for unknown reason");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
