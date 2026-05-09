---
type: concept
domain: ui
source_file: app/globals.css, src/lib/theme/motion.ts
created: 2026-04-11
updated: 2026-04-11
status: current
tags:
  - concept
  - ui
  - design-system
related:
  - "[[Wiki/Components/Component - Layout]]"
  - "[[Wiki/Components/Component - UI Kit]]"
sources:
  - "[[Sources/Memory/codebase_architecture]]"
  - "[[Sources/Memory/ui_redesign_gemini]]"
---

# Glass Morphism Theme

> Zapocalypse uses a unified CSS variable system based on `--glass-*` custom properties. All components reference these vars. `--md-sys-color-*` tokens are fully removed.

## CSS Variable Groups

### Background
```css
--glass-bg            /* primary surface */
--glass-bg-secondary  /* inset / muted surface */
--glass-bg-tertiary   /* deepest background */
```

### Text
```css
--glass-text            /* primary text */
--glass-text-secondary  /* secondary / supporting text */
--glass-text-tertiary   /* muted / disabled text */
```

### Surface & Structure
```css
--glass-surface   /* elevated card background (with blur) */
--glass-border    /* 1px border color for cards and dividers */
--glass-blur      /* backdrop-filter: blur() intensity */
```

### Semantic
```css
--glass-accent   /* primary brand accent (CTA, links, progress fill) */
--glass-danger   /* error states, kill-switch, budget exceeded */
```

## Dark / Light Mode

`ThemeProvider` reads `localStorage.getItem("zapocalypse-theme")` on mount. Defaults to `"dark"` for hydration safety. A FOUC-prevention script in `app/layout.tsx` applies the saved theme before React loads.

Both modes are defined in `app/globals.css` via `.dark` and `:root` (or `.light`) class scopes.

**Warning:** Do NOT remove `BackgroundElements`. Do NOT alter CSS opacities. (Gemini handover note — these are load-bearing for the glass morphism aesthetic.)

## CSS Classes

```css
.glass           /* standard glass card: semi-transparent bg + blur + border */
.glass-elevated  /* elevated variant: higher opacity + deeper shadow */
```

Used throughout: `Card` component applies `"glass"` or `"glass-elevated"`. Hero sections use `glass-elevated rounded-3xl`.

## Spring Animation Presets

Defined in `src/lib/theme/motion.ts` and exposed as CSS custom properties:

```typescript
// motion.ts — CSS linear() spring presets
export const SPRING_PRESETS = {
  snappy: "linear(...)",   // --spring-snappy
  gentle: "linear(...)",   // --spring-gentle
  bouncy: "linear(...)",   // --spring-bouncy
}
```

```css
/* app/globals.css — keyframes */
@keyframes card-reveal { ... }   /* .animate-card-reveal */
@keyframes badge-pop   { ... }   /* .animate-badge-pop */
@keyframes slide-in    { ... }   /* .animate-slide-in */
```

**Why no Framer Motion:** `linear()` timing functions approximate spring physics in pure CSS — zero runtime JS overhead, no ~30KB bundle cost.

## Decision Rationale

- `--md-sys-color-*` tokens were fully removed. They required `tailwind-material-colors` plugin which doesn't exist in Tailwind v4 (CSS-first, no plugin system).
- Tailwind v4 `@theme` block maps `--glass-*` vars to Tailwind utilities.
- `ThemeProvider` uses `@material/material-color-utilities` to generate a brand M3 palette from a user-configured brand color (stored in `localStorage("zapocalypse-brand-color")`).

## Cross-References

- Theme components: [[Component - Layout]] (`ThemeProvider`, `BackgroundElements`, `ThemeToggle`)
- Used in: all components — [[Component - UI Kit]], [[Component - OutputTabs]], [[Wiki/Components/Component - Budget UI]], etc.
- Decision: [[Wiki/Decisions/Decisions - AI and Model Selection]] (Tailwind v4, CSS vars)
