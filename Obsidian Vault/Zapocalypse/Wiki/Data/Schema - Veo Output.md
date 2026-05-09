---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/veo-output.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - entity
  - schema
  - data
  - output
related:
  - "[[Wiki/Pipeline/Agent - Synthesize]]"
  - "[[Wiki/Components/Component - VeoPreview]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Veo Output

> Output schema for the Veo video script platform. Produces a structured JSON script — **no actual Veo API calls are made**.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/veo-output.ts

export const VeoScriptSchema = z.object({
  title: z.string(),
  hook_seconds: z.number().int().positive(),
  scenes: z.array(
    z.object({
      scene_number: z.number().int().positive(),
      duration_seconds: z.number().int().positive(),
      visual_description: z.string(),
      voiceover: z.string(),
      on_screen_text: z.string().optional(),
    })
  ).min(3),
  total_duration_seconds: z.number().int().positive(),
  aspect_ratio: z.enum(["9:16", "16:9", "1:1"]),
  style_notes: z.string(),
});

export const VeoOutputSchema = z.object({
  script: VeoScriptSchema,
  platform_note: z.string(),
});

export type VeoScript = z.infer<typeof VeoScriptSchema>;
export type VeoOutput = z.infer<typeof VeoOutputSchema>;
```

## Field Reference

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `script.title` | `string` | — | Video title |
| `script.hook_seconds` | `number` | positive int | Duration of hook segment |
| `script.scenes` | `Scene[]` | min 3 | Video scenes |
| `script.scenes[].scene_number` | `number` | positive int | Scene order |
| `script.scenes[].duration_seconds` | `number` | positive int | Scene duration |
| `script.scenes[].visual_description` | `string` | — | What to show visually |
| `script.scenes[].voiceover` | `string` | — | Spoken narration |
| `script.scenes[].on_screen_text` | `string?` | — | Text overlay |
| `script.total_duration_seconds` | `number` | positive int | Total video duration |
| `script.aspect_ratio` | enum | `"9:16"\|"16:9"\|"1:1"` | Video format |
| `script.style_notes` | `string` | — | Visual style direction |
| `platform_note` | `string` | — | Usage notes for this script |

## Important: Placeholder Only

`src/lib/ai/veo-client.ts` is a placeholder. **No real Veo API calls are made.** The synthesizer generates the JSON script structure and stores it in Firestore. The UI renders it as a script viewer.

## Firestore Storage

Written to `projects/{id}/outputs/veo`.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Synthesize]]
- UI: [[Wiki/Components/Component - VeoPreview]]
