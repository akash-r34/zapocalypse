---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/FeedbackForm.tsx
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Pipeline/Agent - Refine Tone]]"
  - "[[Wiki/Concepts/Additive Tone Fingerprinting]]"
  - "[[Wiki/Components/Component - OutputTabs]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - FeedbackForm

> Tone refinement feedback modal. Shows dynamic trait pills from the SKO's additive fingerprint plus static fallbacks. Posts to `/api/pipeline/regenerate`.

## Props

```typescript
interface FeedbackFormProps {
  projectId: string;
  platform: string;
  sko: SKO;
  regenCount: number;
  onClose: () => void;
  onSubmitted: () => void;
}
```

## State

```typescript
customFeedback: string      // free-text input
selectedTraits: Set<string> // selected trait pills
submitting: boolean
error: string | null
```

## Dynamic Trait Pills

Pills are generated from `sko.brand_tone_fingerprint` additive fields:
- `analogy_style` → "More [analogy_style]"
- `sentence_cadence` → "Shorter sentences" / "Longer sentences"
- `signature_phrases` → each phrase as a pill
- `storytelling_structure` → "More [structure]"
- `humor_type` → "More [humor_type]"

All fields are null-guarded. Static fallbacks when additive fields are empty:
- "More contrarian", "More data-driven", "Warmer tone", "Sharper hooks"

## Regeneration Cap

```typescript
// Submit button disabled when regenCount >= 3
// Shows "N/3 regenerations remaining" counter
```

## API Call

```typescript
POST /api/pipeline/regenerate
Body: { projectId, platform, feedback: selectedTraits.join(", ") + " " + customFeedback }
202 → calls onSubmitted(); 4xx → sets error
```

## Cross-References

- API: [[Wiki/Pages/API Routes]]
- Agent: [[Wiki/Pipeline/Agent - Refine Tone]]
- Concept: [[Wiki/Concepts/Additive Tone Fingerprinting]]
- Opened by: [[Component - OutputTabs]]
