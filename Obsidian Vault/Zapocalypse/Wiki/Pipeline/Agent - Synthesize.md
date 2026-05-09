---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-synthesize.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - agent
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Data/Schema - SKO]]"
  - "[[Wiki/Data/Schema - Twitter Output]]"
  - "[[Wiki/Data/Schema - LinkedIn Output]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Agent - Synthesize

> Agent 3: runs 5 platform synthesis tasks in parallel via `Promise.allSettled`. Each platform derives content from the SKO independently. One platform failing does not block others.

## Signature

```typescript
// src/lib/pipeline/agent-synthesize.ts

interface SynthesisOutputs {
  twitter: TwitterOutput | null;
  linkedin: LinkedInOutput | null;
  newsletter: NewsletterOutput | null;
  veo: VeoOutput | null;
  dark_social: DarkSocialOutput | null;
  errors: Record<string, string>;
}

export async function runSynthesisAgent(
  projectId: string,
  sko: SKO,
  analysisScore?: InformationGainScore
): Promise<SynthesisOutputs>
```

## Parallel Execution

All 5 platforms run concurrently:

```typescript
const [twitterResult, linkedinResult, newsletterResult, veoResult, darkSocialResult] =
  await Promise.allSettled([
    generateStructured({ prompt: buildTwitterPrompt(sko, analysisScore), schema: TwitterOutputSchema, ... }),
    generateStructured({ prompt: buildLinkedInPrompt(sko, analysisScore), schema: LinkedInOutputSchema, ... }),
    generateStructured({ prompt: buildNewsletterPrompt(sko, analysisScore), schema: NewsletterOutputSchema, ... }),
    generateStructured({ prompt: buildVeoPrompt(sko), schema: VeoOutputSchema, ... }),
    generateStructured({ prompt: buildDarkSocialPrompt(sko), schema: DarkSocialOutputSchema, ... }),
  ]);

// Each settled result checked: fulfilled → assign output; rejected → assign null + error
```

`errors` in the returned object holds the per-platform error messages for any that failed.

## Platform-Specific Prompt Builders

Each builder accepts optional `refinedFingerprint` for tone override (used in regeneration):

| Platform | Builder | Schema |
|----------|---------|--------|
| Twitter | `buildTwitterPrompt(sko, analysisScore?, refinedFingerprint?)` | [[Wiki/Data/Schema - Twitter Output]] |
| LinkedIn | `buildLinkedInPrompt(sko, analysisScore?, refinedFingerprint?)` | [[Wiki/Data/Schema - LinkedIn Output]] |
| Newsletter | `buildNewsletterPrompt(sko, analysisScore?, refinedFingerprint?)` | [[Wiki/Data/Schema - Newsletter Output]] |
| Veo | `buildVeoPrompt(sko, refinedFingerprint?)` | [[Wiki/Data/Schema - Veo Output]] |
| Dark Social | `buildDarkSocialPrompt(sko, refinedFingerprint?)` | [[Wiki/Data/Schema - Dark Social Output]] |

## All-Platform-Failure Guard

The orchestrator checks after `runSynthesisAgent`:
```typescript
if (!outputs.twitter && !outputs.linkedin && !outputs.newsletter && !outputs.veo && !outputs.dark_social) {
  throw new Error("All synthesis platforms failed — no outputs produced");
}
```
This throws → `error` state + `synthesis_only` refund.

## `outputErrors` Field

Per-platform errors are stored on the project doc as `outputErrors: Record<string, string>`. The UI (see [[Wiki/Components/Component - OutputTabs]]) checks this to show per-tab error states.

## Budget Check

Each of the 5 synthesis `generateStructured` calls triggers a `checkBudget()` inside the Gemini client. Five platforms × one check each = 5 budget checks in this agent alone.

## Cross-References

- Input: [[Wiki/Data/Schema - SKO]]
- Output schemas: [[Wiki/Data/Schema - Twitter Output]], [[Wiki/Data/Schema - LinkedIn Output]], [[Wiki/Data/Schema - Newsletter Output]], [[Wiki/Data/Schema - Veo Output]], [[Wiki/Data/Schema - Dark Social Output]]
- Previous agent: [[Agent - Extract]]
- Next agent: [[Agent - Hook Scorer]]
- Tone override: [[Agent - Refine Tone]]
