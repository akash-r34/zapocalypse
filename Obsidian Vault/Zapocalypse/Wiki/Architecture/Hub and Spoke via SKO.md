---
type: concept
domain: architecture
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - concept
  - architecture
  - pipeline
related:
  - "[[Wiki/Data/Schema - SKO]]"
  - "[[Wiki/Pipeline/Agent - Extract]]"
  - "[[Wiki/Pipeline/Agent - Synthesize]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/decisions]]"
---

# Hub and Spoke via SKO

> The Structured Knowledge Object (SKO) is the single central data artifact from which all platform outputs are derived — no agent reads the raw input twice after extraction.

## The Pattern

```
Raw Input
    ↓
[Ingest] → IngestedContent
    ↓
[Analyse] → InformationGainScore  (optional enrichment signal)
    ↓
[Extract] → SKO  ←── THE HUB
               ↙  ↓  ↓  ↓  ↘
           Twitter LinkedIn Newsletter Veo Dark Social
           (5 synthesis agents run in parallel)
```

All 5 platform synthesizers read from the **same SKO**. They do not see the original raw content. The SKO is the compiled representation of the source's key knowledge.

## Why This Approach

**Decided:** 2026-03-22

1. **Consistency** — All platforms share the same thesis, persona, and brand voice because they all derive from one source of truth
2. **Auditability** — The SKO is immutable and persisted in Firestore at `projects/{id}/sko/current`. Any output can be traced back to its source data
3. **Efficiency** — Raw content is processed once; synthesis prompts are smaller (SKO is structured JSON, not raw text)
4. **Selective regeneration** — When a platform is regenerated (tone refinement), it reads the same SKO from Firestore without re-running ingestion or extraction

## SKO Structure

The full schema is at [[Wiki/Data/Schema - SKO]]. Key fields:

```typescript
{
  core_thesis: string;              // 3-5 sentence thesis
  audience_persona: {
    primary: string;
    secondary: string;
    pain_points: string[];
    desired_outcomes: string[];
  };
  viral_hooks: string[];            // min 3, max 10
  semantic_chunks: Array<{
    id: string;
    heading: string;
    key_insight: string;
    supporting_data: string[];
    emotional_valence: string;
    relevance_score: number;
  }>;
  brand_tone_fingerprint: {
    // Subtractive (always present)
    voice: string;
    style: string;
    vocabulary_level: string;
    preferred_structures: string[];
    avoid: string[];
    // Additive (optional, user-cultivated via tone refinement)
    analogy_style?: string;
    sentence_cadence?: "low" | "medium" | "high";
    signature_phrases?: string[];
    storytelling_structure?: string;
    humor_type?: string;
    colloquialisms?: string[];
    explanation_pattern?: string;
  };
}
```

## SKO Immutability Rule

The SKO produced by [[Agent - Extract]] is **read-only** for synthesis and later agents. No agent mutates the SKO. The orchestrator writes it to Firestore once; all downstream agents receive it as a parameter.

If SKO validation fails (Zod parse error in `runExtractionAgent`), the pipeline transitions to `error` state. Synthesis never runs with an invalid SKO.

## Selective Regeneration with SKO

When a user requests tone refinement:
1. `runSelectiveRegeneration()` in `regenerate.ts` calls `readSKO(projectId)` from Firestore
2. It runs `runRefineToneAgent()` to update the tone fingerprint
3. The updated fingerprint is passed to the platform's synthesis prompt builder
4. The SKO itself is **never updated** — only the tone fingerprint overlay changes

This means the SKO can be reused indefinitely for regenerations without re-running the expensive extraction step.

## `skoRetained` Flag

If synthesis fails but extraction succeeded, the orchestrator sets `project.skoRetained = true` and processes a `synthesis_only` refund. The user can attempt regeneration from this retained SKO. Shown in the UI as an amber partial-success banner.

## Cross-References

- Full schema: [[Wiki/Data/Schema - SKO]]
- Produced by: [[Wiki/Pipeline/Agent - Extract]]
- Consumed by: [[Wiki/Pipeline/Agent - Synthesize]], [[Wiki/Pipeline/Agent - Hook Scorer]], [[Wiki/Pipeline/Agent - Authenticator]], [[Wiki/Pipeline/Agent - Refine Tone]]
- Persisted via: [[Wiki/Data/Firestore Helpers]]
- Tone refinement extension: [[Wiki/Concepts/Additive Tone Fingerprinting]]
