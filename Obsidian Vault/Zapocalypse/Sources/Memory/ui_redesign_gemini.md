# Gemini UI Redesign Handover

> **Date:** March 22, 2026
> **Agent:** Gemini (Antigravity)
> **Purpose:** Document structural UI changes made during the Glass Morphism redesign so Claude is fully aware of the new aesthetic and logic constraints.

---

## 1. True Glass Morphism Theme Engine
The application's theme variables in `app/globals.css` were completely overhauled for a high-contrast, physical glass aesthetic.

### Dark Mode (Default)
- **Background**: Pure Black (`#000000`).
- **Surfaces**: Delicate semi-transparent white frosted glass.

### True Light Mode (White Canvas)
- **Background**: Bright White (`#f9f9fb`).
- **Surfaces**: Deeply frosted translucent white panels (`rgba(255, 255, 255, 0.25)`) with highly visible `100px` blur and sharp white borders (`rgba(255, 255, 255, 0.7)`).
- **Text**: Transitions to `#1d1d1f` for high contrast against the bright frosted glass.

## 2. Adaptive Background Orbs
Created `src/components/layout/BackgroundElements.tsx` to render floating orbs that refract through the glass.
- Employs dynamic CSS variables (`--orb-1`, `--orb-2`, `--orb-3`) in `globals.css`.
- **In Dark Mode**: The orbs are faint white `rgba(255, 255, 255, 0.05)`.
- **In Light Mode**: The orbs flip to heavy dark gray shadows `rgba(0, 0, 0, 0.16)` to provide massive depth underneath the white frosted panels.

## 3. Logo Refactoring
The logo rendering in `src/components/layout/AppShell.tsx` was refactored.
- Replaced the hardcoded inline SVG icon with Next.js `<Image>` tags.
- The assets used are `public/logos/dark-logo-transparent.png` and `public/logos/light-logo-transparent.png`.
- Because CSS `mix-blend-mode` notoriously fails to blend down through `backdrop-filter: blur` stacking contexts (like our glass header), we do **not** use CSS blend modes.
- Instead, the original solid PNG files were mathematically processed via a Node `sharp` script to extract their luminance into a genuine alpha-channel, creating perfectly anti-aliased, genuinely transparent files that drop seamlessly into the navigation bar.

## 4. Progress Indicator Fix
- **File**: `src/components/pipeline/ProgressIndicator.tsx`
- **Issue fixed**: The "Complete" stage incorrectly stayed in the active spinning state due to an index mismatch.
- **Fix applied**: Redefined `isActive = step.key === status && status !== "complete";` and `isDone` so that triggering `complete` correctly halts the spinner and renders the final checkmark for all nodes.

### ⚠️ Instructions for Claude
- **Do NOT** alter the CSS variable opacities or blurs in `globals.css` without extreme caution; they are finely tuned for physical glass modeling.
- **Do NOT** revert `AppShell.tsx` to rendering the raw SVG; the new discrete PNG files are the source of truth for the logo mark.
- **Do NOT** append hardcoded `text-white` or `bg-black` utility classes on structural wrappers; always rely on `var(--glass-text)` and `var(--glass-bg)` or `glass-elevated` utility classes so both modes adapt dynamically.

## 5. Mobile & Edge-Case Optimizations
- **Horizontal Scrollbars Erased**: Added a global `.scrollbar-hide` utility in `globals.css` and applied it to `OutputTabs.tsx` to ensure invisible track scrolling.
- **Tweet Carousel Wrapping**: Replaced the scrollable carousel navigation with `flex-wrap justify-center` in `TweetCarousel.tsx` so thread numbers physically wrap onto a second line and remain perfectly centered on mobile grids.
- **Header Crowding Strategy**: `BudgetIndicator.tsx` purposefully crushes text strings on `< sm` breakpoints to fit a tiny `$0.00` badge, and `AppShell.tsx` enforces `whitespace-nowrap` on header buttons. 
- **Component Padding**: The heavy `p-12` and `rounded-[2.5rem]` properties on form elements have `sm:` scaling to drop down smartly so they don't consume the entire phone viewport.

## 6. Native Previews System
- **Location**: `src/components/output/native/*.tsx`
- **Logic**: Decoupled "Glass Mode" (Left Navbar) and "Native Mode" (Right Navbar) toggles in `OutputTabs.tsx`.
- **Theming Constraint**: Native previews do NOT use Tailwind's raw `dark:` pseudo-classes to prevent relying on the OS setting. Instead, they explicitly read the manual `useTheme()` mode and flip `isDark ? ... : ...` to guarantee exact replication of authentic platform hex codes (e.g. Slack `#1A1D21`, LinkedIn `#1b1f23`).
- **Icons**: We strictly use authentic structural vector outlines (like exact LinkedIn Share arrays or Lucide `Repeat` pathways) instead of heavy filled shapes.
- **Responsiveness**: Heavy use of `hidden sm:inline`, `gap-1 sm:gap-1.5`, and `p-4 sm:p-8` scales Native interfaces down securely so they don't snap out-of-bounds on tight screens.
