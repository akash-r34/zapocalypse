---
type: concept
domain: pipeline
source_file: src/lib/ai/schemas/sko.ts, src/lib/ai/prompts/extract.ts, src/lib/pipeline/agent-refine-tone.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - concept
  - pipeline
  - v3
related:
  - "[[Wiki/Data/Schema - SKO]]"
  - "[[Wiki/Pipeline/Agent - Refine Tone]]"
  - "[[Wiki/Components/Component - FeedbackForm]]"
  - "[[Wiki/Decisions/Decisions - V3 Expert Critique]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Docs/V3 Market research.md]]"
---

# Additive Tone Fingerprinting

> V3's core voice-matching system. Instead of subtractive slop filters, the SKO captures *positive* linguistic markers from the creator's source. Reflexion strengthens these markers rather than removing negatives.

## Core Insight

Purely subtractive prompting ("avoid corporate speak") zeroes out token probabilities but gives the LLM no target to aim for. The result is inoffensive but voiceless content.

**Additive fingerprinting** gives the model a target: "write like this person specifically writes."

## `BrandToneFingerprint` Schema

Stored in `sko.brand_tone_fingerprint` (see [[Wiki/Data/Schema - SKO]]):

```typescript
const BrandToneFingerprintSchema = z.object({
  positive_markers: z.array(z.string()).min(3).max(10),
  // e.g. ["uses battle metaphors", "ends with questions", "starts with contrarian takes"]

  cadence: z.enum(["low", "medium", "high"]),
  // LLMs categorize well, they count poorly — never ask for syllable counts

  signature_phrases: z.array(z.string()).max(5),
  // Verbatim or near-verbatim phrases the creator uses frequently

  humor_type: z.enum(["dry", "absurdist", "sarcastic", "none", "self-deprecating"]),

  storytelling_structure: z.enum(["hero_journey", "problem_solution", "listicle", "stream_of_consciousness", "case_study"]),

  niche_colloquialisms: z.array(z.string()).max(10),
  // Insider terms from the creator's specific niche

  slop_flags: z.array(z.string()).max(10),
  // Patterns to actively avoid (populated from tone check failures)
});
```

## Extraction

The extraction agent (`runExtractionAgent`) populates `brand_tone_fingerprint` during SKO creation by analyzing the source content for positive linguistic traits. Prompt in `src/lib/ai/prompts/extract.ts` explicitly instructs Gemini to:
- Categorize traits (not count them)
- Use spectrum enums for cadence — avoid asking the model to measure
- Extract verbatim signature phrases where possible

## Reflexion Loop

1. User reads generated output and clicks "Not my voice"
2. `FeedbackForm` opens — shows dynamic trait pills derived from **their** `brand_tone_fingerprint`
3. User selects 1-3 positive traits to emphasize (e.g., "More battle metaphors")
4. `POST /api/pipeline/regenerate` fires `runRefineToneAgent`
5. Tone refinement agent strengthens the selected positive markers in the fingerprint
6. Refined fingerprint is saved to `tone_history/{auto-id}` in Firestore
7. Synthesis agent re-runs with the refined fingerprint for that platform

**Key invariant:** Refinement is always additive. The agent strengthens positive markers — it never removes or overrides existing ones.

## Firestore Storage

```
projects/{id}/sko/current       ← brand_tone_fingerprint in the SKO
projects/{id}/tone_history/{id} ← { platform, feedback, original_fingerprint, refined_fingerprint, timestamp }
```

## Regeneration Modes

| Mode | Behavior |
|------|---------|
| `retry: false` + `feedback` | Full cycle: tone refinement → re-synthesis with new fingerprint |
| `retry: true` | Skip refinement; re-run synthesis with existing fingerprint |

Max 3 regenerations per platform (enforced in `/api/pipeline/regenerate`).

## Cross-References

- SKO schema: [[Wiki/Data/Schema - SKO]] (full `BrandToneFingerprintSchema`)
- Refinement agent: [[Wiki/Pipeline/Agent - Refine Tone]]
- User interface: [[Component - FeedbackForm]]
- API endpoint: [[Wiki/Pages/API Routes]] (`POST /api/pipeline/regenerate`)
- Expert critique: [[Wiki/Decisions/Decisions - V3 Expert Critique]]
