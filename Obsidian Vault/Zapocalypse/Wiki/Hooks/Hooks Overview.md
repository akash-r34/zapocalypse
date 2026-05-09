---
type: overview
domain: hooks
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - overview
  - hooks
  - ui
sources:
  - "[[Sources/Memory/codebase_architecture]]"
---

# Hooks Overview

> All 14 Zapocalypse custom hooks follow the same architectural pattern: Firestore `onSnapshot` subscriptions providing real-time state to React components. Client-side only (`"use client"`).

## Architecture Pattern

Every hook:
1. Uses Firestore client SDK (`getClientFirestore()`)
2. Subscribes via `onSnapshot` for real-time updates (exception: `useArtifactPreviews` uses `getDoc`)
3. Returns `{ data, loading, error? }` or equivalent
4. Cleans up the subscription in `useEffect` return
5. Lives in `src/hooks/`

## Hook Inventory

| Hook | Firestore path | Returns | Real-time? |
|------|---------------|---------|-----------|
| [[Hook - useProject]] | `projects/{id}` + subcollections | `{ project, loading, error }` | Yes |
| [[Hook - useOutput]] | `projects/{id}/outputs/{platform}` | `{ data, loading, error }` | Yes |
| [[Hook - useOutputExistence]] | `projects/{id}/outputs/` (collection) | `{ ready: Platform[], loading }` | Yes |
| [[Hook - useArtifactPreviews]] | `projects/{id}/outputs/{platform}` × 3 | `Record<string, ArtifactPreview>` | No (one-shot) |
| [[Hook - useHookScores]] | `projects/{id}/hook_scores/current` | `{ data, loading }` | Yes |
| [[Hook - useToneCheck]] | `projects/{id}/tone_check/current` | `{ data, loading }` | Yes |
| [[Hook - useBudget]] | `budget/current` | `{ budget, loading }` | Yes |
| [[Hook - useRecentProjects]] | `projects/` (query) | `{ projects, loading }` | Yes |
| [[Hook - useCopyToClipboard]] | — (state only) | `{ copy, isCopied }` | N/A |
| [[Hook - useProjectCost]] | `projects/{id}/cost_log/` | `{ costLog, totalCost, loading, error }` | Yes |
| [[Hook - useMonthlyRefunds]] | `projects/` (query) | `{ refundedTotal, loading }` | Yes |
| [[Hook - useProjectRefunds]] | `projects/{id}/refund_log/` | `{ refunds, totalRefunded, loading }` | Yes |
| [[Hook - useC2PAManifests]] | `projects/{id}/c2pa/` (collection) | `{ manifests, loading }` | Yes |
| [[Hook - useSourceContent]] | `projects/{id}/source/current` | `{ rawContent, loading }` | No (one-shot) |
| [[Hook - useTheme]] | — (re-export from ThemeProvider) | `{ mode, toggleMode }` | N/A |

## Error Handling Convention

Hooks silently return empty state on Firestore errors (missing collection, permission error, not configured yet). This prevents the UI from crashing before Firestore is set up. Only `useProject` and `useOutput` expose an `error` field to the consumer.

## Pages in This Section

- [[Hooks Overview]] (this page)
- [[Hook - useProject]]
- [[Hook - useOutput]]
- [[Hook - useOutputExistence]]
- [[Hook - useArtifactPreviews]]
- [[Hook - useHookScores]]
- [[Hook - useToneCheck]]
- [[Hook - useBudget]]
- [[Hook - useRecentProjects]]
- [[Hook - useCopyToClipboard]]
- [[Hook - useProjectCost]]
- [[Hook - useMonthlyRefunds]]
- [[Hook - useProjectRefunds]]
- [[Hook - useC2PAManifests]]
- [[Hook - useSourceContent]]
- [[Hook - useTheme]]
