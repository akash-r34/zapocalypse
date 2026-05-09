---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-authenticate.ts
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - agent
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Data/Schema - Tone Check]]"
  - "[[Wiki/Data/Schema - C2PA Manifest]]"
  - "[[Wiki/Concepts/C2PA Signing]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Agent - Authenticator

> Agent 4 (fault-tolerant): runs tone check (AI-powered) and generates C2PA content credentials (deterministic, no tokens). Also used by the post-regen cascade via `runToneCheckForPlatform`.

## Full Pipeline: `runAuthenticatorAgent`

```typescript
interface AuthenticatorResult {
  toneCheck: ToneCheckResult;
  manifests: Record<string, C2PAManifest>;
}

export async function runAuthenticatorAgent(
  projectId: string,
  sko: SKO,
  outputs: SynthesisOutputs
): Promise<AuthenticatorResult>
```

Tone check only includes platforms with actual output — `buildToneCheckPrompt` skips null platforms, so the AI never produces 0-score entries for failed platforms.

Orchestrator calls `writeToneCheck(projectId, result, outputs.errors)` — the helper additionally strips any per_platform entries for platforms in `outputErrors` as a defence layer.

## Post-Regen Cascade: `runToneCheckForPlatform`

```typescript
export async function runToneCheckForPlatform(
  projectId: string,
  sko: SKO,
  platform: string,
  output: unknown,
  regenPlatform?: string   // passed to recordCost so cost appears under the regen group
): Promise<{ platformResult: PlatformToneResult, slopFlags: AISlopFlag[] }>
```

Builds a minimal `SynthesisOutputs` with only the regenerated platform, runs the full tone check, and returns only the per-platform result and slop flags for that platform. Called fire-and-forget from `regenerate.ts` after each successful regen.

**Key normalization:** After the AI returns, all `per_platform` keys are normalized to lowercase-underscore before lookup (`"Twitter"` → `"twitter"`, `"Dark Social"` → `"dark_social"`). The AI prompt also explicitly specifies the expected key names to prevent the mismatch.

## Prompt Key Format Instruction

The prompt explicitly states:
> "Use exactly these lowercase identifiers as keys in per_platform: twitter, linkedin, newsletter, veo, dark_social."

Without this, section headings (`### Twitter`) cause the AI to use capitalized keys, which don't match the `platform` lookup string → fallback 0% written.

## Fault Tolerance

Authenticator is fault-tolerant in the orchestrator. If it throws (non-budget error), the orchestrator logs a warning — platform outputs are already in Firestore.

In the regen cascade, `runToneCheckForPlatform` is called inside a `.catch(warn)` — cascade failures never block the regen completing.

## Cross-References

- Tone check schema: [[Wiki/Data/Schema - Tone Check]]
- C2PA schema: [[Wiki/Data/Schema - C2PA Manifest]]
- Signing concept: [[Wiki/Concepts/C2PA Signing]]
- Hooks: [[Wiki/Hooks/Hook - useToneCheck]], [[Wiki/Hooks/Hook - useC2PAManifests]]
- Post-regen caller: `src/lib/pipeline/regenerate.ts`
