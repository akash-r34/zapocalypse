---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-score-hooks.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - agent
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Data/Schema - Hook Score]]"
  - "[[Wiki/Components/Component - HookLeaderboard]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Agent - Hook Scorer

> Agent 3.5 (fault-tolerant): scores all hooks from all platform outputs on 4 dimensions and generates A/B variants for high-scoring hooks. Results are bonus — platform outputs are already written before scoring runs.

## Signature

```typescript
// src/lib/pipeline/agent-score-hooks.ts

export async function runHookScoringAgent(
  projectId: string,
  sko: SKO,
  outputs: SynthesisOutputs
): Promise<HookScoreResult>
```

## Fault Tolerance

Scoring is **fault-tolerant** — if it throws (non-budget error), the orchestrator logs a warning and continues to `authenticating`. Platform outputs are already in Firestore at this point.

## Scoring Dimensions

Each hook is scored 0-1 on:
1. **Novelty** — how surprising or unexpected the claim is
2. **Emotional resonance** — emotional pull; evokes curiosity/urgency/desire
3. **Niche relevance** — how well it fits the audience persona from the SKO
4. **Shareability** — viral potential, clear value proposition

A `composite_score` (0-1) is computed from these 4 dimensions. Grade: A-F.

## A/B Variants

Hooks with `composite_score >= 0.70` get A/B variant rewrites generated. These appear in the [[Wiki/Components/Component - HookLeaderboard]] UI with expandable variants.

## Prompt Builder

`buildScoreHooksPrompt(sko, outputs)` in `src/lib/ai/prompts/score-hooks.ts`. The SKO's `audience_persona` is explicitly passed to anchor scoring to the target audience — not a generic "good headline" judgment.

## Output: `HookScoreResult`

Full schema at [[Wiki/Data/Schema - Hook Score]].

```typescript
{
  hooks: Array<{
    hook_id: string;
    text: string;
    platform: string;
    hook_type: string;
    composite_score: number;  // 0-1
    grade: "A" | "B" | "C" | "D" | "F";
    scores: {
      novelty: number;
      emotional_resonance: number;
      niche_relevance: number;
      shareability: number;
    };
    explanation: string;
    ab_variants?: string[];  // only for composite_score >= 0.70
  }>;
  top_hook_id: string;
}
```

## Firestore Write

Orchestrator calls `writeHookScores(projectId, hookScores)` → `projects/{id}/hook_scores/current`.

## Cross-References

- Output schema: [[Wiki/Data/Schema - Hook Score]]
- Input: [[Wiki/Data/Schema - SKO]] (audience_persona used for anchor), synthesis outputs
- Previous agent: [[Agent - Synthesize]]
- Next agent: [[Agent - Authenticator]]
- UI: [[Wiki/Components/Component - HookLeaderboard]], [[Wiki/Components/Component - Scoring UI]]
- Hook subscription: [[Wiki/Hooks/Hook - useHookScores]]
