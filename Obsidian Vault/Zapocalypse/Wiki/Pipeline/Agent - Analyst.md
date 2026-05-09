---
type: entity
entity_kind: agent
domain: pipeline
source_file: src/lib/pipeline/agent-analyze.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - agent
  - pipeline
related:
  - "[[Pipeline Overview]]"
  - "[[Wiki/Data/Schema - Information Gain]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Docs/V3 Market research.md]]"
---

# Agent - Analyst

> Agent 1.5 (fault-tolerant): scores the content on 5 originality signals and returns a grade A-F. Falls back to `NEUTRAL_ANALYSIS_SCORE` on failure. Used to weight extraction toward unique insights on low-grade content.

## Signature

```typescript
// src/lib/pipeline/agent-analyze.ts

export async function runAnalysisAgent(
  projectId: string,
  ingested: IngestedContent
): Promise<InformationGainScore>
```

## Fault-Tolerance

This agent is **fault-tolerant** in the orchestrator — if it throws a non-budget error, the pipeline continues with `NEUTRAL_ANALYSIS_SCORE`:

```typescript
// orchestrator.ts
let analysisScore: InformationGainScore = NEUTRAL_ANALYSIS_SCORE;
try {
  analysisScore = await runAnalysisAgent(projectId, ingested);
  await writeAnalysis(projectId, analysisScore);
} catch (analysisErr) {
  if (analysisErr instanceof BudgetExceededError) throw analysisErr;
  // log warning, continue with neutral
}
```

## Output: `InformationGainScore`

See full schema at [[Wiki/Data/Schema - Information Gain]].

```typescript
{
  signals: {
    proprietary_data: number;          // 0-10
    first_person_specificity: number;  // 0-10
    verifiable_claims: number;         // 0-10
    non_obvious_conclusions: number;   // 0-10
    depth: number;                     // 0-10
  };
  overall_score: number;               // 0-10
  grade: "A" | "B" | "C" | "D" | "F";
  content_classification: string;
  strongest_asset: string;
  biggest_gap: string;
  enrichment_suggestions: string[];
}
```

## `NEUTRAL_ANALYSIS_SCORE`

Exported from `src/lib/ai/schemas/information-gain.ts`. All signals = 5, grade = "C". Used as the fallback when analysis fails.

## How the Score Is Used

The `analysisScore` is passed to:
- `runExtractionAgent()` — low-originality content (grade D/F) causes the extraction prompt to weight toward unique/specific insights
- `runSynthesisAgent()` — synthesis prompts can use the score to adjust tone

## Prompt Builder

`buildAnalyzePrompt(ingested: IngestedContent)` in `src/lib/ai/prompts/analyze.ts`

## Cross-References

- Output schema: [[Wiki/Data/Schema - Information Gain]]
- Fallback value: `NEUTRAL_ANALYSIS_SCORE` in [[Wiki/Data/Schema - Information Gain]]
- Previous agent: [[Agent - Ingest]]
- Next agent: [[Agent - Extract]]
- UI display: [[Wiki/Components/Component - Scoring UI]]
