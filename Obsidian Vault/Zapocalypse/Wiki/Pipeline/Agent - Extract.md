---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-extract.ts
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
  - "[[Wiki/Architecture/Hub and Spoke via SKO]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Agent - Extract

> Agent 2 (required): produces the Structured Knowledge Object (SKO) — the central hub artifact that all synthesis agents derive outputs from.

## Signature

```typescript
// src/lib/pipeline/agent-extract.ts

export async function runExtractionAgent(
  projectId: string,
  ingested: IngestedContent,
  analysisScore?: InformationGainScore
): Promise<SKO>
```

## Role in the Architecture

This is the **most critical** agent in the pipeline. Its output (the SKO) is:
- Persisted to Firestore at `projects/{id}/sko/current` (immutable after write)
- Used by all 5 synthesis agents
- Used by hook scorer and authenticator
- Reused for tone refinement regenerations without re-running this agent

If extraction fails, the pipeline errors out (`error` state, full refund). There is no fallback — unlike the Analyst.

## Analysis-Weighted Prompting

When `analysisScore` is provided with grade D or F:
- `buildExtractPrompt(ingested, analysisScore)` adjusts the extraction prompt to weight toward unique/specific insights
- This compensates for low-originality content by emphasizing whatever differentiated angles the content has

## Output: `SKO`

Full schema at [[Wiki/Data/Schema - SKO]]. Key structure:

```typescript
{
  core_thesis: string;
  audience_persona: {
    primary: string;
    secondary: string;
    pain_points: string[];
    desired_outcomes: string[];
  };
  viral_hooks: string[];  // min 3, max 10
  semantic_chunks: Array<{
    id: string;
    heading: string;
    key_insight: string;
    supporting_data: string[];
    emotional_valence: string;
    relevance_score: number;
  }>;
  brand_tone_fingerprint: BrandToneFingerprintSchema;
}
```

## Firestore Write

After the orchestrator receives the SKO, it calls:
```typescript
await writeSKO(projectId, sko);
currentStage = "synthesis";  // refund tier switches — SKO delivered
```

The agent does NOT write to Firestore directly.

## SKO Immutability

Once written to Firestore, the SKO is **never updated**. New runs create a new project document with a new SKO. Tone refinement regeneration reads the stored SKO but modifies only a tone fingerprint overlay — it does not mutate the SKO.

## Cross-References

- Output schema: [[Wiki/Data/Schema - SKO]]
- Central pattern: [[Wiki/Architecture/Hub and Spoke via SKO]]
- Previous agent: [[Agent - Analyst]]
- Next agent: [[Agent - Synthesize]]
- Firestore write: [[Wiki/Data/Firestore Helpers]]
