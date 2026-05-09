---
type: entity
entity_kind: component
domain: ui
source_file: src/components/output/OutputTabs.tsx
created: 2026-04-11
updated: 2026-04-14
status: current
tags:
  - entity
  - component
  - ui
  - output
related:
  - "[[Wiki/Hooks/Hook - useProject]]"
  - "[[Wiki/Hooks/Hook - useOutputExistence]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Component - OutputTabs

> The main output container. Manages tab switching, progressive reveal during synthesis, regeneration state display, and "Not my voice" tone refinement trigger.

## Props

```typescript
interface OutputTabsProps {
  projectId: string;
  outputErrors?: Record<string, string>;
}
```

## State

```typescript
activeTab: TabKey  // "twitter"|"linkedin"|"newsletter"|"veo"|"dark_social"|"leaderboard"
nativeView: boolean
showFeedback: boolean
retrying: Platform | null  // cleared by useEffect watching regenerationState
```

## Hooks Used

- `useProject(projectId)` — reads `project.regenerationState`, `project.sko`, `project.outputErrors`
- `useOutputExistence(projectId)` — reads `ready: Platform[]` array

## Progressive Tab Reveal

```typescript
const effectiveTab = useMemo(() => {
  // If activeTab platform isn't ready yet, show the most recently ready platform
  if (activeTab !== "leaderboard" && !ready.includes(activeTab as Platform)) {
    return ready[ready.length - 1] ?? activeTab;
  }
  return activeTab;
}, [activeTab, ready]);
```

Pending tabs: `opacity-30` + pulse animation dot.

Leaderboard tab is gated on `ready.includes("twitter")` (requires at least Twitter output).

## Regeneration State

For each platform, checks `project.regenerationState[platform]`:
- `"processing"` → shows `RegenerationIndicator` spinner overlay
- `"error"` → shows red error block with message

`retrying` state tracks the platform a retry was issued for. A `useEffect` watching `project.regenerationState` clears it once Firestore confirms the regen started (`processing`/`complete`/`error`) at or after `retryTimestamp`. A 10s safety timeout also clears it. The `setRetrying(null)` call in this effect carries an `eslint-disable-next-line react-hooks/set-state-in-effect` comment — it is a legitimate response to an external Firestore subscription, not a cascading-render anti-pattern.

## "Not my voice" Button

Shown when:
- `effectiveTab !== "leaderboard"`
- `project.sko` is available (needed for fingerprint pills in feedback form)
- `!isRegenerating` (current platform not processing)

On click → sets `showFeedback = true` → renders `FeedbackForm` modal.

## C2PA Badge

Each platform tab renders `C2PABadge` below the output content. Not shown in native preview mode.

## Cross-References

- Progressive disclosure: [[UI System Overview]]
- Feedback form: [[Component - FeedbackForm]]
- Regeneration indicator: [[Component - Native Previews]]
- Hooks: [[Hook - useProject]], [[Hook - useOutputExistence]]
- C2PA badge: [[Component - C2PA UI]]
