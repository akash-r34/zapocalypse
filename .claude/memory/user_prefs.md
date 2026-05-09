---
name: user_prefs
description: How the user likes to work — preferences, corrections, confirmed approaches
type: user
---

# User Preferences

## Working Style

- Uses Opus 4.6 in plan mode (`/model opusplan`) — suggests preference for thoughtful planning before coding
- Closed a session by mistake and resumed via plan file — keep plan file path noted: `~/.claude/plans/refactored-juggling-nygaard.md`
- Prefers skills installed locally per-project, not globally
- Security-conscious: asked for prompt injection audit before proceeding

## Preferences to Apply

- Always check `.claude/memory/MEMORY.md` at session start
- Confirm GCP/Firebase manual steps are complete before writing code that depends on them
- Don't skip budget checks — user is cost-aware ($100/mo hard limit)
