---
type: entity
entity_kind: schema
domain: data
source_file: src/lib/ai/schemas/dark-social-output.ts
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
  - "[[Wiki/Components/Component - DarkSocialPreview]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Schema - Dark Social Output

> Output schema for the Dark Social platform. Produces content for private/community channels: Slack messages, Discord messages, and a shareable quote.

## Full Zod Schema

```typescript
// src/lib/ai/schemas/dark-social-output.ts

export const DarkSocialSnippetSchema = z.object({
  slack_message: z.object({
    hook: z.string().max(300),
    body: z.string().max(1500),
    emoji_prefix: z.string(),
  }),
  discord_message: z.object({
    hook: z.string().max(300),
    body: z.string().max(1500),
    embed_title: z.string().optional(),
  }),
  shareable_quote: z.string().max(500),
  context_line: z.string().max(300),
});

export type DarkSocialSnippet = z.infer<typeof DarkSocialSnippetSchema>;
```

## Field Reference

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `slack_message.hook` | `string` | max 300 | Opening line for Slack |
| `slack_message.body` | `string` | max 1500 | Slack message body |
| `slack_message.emoji_prefix` | `string` | — | Leading emoji(s) |
| `discord_message.hook` | `string` | max 300 | Opening line for Discord |
| `discord_message.body` | `string` | max 1500 | Discord message body |
| `discord_message.embed_title` | `string?` | — | Optional Discord embed title |
| `shareable_quote` | `string` | max 500 | Standalone quotable excerpt |
| `context_line` | `string` | max 300 | One-line context for forwarding |

## What is "Dark Social"?

Content shared in private channels (Slack workspaces, Discord servers, WhatsApp groups, email) where tracking is impossible. Optimized for human-to-human forwarding rather than public algorithmic amplification.

## Firestore Storage

Written to `projects/{id}/outputs/dark_social`.

## Cross-References

- Produced by: [[Wiki/Pipeline/Agent - Synthesize]]
- UI: [[Wiki/Components/Component - DarkSocialPreview]]
