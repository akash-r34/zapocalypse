import { generateStructured } from "@/src/lib/ai/gemini-client";
import { ToneCheckResultSchema, type ToneCheckResult, type AISlopFlag } from "@/src/lib/ai/schemas/tone-check";
import type { C2PAManifest } from "@/src/lib/ai/schemas/c2pa-manifest";
import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { SynthesisOutputs } from "./agent-synthesize";
import { buildToneCheckPrompt } from "@/src/lib/ai/prompts/authenticate";
import { generateAllC2PAManifests } from "./c2pa-generator";
import { pipelineLogger } from "./logger";
import { checkBudget } from "@/src/lib/budget/tracker";

export interface AuthenticatorResult {
  toneCheck: ToneCheckResult;
  manifests: Record<string, C2PAManifest>;
}

export async function runAuthenticatorAgent(
  projectId: string,
  sko: SKO,
  outputs: SynthesisOutputs
): Promise<AuthenticatorResult> {
  const start = Date.now();

  pipelineLogger.info({ projectId, agent: "authenticate", status: "starting", message: "Authenticator Agent starting — tone check + C2PA" });

  await checkBudget();

  const toneCheckPrompt = buildToneCheckPrompt(sko, outputs);

  const toneCheck = await generateStructured({
    prompt: toneCheckPrompt,
    schema: ToneCheckResultSchema,
    projectId,
    agentName: "authenticate",
  });

  // C2PA manifests use local crypto — no AI call, no budget impact
  const manifests = await generateAllC2PAManifests(outputs);
  const manifestCount = Object.keys(manifests).length;

  pipelineLogger.info({
    projectId,
    agent: "authenticate",
    status: "complete",
    durationMs: Date.now() - start,
    message: `Authenticator complete — tone ${toneCheck.passed ? "PASSED" : "FAILED"} (${(toneCheck.overall_match_score * 100).toFixed(0)}% match), ${toneCheck.ai_slop_flags.length} slop flags, ${manifestCount} C2PA manifests`,
  });

  return { toneCheck, manifests };
}

export interface PlatformToneCheckResult {
  platformResult: { match_score: number; deviations: string[]; suggested_fixes: string[] };
  slopFlags: AISlopFlag[];
}

/**
 * Re-runs the tone check scoped to a single platform output (used after selective regeneration).
 * Builds a minimal SynthesisOutputs with only the given platform populated, runs the full
 * authenticate agent, and returns the per-platform result plus slop flags for that platform only.
 */
export async function runToneCheckForPlatform(
  projectId: string,
  sko: SKO,
  platform: string,
  output: unknown,
  regenPlatform?: string
): Promise<PlatformToneCheckResult> {
  await checkBudget();

  const minimalOutputs: SynthesisOutputs = {
    twitter: null,
    linkedin: null,
    newsletter: null,
    veo: null,
    dark_social: null,
    errors: {},
    [platform]: output,
  };

  const prompt = buildToneCheckPrompt(sko, minimalOutputs);
  const result = await generateStructured({
    prompt,
    schema: ToneCheckResultSchema,
    projectId,
    agentName: "authenticate",
    regenPlatform,
  }) as ToneCheckResult;

  // Normalize per_platform keys to lowercase-underscore format in case the AI used
  // the human-readable section heading names ("Twitter", "Dark Social") instead of the
  // identifiers ("twitter", "dark_social"). Without this, result.per_platform[platform]
  // is undefined and the fallback writes 0% to Firestore.
  const normalizeKey = (k: string) => k.toLowerCase().replace(/[\s-]+/g, "_");
  const normalizedPerPlatform = Object.fromEntries(
    Object.entries(result.per_platform).map(([k, v]) => [normalizeKey(k), v])
  );

  const platformResult = (normalizedPerPlatform[platform] as typeof result.per_platform[string] | undefined) ?? {
    match_score: 0,
    deviations: [],
    suggested_fixes: [],
  };

  const slopFlags = result.ai_slop_flags.filter(
    (f) => normalizeKey(f.platform) === platform
  );

  pipelineLogger.info({
    projectId,
    agent: "authenticate",
    message: `Per-platform tone check for ${platform}: ${(platformResult.match_score * 100).toFixed(0)}% match`,
  });

  return { platformResult, slopFlags };
}
