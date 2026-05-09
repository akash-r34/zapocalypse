---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/tone-check.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
related:
  - "[[Wiki/Pipeline/Agent - Authenticator]]"
  - "[[Wiki/Components/Component - Scoring UI]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Tone Check

> Output schema for the tone check portion of Agent 4 (Authenticator). Evaluates how well each platform output matches the brand voice from the SKO.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/tone-check.ts

const PlatformToneResultSchema = z.object({
  match_score: z.number().min(0).max(1),
  deviations: z.array(z.string()),
  suggested_fixes: z.array(z.string()),
});

const AISlopFlagSchema = z.object({
  platform: z.string(),
  item_index: z.number().int(),
  pattern: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  suggestion: z.string(),
});

export const ToneCheckResultSchema = z.object({
  overall_match_score: z.number().min(0).max(1),
  per_platform: z.record(z.string(), PlatformToneResultSchema),
  ai_slop_flags: z.array(AISlopFlagSchema),
  passed: z.boolean(),
});

export type ToneCheckResult = z.infer<typeof ToneCheckResultSchema>;
export type AISlopFlag = z.infer<typeof AISlopFlagSchema>;
```

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `overall_match_score` | `number` (0-1) | Aggregate tone match across all platforms |
| `per_platform` | `Record<string, PlatformToneResult>` | Per-platform breakdown |
| `per_platform[].match_score` | `number` (0-1) | This platform's tone match |
| `per_platform[].deviations` | `string[]` | Ways this platform deviates from the brand voice |
| `per_platform[].suggested_fixes` | `string[]` | Specific improvement suggestions |
| `ai_slop_flags` | `AISlopFlag[]` | Generic/AI-sounding phrases flagged |
| `ai_slop_flags[].severity` | `"low"\|"medium"\|"high"` | How problematic the pattern is |
| `passed` | `boolean` | Overall pass/fail |

## AI Slop Flags

The tone check is specifically designed to identify "AI slop" — overused phrases that signal generic AI-generated content rather than authentic voice. Examples: "delve into", "it's worth noting", "game-changer", "leverage synergies".

Each flag includes: which platform, which item index, the pattern, severity, and a suggested replacement.

## Firestore Storage

Written to `projects/{id}/tone_check/current`.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Authenticator]]
- UI: [[Wiki/Components/Component - Scoring UI]] (`ToneCheckBadge`)
- Hook subscription: [[Wiki/Hooks/Hook - useToneCheck]]
