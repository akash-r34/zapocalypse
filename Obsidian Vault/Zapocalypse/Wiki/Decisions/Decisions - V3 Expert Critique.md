---
type: decision
domain: pipeline
source_file: src/docs/V3_Critique_transcript.md, src/docs/V3 Development Plan.md
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - decision
  - v3
  - architecture
related:
  - "[[Wiki/Concepts/Additive Tone Fingerprinting]]"
  - "[[Wiki/Concepts/Budget Protection Layers]]"
  - "[[Wiki/Project/Phase History]]"
sources:
  - "[[Sources/Memory/decisions]]"
  - "[[Sources/Docs/V3_Critique_transcript.md]]"
  - "[[Sources/Docs/V3 Market research.md]]"
---

# Decisions - V3 Expert Critique

> Four major architectural decisions from the V3 expert critique session (2026-03-28). These drove the V3 phase ordering and core system design.

## 1. Additive Tone Fingerprinting

**Decision:** V3 SKO extraction maps *positive* linguistic markers (analogy style, sentence cadence spectrum, signature phrases, storytelling structure, humor type, niche colloquialisms). Reflexion buttons offer dynamic positive options derived from the fingerprint — not generic negative options like "too formal."

**Why:** Purely subtractive prompting (filtering slop) is architecturally inefficient. It zeros out token probabilities but doesn't guide attention toward the creator's unique voice. The result is content that offends no one and excites no one. Positive markers give the model a target to hit.

**How applied:**
- `BrandToneFingerprintSchema` in `src/lib/ai/schemas/sko.ts` — positive_markers, cadence enum, signature_phrases, humor_type, storytelling_structure, niche_colloquialisms
- Extraction prompt explicitly instructs categorization (not counting — LLMs categorize well, count poorly)
- `FeedbackForm.tsx` pulls buttons from user's actual fingerprint
- Refinement is always additive: never removes/overrides existing markers

See [[Wiki/Concepts/Additive Tone Fingerprinting]].

---

## 2. Tiered Refund Logic

**Decision:** Fair-play credits must be stage-aware. If synthesis fails after extraction succeeded: refund only synthesis cost, retain SKO as user asset, surface "Regenerate for fewer credits" UI. Full refund only if pipeline fails before any value is created.

**Why:** Heavy extraction is the most expensive operation. A cheap downstream synthesis failure triggering a full refund is the "token trap" — destroys compute margins and doesn't improve user experience (time cost is identical either way).

**How applied:**
- `src/lib/budget/refund.ts` — `processRefund(projectId, "full" | "synthesis_only")`
- `orchestrator.ts` tracks `currentStage: "pre_extract" | "synthesis"`
- `skoRetained: true` on project doc when synthesis fails after extract succeeds
- `SKOAssetCard` UI shows partial success state on dashboard

See [[Wiki/Concepts/Budget Protection Layers]].

---

## 3. Pre-flight Validation

**Decision:** For expensive inputs (video files, large documents), run mandatory lightweight pre-flight check with `gemini-2.5-flash-8b` before committing to full extraction. Check: (a) file parseable, (b) actual human dialogue present, (c) content has substance.

**Why:** Bad inputs (corrupted video, silent screen recording, empty document) trigger expensive API calls delivering zero value and cannot be refunded via tiered logic (the extraction itself spent real tokens). Pre-flight costs ~$0.0001 vs $0.018+ for full video extraction.

**How applied:**
- `src/lib/pipeline/preflight.ts` — `runPreflightCheck()`, `PreflightError`
- Uses `generateStructured` with Zod schema (not string matching)
- 3-point content sampling for large inputs
- Skips inputs <5000 chars (short text/URLs don't need pre-flight)
- Integrated in `orchestrator.ts` before extraction step
- `gemini-2.5-flash-8b` pricing explicitly added to `pricing.ts`

---

## 4. V3 Phase Ordering: Intelligence Before UX

**Decision:** V3 phases deploy intelligence upgrades first (Hook Scoring, Reflexion + Additive Fingerprinting) before UX polish and credit mechanics.

**Why:** Deploying UX polish before output quality is demonstrably better means beta testers interact with a prettier wrapper around V2's slop. If output isn't better, a frictionless UI won't prevent churn. The data flywheel for brand voice models must start early — every reflexion interaction trains the persistent fingerprint.

**Phase order:**
1. Predictive Virality & Hook Scoring (intelligence, zero risk)
2. Reflexion Loop + Additive Fingerprinting (intelligence, core V3 value)
3. UX Clarity & Progressive Disclosure (polish after intelligence validated)
4. Fair-Play Credits, Tiered Refunds & Pre-flight (monetization mechanics)
5. C2PA Cryptographic Signing (trust infrastructure)
6. Multimodal Input & YouTube Support (pending)
7. Authentication, Monetization & Retention (pending)
8. Social Publishing & Scheduling (pending)

## Cross-References

- Additive fingerprinting: [[Wiki/Concepts/Additive Tone Fingerprinting]]
- Budget/refund: [[Wiki/Concepts/Budget Protection Layers]]
- Phase status: [[Wiki/Project/Phase History]]
- V3 plan: [[Sources/Docs/V3 Development Plan.md]]
