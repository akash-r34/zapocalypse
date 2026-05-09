/* eslint-disable @typescript-eslint/no-unused-vars */
import { vi } from "vitest";
import type { z } from "zod";
import sampleIngested from "@/src/__fixtures__/sample-ingested.json";
import sampleSKO from "@/src/__fixtures__/sample-sko.json";
import { IngestedContentSchema } from "@/src/lib/ai/schemas/ingested-content";
import { SKOSchema } from "@/src/lib/ai/schemas/sko";

// Auto-mock: resolves with fixture data matching the requested schema
export const generateStructured = vi.fn(async <T extends z.ZodTypeAny>(_: {
  prompt: string;
  schema: T;
  projectId?: string;
  agentName?: string;
}): Promise<z.infer<T>> => {
  // Detect which schema is being requested by checking its shape
  try {
    return IngestedContentSchema.parse(sampleIngested) as z.infer<T>;
  } catch {
    // not an IngestedContent schema
  }

  try {
    return SKOSchema.parse(sampleSKO) as z.infer<T>;
  } catch {
    // not a SKO schema
  }

  // Fallback: return raw fixture as-is (for output schemas)
  return sampleSKO as unknown as z.infer<T>;
});
