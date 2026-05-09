import { generateStructured } from "@/src/lib/ai/gemini-client";
import { HookScoreResultSchema, type HookScoreResult } from "@/src/lib/ai/schemas/hook-score";
import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { SynthesisOutputs } from "./agent-synthesize";
import { buildScoreHooksPrompt } from "@/src/lib/ai/prompts/score-hooks";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

export async function runHookScoringAgent(
  projectId: string,
  sko: SKO,
  outputs: SynthesisOutputs,
  regenPlatform?: string
): Promise<HookScoreResult> {
  const start = Date.now();

  pipelineLogger.info({
    projectId,
    agent: "score_hooks",
    status: "starting",
    message: "Hook Scoring Agent starting — scoring virality across all platforms",
  });

  await checkBudget();

  const prompt = buildScoreHooksPrompt(sko, outputs);

  const result = await generateStructured({
    prompt,
    schema: HookScoreResultSchema,
    projectId,
    agentName: "score_hooks",
    regenPlatform,
  });

  const topHook = result.hooks.find((h) => h.hook_id === result.top_hook_id);
  const abCount = result.hooks.filter((h) => h.ab_variants && h.ab_variants.length > 0).length;

  pipelineLogger.info({
    projectId,
    agent: "score_hooks",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Hook Scorer complete — ${result.hooks.length} hooks scored, top: [${result.top_hook_id}] grade ${topHook?.grade ?? "?"} (${((topHook?.composite_score ?? 0) * 100).toFixed(0)}%), ${abCount} with A/B variants`,
  });

  return result;
}
