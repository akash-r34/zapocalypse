---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/information-gain.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
related:
  - "[[Wiki/Pipeline/Agent - Analyst]]"
  - "[[Wiki/Components/Component - Scoring UI]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Information Gain

> Output schema of Agent 1.5 (Analyst). Scores content on 5 originality signals with evidence and recommendations. Includes the `NEUTRAL_ANALYSIS_SCORE` fallback constant.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/information-gain.ts

const OriginalitySignalSchema = z.object({
  signal: z.enum([
    "proprietary_data",
    "first_person_specificity",
    "verifiable_claims",
    "non_obvious_conclusions",
    "depth_score",
  ]),
  score: z.number().min(0).max(10),
  evidence: z.string(),        // direct quote or reference from source content
  recommendation: z.string(),  // how the creator could strengthen this signal
});

export const InformationGainScoreSchema = z.object({
  overall_score: z.number().min(0).max(10),
  grade: z.enum(["A", "B", "C", "D", "F"]),
  signals: z.array(OriginalitySignalSchema).length(5),  // exactly 5 signals
  content_classification: z.enum([
    "original_research",
    "expert_commentary",
    "curated_synthesis",
    "derivative_rehash",
    "generic_advice",
  ]),
  strongest_asset: z.string(),
  biggest_gap: z.string(),
  enrichment_suggestions: z.array(z.string()).min(1).max(5),
});

export type InformationGainScore = z.infer<typeof InformationGainScoreSchema>;
export type OriginalitySignal = z.infer<typeof OriginalitySignalSchema>;
```

## The 5 Signals

| Signal | What it measures |
|--------|-----------------|
| `proprietary_data` | Unique data, research, or statistics not found elsewhere |
| `first_person_specificity` | Personal experiences, specific named examples, insider knowledge |
| `verifiable_claims` | Cited sources, measurable assertions, testable claims |
| `non_obvious_conclusions` | Counterintuitive insights, conclusions beyond common knowledge |
| `depth_score` | Explanation of mechanisms, underlying principles, nuance |

Each signal is scored 0-10 with an `evidence` quote and `recommendation` for improvement.

## `NEUTRAL_ANALYSIS_SCORE` Constant

Exported for use as fallback when analysis fails:

```typescript
export const NEUTRAL_ANALYSIS_SCORE: InformationGainScore = {
  overall_score: 5,
  grade: "C",
  signals: [
    { signal: "proprietary_data", score: 5, evidence: "Analysis unavailable", recommendation: "Add proprietary data or original research" },
    { signal: "first_person_specificity", score: 5, evidence: "Analysis unavailable", recommendation: "Include personal experiences and specific examples" },
    { signal: "verifiable_claims", score: 5, evidence: "Analysis unavailable", recommendation: "Cite sources and include verifiable statistics" },
    { signal: "non_obvious_conclusions", score: 5, evidence: "Analysis unavailable", recommendation: "Push beyond common knowledge with counterintuitive insights" },
    { signal: "depth_score", score: 5, evidence: "Analysis unavailable", recommendation: "Expand on mechanisms and underlying principles" },
  ],
  content_classification: "curated_synthesis",
  strongest_asset: "Analysis unavailable — proceeding with neutral score",
  biggest_gap: "Analysis unavailable — proceeding with neutral score",
  enrichment_suggestions: ["Analysis was unavailable for this run"],
};
```

## How Grade Affects Downstream

- Grade **D/F** → `buildExtractPrompt` weights toward unique/specific insights
- Grade shown in UI via `ScoreBadge` component (reads from `analysis/current`)

## Firestore Storage

Written to `projects/{id}/analysis/current` by orchestrator.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Analyst]]
- Fallback used by: [[Wiki/Pipeline/Orchestrator]]
- UI display: [[Wiki/Components/Component - Scoring UI]] (`ScoreBadge`)
