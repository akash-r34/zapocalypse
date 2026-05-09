---
type: entity
entity_kind: component
domain: ui
source_file: src/components/layout/
created: 2026-04-11
updated: 2026-04-18
status: current
tags:
  - entity
  - component
  - ui
  - layout
related:
  - "[[Wiki/Concepts/Glass Morphism Theme]]"
  - "[[Wiki/Hooks/Hook - useTheme]]"
  - "[[Wiki/Infrastructure/Auth & Firestore Security]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/ui_redesign_gemini]]"
---

# Component - Layout

> App shell, background, and theme components that wrap the entire application.

## `AppShell`

```typescript
// src/components/layout/AppShell.tsx
interface AppShellProps { children: ReactNode }
```

Renders:
- **Header**: logo + `BudgetIndicator` + `ThemeToggle` + sign-out icon button + "New Project" button
- **Main content area**: `<main>` with padding
- **`BackgroundElements`**: floating adaptive background orbs

Uses `useAuth()` from `src/lib/auth/AuthContext.tsx`. Sign-out button appears when user is signed in; calls `signOut()` on click. Title attribute shows signed-in email.

## `ThemeProvider`

```typescript
// src/components/layout/ThemeProvider.tsx
export function ThemeProvider({ children }: { children: ReactNode })
export function useTheme(): { mode: "light" | "dark"; toggleMode: () => void }
export const ThemeContext: Context<ThemeContextValue | null>
```

Provides `ThemeContext`. Always starts `"dark"` (hydration-safe — FOUC script in `layout.tsx` handles visual correction before React loads). After mount reads `localStorage.getItem("zapocalypse-theme")`.

## `BackgroundElements`

Floating orbs with `backdrop-filter: blur()` and adaptive colors based on theme mode. 

**Warning**: Do NOT remove these. Do NOT alter CSS opacities. (Gemini handover note.)

## `ThemeToggle`

Small icon button. Calls `toggleMode()` from `useTheme()`. Sun/moon icon based on current mode.

## `AuthGate`

```typescript
// src/components/auth/AuthGate.tsx
interface AuthGateProps { children: ReactNode }
```

Full-screen auth state handler. Three render branches:
- `loading` → centered spinner (border-t-transparent animate-spin)
- `signed-out` | `forbidden` → sign-in card (wordmark + Google popup button; "not authorized" copy on `forbidden`)
- `signed-in` → renders `{children}`

Mounted via per-route layout files: `app/dashboard/layout.tsx`, `app/create/layout.tsx`, `app/projects/layout.tsx`, `app/project/[projectId]/layout.tsx`. The marketing route group `(marketing)` has no gate — landing page is public.

## Route Gate Layouts (new — V3.9.1)

Four thin `"use client"` layout files that each wrap `{children}` in `<AuthGate>`:

| Layout file | Route protected |
|-------------|----------------|
| `app/dashboard/layout.tsx` | `/dashboard` |
| `app/create/layout.tsx` | `/create` |
| `app/projects/layout.tsx` | `/projects` |
| `app/project/[projectId]/layout.tsx` | `/project/[id]` and nested output route |

`AuthProvider` is mounted in `app/layout.tsx` (root, inside `ThemeProvider`) — auth context is available everywhere including marketing pages.

## Cross-References

- Theme system: [[Wiki/Concepts/Glass Morphism Theme]]
- Theme hook: [[Hook - useTheme]]
- Budget header: [[Component - Budget UI]]
- Auth architecture: [[Wiki/Infrastructure/Auth & Firestore Security]]
