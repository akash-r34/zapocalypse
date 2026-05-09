import type { C2PAManifest } from "@/src/lib/ai/schemas/c2pa-manifest";
import type { SynthesisOutputs } from "./agent-synthesize";
import { createSignedManifest } from "./c2pa-signer";

export async function generateC2PAManifest(
  platform: string,
  outputData: unknown
): Promise<C2PAManifest> {
  return createSignedManifest(platform, outputData);
}

export async function generateAllC2PAManifests(
  outputs: SynthesisOutputs
): Promise<Record<string, C2PAManifest>> {
  const platforms = ["twitter", "linkedin", "newsletter", "veo", "dark_social"] as const;

  const results = await Promise.all(
    platforms
      .filter((p) => outputs[p] !== null)
      .map(async (p) => [p, await generateC2PAManifest(p, outputs[p])] as const)
  );

  return Object.fromEntries(results);
}
