---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-refine-tone.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - agent
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Concepts/Additive Tone Fingerprinting]]"
  - "[[Wiki/Components/Component - FeedbackForm]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Agent - Refine Tone

> On-demand agent for selective regeneration: strengthens the brand tone fingerprint's positive markers based on user feedback, then re-synthesizes a single platform. Never runs as part of the main pipeline.

## Signature

```typescript
// src/lib/pipeline/agent-refine-tone.ts

export async function runRefineToneAgent(
  projectId: string,
  originalFingerprint: AdditiveFingerprint,
  feedback: string,
  platform: string
): Promise<AdditiveFingerprint>
```

Returns an updated `AdditiveFingerprint` with strengthened positive markers. The orchestrator of selective regeneration (`regenerate.ts`) uses this to build an adjusted synthesis prompt.

## Additive (Not Subtractive) Logic

This agent **strengthens positive markers** — it does not remove or weaken negative ones. The goal is to cultivate a clearer, more specific voice fingerprint over iterations.

See [[Wiki/Concepts/Additive Tone Fingerprinting]] for the full concept.

## Prompt Builder

`buildRefineTonePrompt(originalFingerprint, feedback, platform)` in `src/lib/ai/prompts/refine-tone.ts`:
- Provides the current fingerprint
- Provides user's free-text feedback (e.g., "More data-driven, less corporate")
- Asks Gemini to return a strengthened fingerprint, NOT to rewrite the content yet

## Selective Regeneration Flow

Called via `runSelectiveRegeneration()` in `src/lib/pipeline/regenerate.ts`:

```typescript
export async function runSelectiveRegeneration(
  projectId: string,
  platform: SupportedPlatform,
  feedback: string
): Promise<void> {
  await updateRegenerationStatus(projectId, platform, "processing");
  const sko = await readSKO(projectId);  // read immutable SKO from Firestore
  const originalFingerprint = sko.brand_tone_fingerprint;

  // 1. Refine the tone fingerprint
  const refined = await runRefineToneAgent(projectId, originalFingerprint, feedback, platform);

  // 2. Persist the refinement record
  await writeToneRefinement(projectId, {
    platform,
    feedback,
    original_fingerprint: originalFingerprint,
    refined_fingerprint: refined,
  });

  // 3. Re-synthesize single platform with refined fingerprint
  const prompt = buildPlatformPrompt(sko, undefined, refined);  // e.g. buildTwitterPrompt
  const output = await generateStructured({ prompt, schema, projectId, agentName: `synthesize_${platform}` });

  // 4. Write regenerated output
  await writeRegeneratedOutput(projectId, platform, output);
  await updateRegenerationStatus(projectId, platform, "complete");
}
```

## Cap: 3 Regenerations Per Platform

The API route checks regeneration count before calling `runSelectiveRegeneration`:
```typescript
const count = await getRegenerationCount(projectId, platform);
if (count >= MAX_REGENS_PER_PLATFORM) return 429;
```
`MAX_REGENS_PER_PLATFORM = 3`

## UI Integration

1. User clicks "Not my voice" button on an output tab
2. [[Wiki/Components/Component - FeedbackForm]] appears with dynamic trait pills from `sko.brand_tone_fingerprint` + static fallbacks
3. User selects traits + optional custom feedback → POST to `/api/pipeline/regenerate`
4. Route fires `runSelectiveRegeneration` (fire-and-forget)
5. [[Wiki/Components/Component - OutputTabs]] watches `project.regenerationState[platform]` → shows [[Wiki/Components/Component - Native Previews]] RegenerationIndicator

## Cross-References

- Concept: [[Wiki/Concepts/Additive Tone Fingerprinting]]
- UI trigger: [[Wiki/Components/Component - FeedbackForm]]
- Regeneration state display: [[Wiki/Components/Component - OutputTabs]]
- API route: [[Wiki/Pages/API Routes]]
- Tone history Firestore path: `projects/{id}/tone_history/{auto-id}` (see [[Wiki/Data/Data Model Overview]])
