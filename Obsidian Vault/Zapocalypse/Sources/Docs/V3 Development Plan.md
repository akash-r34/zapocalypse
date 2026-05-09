# Zapocalypse V3 Development Plan

> **Generated:** 2026-03-26
> **Revised:** 2026-03-28 — Expert critique integrated (additive tone fingerprinting, tiered refunds, intelligence-first phase ordering)
> **Revised:** 2026-04-05 — Implementation reality appendix added (Phases 1–5 plan vs. execution divergences)
> **Based on:** V3 Market Research + full V1–V2 codebase audit + expert critique transcript
> **Status:** Phases 1–5 complete. Phase 6 (Multimodal) next.

## V3 Executive Summary

Zapocalypse V3 transforms the product from a single-user content generation tool into a **creator-grade content intelligence platform** that addresses the 2026 "vibe-to-value" gap identified in market research. V3's deployment strategy **leads with AI intelligence upgrades** — predictive virality scoring and additive tone fingerprinting ship first, immediately elevating output quality and building the data flywheel that makes the system smarter with every interaction. Only after the core engine produces demonstrably superior content does the plan invest in UX polish, credit mechanics, and business infrastructure. This sequence ensures beta testers interact with a *meaningfully better* tool from day one, not a prettier wrapper around V2's output.

The plan addresses three critical weaknesses identified in expert review:
1. **Subtractive → Additive tone fingerprinting:** The system shifts from filtering out "slop" to actively mapping and amplifying each creator's unique linguistic markers
2. **Decoupled cost architecture:** Heavy multimodal extraction costs are separated from cheap synthesis costs, preventing the "token trap" where successful extraction is refunded due to downstream failures
3. **Intelligence-first deployment:** AI pipeline upgrades ship before UX and credit systems, building user trust through output quality rather than interface polish

The plan is structured across 8 independently-deployable phases — each shipping a complete, working product.

---

## Research-to-Implementation Mapping

| V3 Research Insight | Already in V2? | V3 Phase |
|---|---|---|
| Information Gain Auditor | ✅ Analyst Agent | — |
| GEO Answer Block Structuring | ✅ All platforms | — |
| Dark Social Optimization | ✅ Slack/Discord outputs | — |
| Predictive Virality | ✅ Hook Scoring Agent + Leaderboard | Phase 1 |
| One-Click Reflexion Loop | ✅ "Not my voice" + selective regen | Phase 2 |
| Invisible Player Interface | ✅ OverflowMenu + smart input | Phase 3 |
| Progressive Disclosure | ✅ Progressive tab reveal + ProgressRing | Phase 3 |
| Artifact-Based Verification | ✅ Artifact preview cards on dashboard | Phase 3 |
| Fair-Play Credit System | ✅ Tiered refunds + preflight + CostBreakdown | Phase 4 |
| C2PA Digital Proof Signer | ✅ ECDSA P-256 signed (not c2pa-node — see Phase 5 divergence notes) | Phase 5 |
| Multimodal Scene-Aware Input | ❌ | Phase 6 |
| Hibernation Plan | ❌ | Phase 7 |
| Usage-Based Hybrid Model | ❌ | Phase 7 |
| Loyalty Loops / Streaks | ❌ | Phase 7 |
| Ethical Cancellation | ❌ | Phase 7 |
| Firebase Auth | ❌ | Phase 7 |
| Agentic Scheduler | ❌ | Phase 8 |

### Conflicts Between Research Doc and Current Implementation

| Conflict | Resolution |
|---|---|
| Research says "C2PA cryptographic signing" — V2 has metadata-only SHA-256 | Phase 5 uses ECDSA P-256 signing via Node.js `crypto` (not `c2pa-node` — C2PA spec targets binary media, not JSON text). Real `c2pa-node` signing deferred to Phase 6 for Veo video assets. |
| Research references "Gemini 3.1 Pro" — this model doesn't exist | Use `gemini-2.5-pro` or `gemini-2.5-flash` with vision capabilities (both support multimodal input). Model controlled by env var as always. |
| Research recommends "multi-account scheduler" with TikTok/Instagram APIs — these require app review and OAuth | Phase 8 (last phase) — highest effort, highest external dependency risk. Start with X/LinkedIn APIs which have simpler developer access. |
| Research says "pay-as-you-go credits" — current system tracks cost but has no user accounts | Phase 7 adds Firebase Auth first, then builds credit system on top. Cannot do credits without users. |

---

## Phase 1: Predictive Virality & Hook Scoring

**Goal:** Replace generic "virality scores" with audience-specific hook predictions, so creators know which content will resonate with *their* niche before publishing. This is the highest-leverage, lowest-risk intelligence upgrade — it runs as a fault-tolerant post-synthesis agent that immediately elevates the perceived intelligence of the platform.

**Research Justification:**
- Pain Point #9 (Hallucinated Virality): "Viral according to AI might not mean viral for YOUR audience"
- Trend #3: "Move from 'what happened' to 'what will happen.' Use sentiment analysis to predict which hook will resonate"
- Pain Point #2 (Context-Blind Clipping): Better scoring means better hook selection

**Why Phase 1 (Expert Critique):** Deploying virality scoring first is a strategically low-risk move. It runs as an isolated, non-blocking, fault-tolerant agent — if it fails, the main pipeline completes unaffected. But when it succeeds, it appends data that *proves to the user the tool understands their niche audience*, immediately differentiating V3 from V2. This is the fastest path to demonstrating intelligence.

**Features & Changes:**

- **Hook scoring agent:** New post-synthesis agent that scores each generated hook (tweet hooks, LinkedIn hooks, newsletter subject) on 4 dimensions: novelty, emotional resonance, niche relevance, shareability. Scores are 1-10 with a brief explanation.
- **Audience-anchored scoring:** The scorer uses the SKO's `audience_persona` (primary, pain_points, desired_outcomes) to evaluate hooks against the *specific* target audience, not generic engagement.
- **Hook leaderboard UI:** Visual ranking of all hooks across platforms sorted by composite score. Stars/badges for top 3. Helps creators quickly identify their strongest content.
- **A/B hook suggestions:** For each platform's top hook, generate one alternative hook variant. Creator can swap between original and variant.
- **Score integration in output previews:** Each tweet, LinkedIn post, etc. shows its hook score inline (small badge) so creators can prioritize which content to post first.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/lib/pipeline/agent-score-hooks.ts` | Hook scoring agent: evaluates all hooks against audience persona |
| `src/lib/ai/prompts/score-hooks.ts` | Prompt template for hook scoring with 4-dimension rubric |
| `src/lib/ai/schemas/hook-score.ts` | Zod schema: `HookScoreSchema` with per-hook scores and explanations |
| `src/components/output/HookLeaderboard.tsx` | Cross-platform hook ranking with scores and star badges |
| `src/components/output/HookScoreBadge.tsx` | Inline score badge for individual hooks |
| `src/hooks/useHookScores.ts` | Firestore onSnapshot for `projects/{id}/hook_scores/current` |

**Files to Modify:**
| File | Change |
|---|---|
| `src/lib/pipeline/orchestrator.ts` | Add hook scoring step after synthesis (fault-tolerant, like Analyst) |
| `src/lib/firestore/helpers.ts` | Add `writeHookScores()` helper |
| `src/types/project.ts` | Add `"scoring"` to PipelineStatus; add `score?` to agentTimings |
| `src/components/output/TweetCarousel.tsx` | Show HookScoreBadge per tweet |
| `src/components/output/LinkedInPreview.tsx` | Show HookScoreBadge per post |
| `src/components/output/OutputTabs.tsx` | Add HookLeaderboard as a new summary tab |
| `src/components/pipeline/AgentProgressPanel.tsx` | Add "Hook Scorer" step |
| `app/project/[projectId]/page.tsx` | Render HookLeaderboard section |

**Files to Leave Untouched:**
- All existing agents (ingest, analyze, extract, synthesize, authenticate)
- AI schemas for outputs (twitter, linkedin, etc.) — scores are stored separately
- Budget system (hook scorer uses existing checkBudget/recordCost)
- Native preview components
- Theme/layout

**Dependencies:** None new.

**Breaking Changes:**
- **Pipeline state machine expansion:** New `scoring` state between `synthesizing` and `authenticating`. State machine becomes: `idle → ingesting → analyzing → extracting → synthesizing → scoring → authenticating → complete`. Existing projects without this state will still work (the state is simply skipped in their history).

**Acceptance Criteria:**
1. Each tweet, LinkedIn post, and newsletter subject has a 4-dimension hook score (novelty, emotional resonance, niche relevance, shareability)
2. Hook scores are anchored to the project's audience persona (not generic)
3. Hook leaderboard shows all hooks ranked by composite score with top 3 highlighted
4. Hook scoring is fault-tolerant: if it fails, pipeline still completes (like Analyst)
5. Hook scoring cost is tracked and shows in cost breakdown

**Risks & Mitigations:**
- **Risk:** Hook scoring adds latency to the pipeline (extra Gemini call) → **Mitigation:** Use `gemini-2.5-flash` (fast/cheap); fault-tolerant so it can be skipped without blocking
- **Risk:** Scores may feel arbitrary → **Mitigation:** Each score includes a one-sentence explanation grounding it in the audience persona

---

## Phase 2: Reflexion Loop, Additive Tone Fingerprinting & Selective Regeneration

**Goal:** Let creators refine their voice through an additive fingerprinting model that captures *what makes them unique*, not just what to avoid. Enable selective regeneration of specific outputs with an enriched tone fingerprint, eliminating wasted cycles on the full pipeline.

**Research Justification:**
- UX Rec #3: "One-Click Reflexion Loop — button that allows the user to say 'This isn't my voice,' triggering the agent to reflect on the failure and update the Tone Fingerprint"
- Pain Point #4 (AI Slop): Reflexion directly combats generic-sounding output
- Pain Point #1 (Credit Trap): Selective regeneration avoids re-running the entire pipeline

**Why Phase 2 (Expert Critique — Additive Fingerprinting):** The experts identified the most fundamental architectural weakness in V2: **the tone system is purely subtractive**. The Authenticator agent scans for slop patterns (generic openers, excessive hedging, corporate filler) and zeroes them out. But negative prompting is inefficient for LLMs — removing bad habits doesn't generate a unique personality. It generates content that "offends no one and excites no one." The fix is to shift to an **additive model** that maps positive linguistic markers during SKO extraction and uses them as generation targets. Deploying early allows beta testers to begin training their persistent brand models immediately, building the data flywheel — every interaction makes the system smarter.

**Architectural Pivot — Additive Tone Fingerprinting:**

The current `brand_tone_fingerprint` in the SKO stores high-level descriptors (`voice`, `vocabulary_level`, `humor_quotient`, `sentence_style`). This is extended with a **rich positive marker object** that gives the LLM's attention mechanism a target to hit:

```typescript
// New additive fields added to brand_tone_fingerprint
interface AdditiveFingerprint {
  analogy_style: string;          // e.g. "explains technical concepts using mechanical metaphors"
  sentence_cadence: "low" | "medium" | "high"; // variance spectrum, NOT word counts
  signature_phrases: string[];     // recurring expressions unique to this creator
  storytelling_structure: string;  // e.g. "opens with personal anecdote, pivots to data"
  humor_type: string;             // e.g. "dry self-deprecation with industry in-jokes"
  colloquialisms: string[];       // niche-specific informal terms they use
  explanation_pattern: string;    // how they break down complex topics
}
```

**Key implementation detail:** Don't ask Gemini to *count* sentence lengths (LLMs are bad at counting). Instead, ask it to *categorize* cadence variance on a spectrum using few-shot prompting: "Analyze the cadence. Is the variance low (uniform sentence lengths), medium, or high (alternating very short and very long sentences)?"

**Features & Changes:**

- **Additive extraction during SKO phase:** Update the extract agent prompt to explicitly instruct Gemini to map positive linguistic traits from the source content. During SKO extraction, the model categorizes analogy style, sentence cadence variance (on a spectrum, not counted), signature phrases, storytelling structure, humor type, and niche colloquialisms. These are serialized into an enriched `brand_tone_fingerprint` in the SKO.
- **Dynamic additive feedback buttons:** Instead of negative quick-select options ("too formal", "too generic"), the feedback form pulls from the user's additive fingerprint to offer *positive* dynamic options: "Needs more of my specific humor", "Use my typical storytelling pacing", "Add my signature analogies". The user guides the AI toward their voice, not just away from generic output.
- **Tone fingerprint refinement agent:** New lightweight agent that takes the enriched `brand_tone_fingerprint` + user's positive feedback → produces an updated fingerprint with strengthened markers. Runs through Gemini (cheap — input is small).
- **Selective platform regeneration:** Re-run synthesis for a single platform using the updated tone fingerprint. Does NOT re-run ingest, analyze, or extract. Reads existing SKO from Firestore.
- **Regeneration cost tracking:** Each regeneration is budget-checked and cost-tracked independently. Shows up in cost breakdown as "Regen: Twitter".
- **Tone history:** Store tone refinements in `projects/{id}/tone_history` subcollection so the system learns across regenerations within a project. This data feeds Phase 7's persistent brand voice.
- **Visual diff (optional stretch):** Show what changed between original and regenerated output (highlight new/modified tweets or posts).

**Files to Create:**
| File | Purpose |
|---|---|
| `src/lib/pipeline/agent-refine-tone.ts` | Lightweight agent: enriched fingerprint + positive feedback → updated fingerprint with strengthened markers |
| `src/lib/ai/prompts/refine-tone.ts` | Prompt template for additive tone refinement (strengthen markers, not just avoid negatives) |
| `src/lib/pipeline/regenerate.ts` | Selective regeneration: reads SKO from Firestore, re-runs single platform synthesis with updated fingerprint |
| `src/components/output/FeedbackForm.tsx` | Additive feedback UI with *dynamic* positive options pulled from user's fingerprint + free text |
| `src/components/output/RegenerationIndicator.tsx` | Shows regeneration status (spinning) and "v2" badge on regenerated outputs |
| `src/app/api/pipeline/regenerate/route.ts` | POST endpoint: `{ projectId, platform, feedback }` → triggers selective regeneration |

**Files to Modify:**
| File | Change |
|---|---|
| `src/lib/ai/schemas/sko.ts` | Extend `brand_tone_fingerprint` with additive fields: `analogy_style`, `sentence_cadence`, `signature_phrases`, `storytelling_structure`, `humor_type`, `colloquialisms`, `explanation_pattern` (all optional for backwards compat) |
| `src/lib/ai/prompts/extract.ts` | Add explicit instructions for Gemini to map positive linguistic traits during SKO extraction. Use few-shot examples for cadence categorization on a spectrum |
| `src/lib/ai/prompts/synthesize.ts` | Accept optional `refinedFingerprint` parameter that overrides `brand_tone_fingerprint`; use additive markers as generation targets in the prompt |
| `src/lib/firestore/helpers.ts` | Add `readSKO()`, `writeToneRefinement()`, `writeRegeneratedOutput()` helpers |
| `src/components/output/OutputTabs.tsx` | Add "Refine my voice" button per tab; show RegenerationIndicator during regen |
| `src/components/output/TweetCarousel.tsx` | Accept `onFeedback` callback prop; show "v2" badge if regenerated |
| `src/components/output/LinkedInPreview.tsx` | Same feedback/badge treatment |
| `src/components/output/NewsletterPreview.tsx` | Same |
| `src/components/output/DarkSocialPreview.tsx` | Same |
| `src/types/project.ts` | Add `regenerationCount?: number` to Project; add `ToneRefinement` type; add `AdditiveFingerprint` type |

**Files to Leave Untouched:**
- `orchestrator.ts` — regeneration is a separate flow, not part of the main pipeline
- All existing agents (ingest, analyze, authenticate) — only extract prompt changes
- Budget tracker/kill-switch — regeneration calls `checkBudget()` using existing tracker
- Native preview components
- Theme/layout

**Dependencies:** None new.

**Breaking Changes:**
- **SKO schema expansion:** New optional additive fields on `brand_tone_fingerprint`. Non-breaking — existing SKOs without these fields work fine (all fields optional). V2 projects simply won't have enriched fingerprints.
- Regeneration is an entirely additive flow. Original outputs are preserved; regenerated outputs overwrite the platform doc in Firestore (with a `regeneratedAt` timestamp).

**Acceptance Criteria:**
1. SKO extraction produces enriched `brand_tone_fingerprint` with positive linguistic markers (analogy style, sentence cadence, signature phrases, etc.)
2. Feedback form offers *dynamic positive options* derived from the user's fingerprint (e.g., "Needs more of my mechanical metaphors") — NOT just negative options like "too generic"
3. User can click "Refine my voice" on any platform tab, provide additive feedback, and trigger regeneration of that single platform
4. Regeneration only re-runs synthesis for the selected platform (does NOT re-run ingest/analyze/extract)
5. Budget is checked before regeneration; cost is tracked separately in cost_log as "Regen: {platform}"
6. Regenerated output replaces the original in the UI with a "Regenerated" badge
7. Tone refinement feedback is stored in `projects/{id}/tone_history` for audit and future persistent brand voice (Phase 7)

**Risks & Mitigations:**
- **Risk:** Gemini may not reliably extract granular traits like sentence cadence → **Mitigation:** Use spectrum categorization (low/medium/high) with few-shot prompts, NOT numerical counting. LLMs categorize well; they count poorly.
- **Risk:** Regenerated output may be worse than original → **Mitigation:** Store original output before overwriting; add "Revert to original" option in a future iteration
- **Risk:** Users spam regeneration burning budget → **Mitigation:** Cap at 3 regenerations per platform per project; show remaining regen count
- **Risk:** Additive fingerprint too verbose for synthesis prompt context window → **Mitigation:** Cap fingerprint at 500 tokens; refinement agent summarizes if needed

---

## Phase 3: UX Clarity & Progressive Disclosure

**Goal:** Eliminate "Timeline Fatigue" by simplifying the interface so creators spend time reviewing content, not navigating UI.

**Research Justification:**
- Pain Point #6: "Most of my frustration wasn't the AI, it was the UI getting in the way"
- UX Rec #1: "Invisible Player Interface — Hide all secondary controls unless the user hovers"
- UX Rec #2: "Progressive Disclosure — only reveal Spokes once the Semantic Hub is processed"
- UX Rec #4: "Artifact-Based Verification — screenshots or 5-second video vibes for quick visual approval"

**Why Phase 3 (Expert Critique):** The experts argued that deploying a "shiny wrapper around a legacy engine" is a massive deployment risk. If the text output isn't demonstrably better, a frictionless UI won't keep users from churning. Phases 1–2 ensure the core engine produces superior output *first*. Now the UX can wrap a genuinely improved product — "you lead with unparalleled output quality, which builds the exact user trust you need to justify the UI polish."

**Features & Changes:**

- **Progressive output reveal:** OutputTabs currently renders all 5 platform tabs immediately. Change to reveal tabs one-by-one as each synthesis completes (Firestore `onSnapshot` already streams per-platform). Show a skeleton/placeholder for pending platforms.
- **Artifact cards on dashboard:** Replace the plain text project list on the dashboard with visual "artifact cards" — show the first tweet text, LinkedIn hook, and newsletter subject as a 3-line preview snippet so users can visually scan without clicking in.
- **Collapsible secondary controls:** In output previews (TweetCarousel, LinkedInPreview, etc.), collapse copy/download/metadata actions behind a "..." overflow menu by default. Show primary action (copy) always; hide download, JSON view, etc. behind hover/tap.
- **Streamlined create page:** Reduce the 3-mode chip selector (URL/Text/File) to a single smart input that auto-detects: if it starts with `http`, treat as URL; if it's a file drop, treat as file; otherwise treat as text. Keep manual override as a small toggle.
- **Pipeline progress simplification:** Replace the 5-step horizontal stepper with a single animated progress ring (percentage-based) and a one-line status label. The detailed AgentProgressPanel moves to an expandable "Details" section.
- **Fix stale CSS vars:** `app/loading.tsx`, `app/error.tsx`, and `app/project/[projectId]/error.tsx` use dead `--md-sys-color-*` variables. Migrate to `--glass-*` tokens.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/components/ui/OverflowMenu.tsx` | Popover menu for secondary actions (copy JSON, download, etc.) |
| `src/components/pipeline/ProgressRing.tsx` | Animated SVG circular progress indicator with percentage |
| `src/components/dashboard/ProjectArtifactCard.tsx` | Visual preview card for dashboard project list |

**Files to Modify:**
| File | Change |
|---|---|
| `src/components/output/OutputTabs.tsx` | Progressive tab reveal as outputs arrive; skeleton placeholders |
| `src/components/output/TweetCarousel.tsx` | Move download/JSON actions into OverflowMenu |
| `src/components/output/LinkedInPreview.tsx` | Move secondary actions into OverflowMenu |
| `src/components/output/NewsletterPreview.tsx` | Move secondary actions into OverflowMenu |
| `src/components/output/VeoPreview.tsx` | Move secondary actions into OverflowMenu |
| `src/components/output/DarkSocialPreview.tsx` | Move secondary actions into OverflowMenu |
| `src/components/pipeline/InputForm.tsx` | Smart auto-detect input mode; keep manual override |
| `app/page.tsx` | Replace project list with ProjectArtifactCard grid |
| `app/project/[projectId]/page.tsx` | Swap stepper for ProgressRing; make AgentProgressPanel collapsible |
| `app/loading.tsx` | Migrate from `--md-sys-color-*` to `--glass-*` CSS vars |
| `app/error.tsx` | Migrate from `--md-sys-color-*` to `--glass-*` CSS vars |
| `app/project/[projectId]/error.tsx` | Migrate from `--md-sys-color-*` to `--glass-*` CSS vars |

**Files to Leave Untouched:**
- All `src/lib/pipeline/` agent files — no pipeline logic changes
- All `src/lib/ai/` files — no AI changes
- `src/lib/budget/` — no budget changes
- `src/lib/firebase/` — no backend changes
- `src/components/layout/ThemeProvider.tsx`, `AppShell.tsx`, `BackgroundElements.tsx` — layout stable
- All native preview components (`src/components/output/native/`) — untouched

**Dependencies:** None new.

**Breaking Changes:** None. All changes are additive UI refactors.

**Acceptance Criteria:**
1. Output tabs appear one-by-one as each platform synthesis completes (not all at once)
2. Dashboard shows visual artifact cards with content preview snippets
3. Secondary actions (download, JSON copy) are hidden behind overflow menu; primary copy button remains visible
4. `app/loading.tsx`, `app/error.tsx`, `app/project/[projectId]/error.tsx` render correctly with glass theme (no broken CSS vars)
5. Smart input auto-detects URL vs text without requiring manual chip selection

**Risks & Mitigations:**
- **Risk:** Progressive tab reveal may flash/reorder if outputs arrive nearly simultaneously → **Mitigation:** Use a fixed tab order; show skeleton in each slot; fill as data arrives
- **Risk:** Smart input auto-detect may misfire on text that starts with "http" as a word → **Mitigation:** Validate with URL constructor; fall back to text mode on parse failure

---

## Phase 4: Fair-Play Credit System, Tiered Refunds & Cost Transparency

**Goal:** Build creator trust by making costs visible, automatically refunding credits wasted on failed generations, and protecting compute margins through decoupled cost tracking and pre-flight validation.

**Research Justification:**
- Pain Point #1 (The "Credit Trap"): "80% of 'trash' clips we have to regenerate... not to mention the cost in credits!!"
- Feature Rec: "Fair-Play Credit System — Automatically refund credits for any generation flagged as a snag or error"
- Monetization: "Usage-Based Hybrid Model" foundation

**Why Revised (Expert Critique — Token Trap & Tiered Refunds):** The experts identified a critical hidden tension: the fair-play "refund everything on failure" model collides with heavy multimodal processing. Consider the scenario: the pipeline successfully extracts a video file (expensive — 10 vision frames, audio transcription, heavy Gemini tokens). The SKO is built. Then synthesis fails on *one* platform (LinkedIn context overflow). The fair-play system refunds the *entire* project cost — but the most expensive compute (multimodal extraction) succeeded perfectly. **You eat the massive extraction cost while delivering zero value to the user.** The fix is two-fold: (1) decouple extraction costs from synthesis costs, and (2) add a pre-flight validation step to catch bad inputs before committing to expensive processing.

**Features & Changes:**

- **Per-project cost display:** Read from existing `projects/{id}/cost_log` subcollection (already written by `tracker.ts`). Show total cost per project on the project page and on dashboard artifact cards.
- **Tiered refund logic (NEW):** Instead of refunding the entire project cost on failure, implement **stage-aware refunds**:
  - If pipeline fails during *ingest/extract*: full refund (no value delivered)
  - If pipeline fails during *synthesis* (via `Promise.allSettled` rejection): refund only the failed platform's synthesis cost. **Retain a micro-charge for the successful extraction** and save the SKO as a user-owned asset.
  - The SKO becomes visible on the user's dashboard as "Source material processed — regenerate for fewer credits"
- **SKO-as-asset partial success UI (NEW):** When synthesis fails but extraction succeeds, instead of a generic "Generation failed" error, show: "Your source material has been successfully processed and saved to your library. The [platform] formatting failed. Here is a refund for the generation step. Click to regenerate — no re-upload needed." This transforms a complete failure into a minor inconvenience.
- **Pre-flight validation step (NEW):** Before the main extraction agent spins up for expensive inputs (video files, large documents), run a lightweight pre-flight check using `gemini-2.5-flash-8b` (cheapest model). Pass just the transcript header or a single middle frame and verify: (a) the file is parseable, (b) there is actual human dialogue present, (c) the content has enough substance to generate from. If a video is 3 minutes of silent screen recording, the pre-flight fails it immediately — *before* deducting the full credit or committing to the heavy 10-keyframe Gemini call.
- **Auto-refund on pipeline error:** When pipeline status transitions to `error`, trigger stage-aware refund logic (not blanket refund).
- **Cost breakdown panel:** New expandable panel on project page showing per-agent token usage and cost (Ingest: $0.002, Analyze: $0.001, Extract: $0.003, Synthesize: $0.008, Authenticate: $0.001).
- **Budget history chart:** Simple sparkline on the dashboard budget section showing daily spend over the current month (aggregate from cost_log timestamps).
- **"Fair-Play" badge:** Visual indicator on refunded projects showing "Credits refunded" with the specific amount and reason.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/components/budget/CostBreakdown.tsx` | Per-agent cost breakdown panel for project page |
| `src/components/budget/SpendChart.tsx` | Monthly spend sparkline for dashboard |
| `src/components/budget/RefundBadge.tsx` | "Credits refunded" visual indicator with reason |
| `src/hooks/useProjectCost.ts` | Hook to read `projects/{id}/cost_log` subcollection and aggregate |
| `src/lib/budget/refund.ts` | **Tiered** refund logic: stage-aware calculation, partial refund for synthesis-only failures, SKO retention |
| `src/lib/pipeline/preflight.ts` | Lightweight pre-flight validation: small model check on input quality before heavy extraction |
| `src/components/dashboard/SKOAssetCard.tsx` | UI card for SKOs that succeeded but whose synthesis failed — "Regenerate for fewer credits" |

**Files to Modify:**
| File | Change |
|---|---|
| `src/lib/pipeline/orchestrator.ts` | Call stage-aware `refundProject()` on `error` state transition (not blanket refund); call `refundPlatform()` on per-platform `Promise.allSettled` rejection; integrate pre-flight check before extraction for heavy inputs |
| `src/lib/firestore/helpers.ts` | Add `markProjectRefunded()` with refund reason/stage; add `getProjectCostLog()` reader; add `saveSKOAsset()` for partial success |
| `src/types/project.ts` | Add `refunded?: boolean`, `refundedAmount?: number`, `refundStage?: "full" | "synthesis_only"`, `skoRetained?: boolean` to `Project` interface |
| `app/project/[projectId]/page.tsx` | Add CostBreakdown panel, RefundBadge, and partial-success UI state |
| `app/page.tsx` | Add SpendChart to budget sidebar; show per-project cost on artifact cards; show SKOAssetCard for retained SKOs |
| `src/components/budget/BudgetMeter.tsx` | Add "refunded this month" line item if any refunds occurred |

**Files to Leave Untouched:**
- All AI agent files, schemas, prompts — no AI changes
- All output preview components — no UI changes to outputs
- `src/lib/budget/tracker.ts` — read-only (refund.ts handles the write-back)
- `src/lib/budget/kill-switch.ts` — untouched
- All native preview components
- Theme/layout components

**Dependencies:** None new. Uses existing Firestore cost_log data.

**Breaking Changes:**
- **Minor:** `Project` type gets new optional fields (`refunded`, `refundedAmount`, `refundStage`, `skoRetained`). Existing docs without these fields will render correctly (all optional).
- **Orchestrator change:** Adds stage-aware refund calls in error paths. Must not affect the happy path. Refund failures should be caught and logged, never blocking pipeline completion.

**Acceptance Criteria:**
1. When extraction succeeds but synthesis fails, the SKO is retained as a user asset and only synthesis cost is refunded (NOT the full project cost)
2. Partial success UI shows "Source material processed — regenerate for fewer credits" instead of generic error
3. Pre-flight validation catches unparseable/empty inputs before expensive extraction begins
4. When a full pipeline fails early (during ingest/extract), full refund is issued
5. When a single platform synthesis fails (e.g., Veo fails but Twitter succeeds), only the failed platform's cost is refunded
6. Per-project cost breakdown shows token counts and USD cost for each agent
7. Dashboard budget section shows a sparkline of daily spend for the current month

**Risks & Mitigations:**
- **Risk:** Race condition if refund runs concurrently with cost tracking → **Mitigation:** Use Firestore `FieldValue.increment(-amount)` (atomic); never read-modify-write
- **Risk:** Double refund if pipeline error handler runs twice → **Mitigation:** Check `refunded` flag before refunding; idempotent operation
- **Risk:** Pre-flight check adds latency to every pipeline run → **Mitigation:** Only run pre-flight on heavy inputs (video files, documents >10KB); skip for short text/URL inputs. Use cheapest model (`gemini-2.5-flash-8b`), constrained prompt, 5s timeout.
- **Risk:** Users confused by partial refund (expected full refund) → **Mitigation:** Clear UI messaging explains what succeeded, what failed, and why the SKO is valuable to keep. "Regenerate" button makes the next step obvious.

---

## Phase 5: C2PA Cryptographic Signing & Provenance Upgrade

**Goal:** Upgrade C2PA from metadata-only to real cryptographic signing, giving creators verifiable proof of content authenticity for EU AI Act compliance.

**Research Justification:**
- Feature Rec: "C2PA 'Digital Proof' Signer — Cryptographically sign every asset to prove brand authenticity and comply with the 2026 EU AI Act"
- Pain Point #4 (AI Slop Penalty): Verifiable provenance helps differentiate authentic AI-assisted content from generic slop

**Features & Changes:**

- **Real C2PA signing:** Replace the current SHA-256 metadata-only approach with actual C2PA manifest signing using `c2pa-node` (the official C2PA Node.js binding). Generate a self-signed certificate for the Zapocalypse instance.
- **Downloadable signed manifests:** Each platform output gets a downloadable `.c2pa` manifest file that can be verified at `contentcredentials.org/verify`.
- **C2PA verification badge upgrade:** Upgrade `C2PABadge.tsx` from a static indicator to a clickable badge that shows manifest details (creation timestamp, hash, tool info, signing certificate).
- **Manifest viewer panel:** Expandable panel showing the full C2PA manifest chain for a project's outputs.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/lib/pipeline/c2pa-signer.ts` | Replace `c2pa-generator.ts` internals with `c2pa-node` signing. Self-signed cert generation on first run. |
| `src/components/output/C2PAManifestViewer.tsx` | Expandable panel showing full manifest details per platform |

**Files to Modify:**
| File | Change |
|---|---|
| `src/lib/pipeline/c2pa-generator.ts` | Refactor to call `c2pa-signer.ts` for real signing instead of plain SHA-256 |
| `src/lib/ai/schemas/c2pa-manifest.ts` | Extend schema with `signature`, `certificate_thumbprint`, `manifest_uri` fields |
| `src/components/output/C2PABadge.tsx` | Make clickable; show manifest details popover; add download button |
| `app/project/[projectId]/page.tsx` | Add C2PAManifestViewer to project page |

**Files to Leave Untouched:**
- All AI agents, prompts, schemas (except c2pa-manifest.ts)
- Pipeline orchestrator (C2PA is already called from agent-authenticate.ts)
- All output preview components
- Budget system
- Theme/layout

**Dependencies:**
| Package | Purpose |
|---|---|
| `c2pa-node` | Official C2PA Node.js SDK for manifest signing and verification |

**Breaking Changes:**
- **C2PA manifest schema changes:** New fields added to `C2PAManifestSchema`. Existing manifests (v2.0) won't have `signature` or `certificate_thumbprint` — handle gracefully with optional fields.
- **`c2pa-node` requires native bindings:** May need platform-specific build steps for Firebase App Hosting. If native bindings fail in Cloud Run, fall back to the current metadata-only approach with a warning log.

**Acceptance Criteria:**
1. Generated C2PA manifests contain a valid cryptographic signature (not just SHA-256 hash)
2. Manifests can be verified at `contentcredentials.org/verify` (or via `c2pa-node` verify API)
3. C2PABadge shows manifest details on click and offers a download button
4. Existing v2.0 projects with old-format manifests still render correctly (no crashes)
5. If `c2pa-node` native bindings fail at runtime, system falls back to metadata-only with a warning

**Risks & Mitigations:**
- **Risk:** `c2pa-node` native bindings may not compile on Cloud Run's container → **Mitigation:** Test in Docker locally first; have fallback to current metadata-only approach; consider WASM alternative
- **Risk:** Self-signed certificates aren't trusted by verifiers → **Mitigation:** Document that this is self-signed; upgrade to a CA-issued certificate when the product has a registered entity. Self-signed still proves content originated from this Zapocalypse instance.

---

## Phase 6: Multimodal Input & YouTube Support

**Goal:** Accept video and YouTube content as input sources, using Gemini's vision capabilities to extract context from visuals — not just transcripts.

**Research Justification:**
- Pain Point #3 (Visual Context Ignorance): "Video has richer source material... that most tools completely ignore"
- Pain Point #2 (Context-Blind Clipping): "AI identifies viral moments based on volume but misses the point of the story"
- Feature Rec: "Multimodal Scene-Aware Clipping — use vision capabilities to detect on-screen visual shifts"

**Why Revised (Expert Critique — Pre-flight Validation for Heavy Compute):** Video processing is the highest-cost operation in the pipeline. Token costs jump significantly with up to 10 high-resolution vision frames per run. The experts emphasized that corrupted files, silent screen recordings, or unparseable uploads can burn expensive compute with zero value. Phase 4's pre-flight validation system is **critical infrastructure** for this phase — it must be deployed before Phase 6 goes live. The pre-flight check validates that video content is parseable and contains actual dialogue before committing to expensive multimodal extraction.

**Features & Changes:**

- **YouTube URL support:** Remove the current YouTube rejection in `url-extractor.ts`. Accept YouTube URLs, fetch transcript via YouTube Data API v3 (captions endpoint), and pass to ingest agent.
- **YouTube visual sampling:** For YouTube URLs, download a set of thumbnail frames at key timestamps (every 30s or at chapter markers). Pass frames to Gemini as multimodal input alongside the transcript for richer context.
- **Video file upload:** Accept `.mp4`, `.webm`, `.mov` files (≤100MB). Extract audio transcript via Gemini's audio understanding. Extract keyframes at interval.
- **Mandatory pre-flight check for video inputs (NEW):** Before any video extraction begins, the pre-flight system (built in Phase 4) runs automatically: extract a single middle frame + transcript header, pass to `gemini-2.5-flash-8b` to verify parsability and dialogue presence. Reject silent screen recordings, corrupted files, and content-free uploads *before* deducting the full high-tier credit.
- **Multimodal ingest prompt:** Update the ingest agent prompt to accept both text and image inputs. Gemini 2.5 models support multimodal input natively.
- **Scene context in SKO:** Add optional `visual_context` field to semantic chunks: descriptions of what was shown on screen during that segment. Synthesize agents can reference visual context for richer output.
- **Upload progress UI:** Show upload progress for large video files. Use chunked upload to a temp server endpoint.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/lib/pipeline/youtube-extractor.ts` | YouTube transcript fetching (Data API v3) + thumbnail extraction |
| `src/lib/pipeline/video-processor.ts` | Video file handling: extract keyframes, send audio to Gemini for transcription |
| `src/app/api/upload/route.ts` | POST endpoint for video file uploads with progress tracking |

**Files to Modify:**
| File | Change |
|---|---|
| `src/lib/pipeline/url-extractor.ts` | Remove YouTube rejection; route YouTube URLs to `youtube-extractor.ts` |
| `src/lib/pipeline/input-validator.ts` | Add `.mp4`, `.webm`, `.mov` to allowed file types; increase size limit to 100MB for video |
| `src/lib/pipeline/agent-ingest.ts` | Accept multimodal input (text + images array); pass to Gemini as parts |
| `src/lib/ai/prompts/ingest.ts` | Update prompt to handle multimodal input: "You will receive text content and optionally visual frames..." |
| `src/lib/ai/schemas/sko.ts` | Add optional `visual_context?: string` to `SemanticChunkSchema` |
| `src/lib/ai/gemini-client.ts` | Update `callGemini()` to accept `parts` array (text + inline image data) instead of just string content |
| `src/lib/pipeline/preflight.ts` | Add video-specific pre-flight checks (single frame + transcript header validation) |
| `src/lib/pipeline/orchestrator.ts` | Integrate mandatory pre-flight for video/YouTube inputs before extraction |
| `src/components/pipeline/InputForm.tsx` | Add video file type to upload zone; show upload progress bar |
| `src/types/project.ts` | Add `"youtube"` and `"video"` to `sourceType` union |

**Files to Leave Untouched:**
- Agent extract, synthesize, authenticate — they consume SKO which remains backwards-compatible
- All output preview components
- Budget system (video processing uses existing budget checks)
- Theme/layout
- Native previews

**Dependencies:**
| Package | Purpose |
|---|---|
| `googleapis` (or `youtube-transcript` ) | YouTube Data API v3 for transcript/caption fetching |

**Breaking Changes:**
- **SKO schema change:** New optional `visual_context` field on semantic chunks. Non-breaking (optional field). Existing SKOs without it work fine.
- **Gemini client API change:** `callGemini()` signature expands to accept multimodal parts. Must remain backwards-compatible with string-only input.
- **`sourceType` expansion:** Adding `"youtube"` and `"video"` to the union. Existing code handles unknown source types gracefully.

**Acceptance Criteria:**
1. YouTube URLs are accepted and processed (transcript extracted, content generated)
2. YouTube visual frames (thumbnails at key timestamps) are sent to Gemini alongside transcript
3. Video file upload (≤100MB, mp4/webm/mov) works with progress indicator
4. **Pre-flight check rejects silent/corrupted/empty video files before expensive extraction begins**
5. SKO semantic chunks may include `visual_context` descriptions from video frames
6. Existing URL and text inputs continue to work unchanged

**Risks & Mitigations:**
- **Risk:** YouTube Data API has quota limits (10,000 units/day free) → **Mitigation:** Cache transcripts; use `youtube-transcript` npm package as fallback (scrapes without API key)
- **Risk:** Video file uploads are large and may timeout on Cloud Run → **Mitigation:** Use `apphosting.yaml` 300s timeout (already set); chunk uploads; consider Cloud Storage signed URLs for large files
- **Risk:** Multimodal Gemini calls are significantly more expensive (images cost tokens) → **Mitigation:** Limit to 10 keyframes max; use `gemini-2.5-flash` for cost efficiency; budget check before call; **mandatory pre-flight validation catches bad inputs before heavy compute**
- **Risk:** Pre-flight false positives reject valid video content → **Mitigation:** Pre-flight only checks for parsability and dialogue presence, not quality. Log pre-flight rejections for monitoring. User can override with manual confirmation.

---

## Phase 7: Authentication, Monetization & Retention

**Goal:** Add user accounts, usage-based pricing, hibernation plans, and loyalty mechanics to transform Zapocalypse from a tool into a sustainable business.

**Research Justification:**
- Feature Rec: "Hibernation Plan — $5/month tier that saves all Brand Voice models and generation history"
- Monetization: "Usage-Based Hybrid Model — base subscription + pay-as-you-go for GPU tasks"
- Monetization: "Loyalty Loops — Streaks or Missions that reward users with bonus credits"
- Monetization: "Ethical Cancellation Flow — offer hibernation down-sell"
- Pain Point #10 (Hostile Cancellation): "immediately prevent you from using the product"

**Features & Changes:**

- **Firebase Auth integration:** Email/password + Google OAuth sign-in. All Firestore queries scoped to `users/{uid}/projects/...` (data migration for existing projects).
- **Firestore security rules:** Replace open access with user-scoped rules. Users can only read/write their own projects. Budget doc readable by authenticated users.
- **User profile document:** `users/{uid}` — plan tier, credits balance, streak count, brand voice fingerprint (persists across projects).
- **Persistent brand voice:** Store the user's refined tone fingerprint globally (from Phase 2 reflexion history). New projects start with this fingerprint instead of generating from scratch. This is the **data moat** — every interaction with the reflexion loop enriches the persistent fingerprint.
- **Credit system:** Each user gets a monthly credit allocation based on tier. Pipeline runs deduct credits. Credits displayed in header alongside budget.
- **Tier structure:**
  - Free: 3 pipeline runs/month, no video input
  - Pro ($15/mo): 50 runs, video input, priority model (2.5-pro)
  - Hibernation ($5/mo): 0 runs, data preserved, brand voice preserved
- **Streak system:** Track consecutive days with pipeline runs. Streaks of 3/7/14/30 days unlock bonus credits. Visual streak counter in dashboard.
- **Ethical cancellation:** On cancel, offer hibernation down-sell. Show unused credits count. 30-day grace period before data deletion.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/lib/firebase/auth.ts` | Firebase Auth initialization, sign-in/sign-out helpers |
| `src/components/auth/AuthProvider.tsx` | React context for auth state |
| `src/components/auth/SignInForm.tsx` | Sign-in page with email/password + Google OAuth |
| `src/components/auth/AuthGuard.tsx` | Route protection wrapper |
| `src/app/auth/signin/page.tsx` | Sign-in page |
| `src/app/auth/signup/page.tsx` | Sign-up page |
| `src/app/settings/page.tsx` | User settings: plan management, brand voice, cancellation |
| `src/lib/credits/manager.ts` | Credit allocation, deduction, monthly reset logic |
| `src/hooks/useAuth.ts` | Auth state hook |
| `src/hooks/useCredits.ts` | Real-time credit balance hook |
| `src/hooks/useStreak.ts` | Streak tracking hook |
| `src/components/dashboard/StreakCounter.tsx` | Visual streak display with milestone badges |
| `src/types/user.ts` | `User`, `UserPlan`, `CreditBalance`, `Streak` type definitions |
| `firestore.rules` (rewrite) | User-scoped security rules |
| `src/scripts/migrate-projects.ts` | One-time migration: move existing projects under a default user |

**Files to Modify:**
| File | Change |
|---|---|
| `app/layout.tsx` | Wrap with AuthProvider |
| `src/components/layout/AppShell.tsx` | Add user avatar, sign-out button, streak counter |
| `src/lib/pipeline/orchestrator.ts` | Accept `userId` parameter; scope all Firestore writes to `users/{uid}/projects/...` |
| `src/lib/firestore/helpers.ts` | All helpers accept `userId` parameter for path scoping |
| `src/hooks/useProject.ts` | Scope queries to authenticated user |
| `src/hooks/useRecentProjects.ts` | Scope queries to authenticated user |
| `src/hooks/useBudget.ts` | Scope to user's credit balance |
| `app/api/pipeline/run/route.ts` | Validate auth token; check credit balance before starting |
| `app/page.tsx` | Show auth-gated dashboard; streak counter |
| `src/lib/budget/tracker.ts` | Deduct from user credits in addition to global budget tracking |

**Files to Leave Untouched:**
- All AI agents, prompts, schemas — no AI changes
- All output preview components
- Native preview components
- Theme system (except AppShell header additions)

**Dependencies:**
| Package | Purpose |
|---|---|
| `firebase/auth` | Already included in `firebase` package — just needs initialization |

**Breaking Changes:**
- **MAJOR: Firestore path restructuring.** Projects move from `projects/{id}` to `users/{uid}/projects/{id}`. This is the biggest breaking change in V3. Migration script required.
- **API route auth:** All API routes now require auth token. Unauthenticated requests return 401.
- **Budget system expansion:** Global budget tracking continues for cost monitoring, but user-facing "credits" replace "dollars spent" in the UI.

**Acceptance Criteria:**
1. Users can sign in with email/password or Google OAuth
2. Projects are scoped to the authenticated user — users cannot see each other's projects
3. Firestore security rules enforce user-scoped access (test with Firebase Emulator)
4. Credit system deducts correctly per pipeline run and displays balance in header
5. Hibernation tier ($5/mo) preserves data and brand voice without allowing new runs

**Risks & Mitigations:**
- **Risk:** Firestore path migration breaks existing projects → **Mitigation:** Migration script with dry-run mode; test against emulator first; keep old paths readable for 30 days
- **Risk:** Auth adds latency to every page load → **Mitigation:** Use Firebase Auth persistence (`LOCAL`); optimistic UI rendering; auth state cached in cookie for SSR
- **Risk:** Credit system complexity may introduce billing bugs → **Mitigation:** Atomic Firestore operations only; credit deduction is idempotent (project ID as deduction key)

---

## Phase 8: Social Publishing & Scheduling

**Goal:** Let creators publish generated content directly to social platforms with smart retry and scheduling, eliminating the copy-paste workflow.

**Research Justification:**
- Pain Point #5 (Broken Schedulers): "TikTok connections drop frequently... Posts occasionally fail silently"
- Feature Rec: "Agentic Multi-Account Scheduler — monitors API status in real-time and auto-retries failed posts"
- Trend #2 (Zero-Click Content): "Platforms are penalizing external links. Prioritize platform-native formats"

**Features & Changes:**

- **Social account connections:** OAuth flows for X/Twitter (OAuth 2.0 PKCE) and LinkedIn (OAuth 2.0). Store access tokens encrypted in Firestore under `users/{uid}/connections/{platform}`.
- **One-click publish:** Per-platform "Publish" button on output tabs. Publishes the selected content directly via platform API.
- **Scheduled publishing:** Date/time picker per platform. Scheduled posts stored in `users/{uid}/scheduled/{id}`. Cloud Scheduler or Cloud Tasks triggers publish at the scheduled time.
- **Publish queue & status:** Dashboard section showing scheduled and published posts with status (pending, published, failed, retrying).
- **Smart retry:** On publish failure (rate limit, token expired), exponential backoff with max 3 retries. On auth failure, prompt user to re-connect. Never silently fail.
- **LinkedIn native carousel publishing:** Use LinkedIn's document sharing API to publish carousel posts as native PDFs (not just text posts).
- **X/Twitter thread publishing:** Publish multi-tweet threads as a connected thread via the X API v2 conversation chain.

**Files to Create:**
| File | Purpose |
|---|---|
| `src/lib/social/x-client.ts` | X/Twitter API v2 client: post tweet, post thread, check status |
| `src/lib/social/linkedin-client.ts` | LinkedIn API client: post text, post document (carousel PDF) |
| `src/lib/social/scheduler.ts` | Scheduling logic: store scheduled posts, trigger at time |
| `src/lib/social/publisher.ts` | Unified publish function with retry logic and status tracking |
| `src/lib/social/token-manager.ts` | Encrypted token storage, refresh logic, expiry detection |
| `src/app/api/social/connect/[platform]/route.ts` | OAuth callback handler for social account connection |
| `src/app/api/social/publish/route.ts` | POST endpoint to publish or schedule content |
| `src/app/settings/connections/page.tsx` | Social account connection management UI |
| `src/components/output/PublishButton.tsx` | Per-platform publish button with schedule option |
| `src/components/dashboard/PublishQueue.tsx` | Scheduled/published posts status list |
| `src/hooks/useConnections.ts` | Hook for connected social accounts |
| `src/hooks/usePublishQueue.ts` | Hook for publish queue status |
| `src/types/social.ts` | `SocialConnection`, `ScheduledPost`, `PublishStatus` types |

**Files to Modify:**
| File | Change |
|---|---|
| `src/components/output/OutputTabs.tsx` | Add PublishButton per platform tab |
| `src/components/output/TweetCarousel.tsx` | Add "Publish Thread" action |
| `src/components/output/LinkedInPreview.tsx` | Add "Publish Post" + "Publish Carousel" actions |
| `src/components/layout/AppShell.tsx` | Add "Connections" link to settings |
| `app/page.tsx` | Add PublishQueue section to dashboard |
| `app/settings/page.tsx` | Add connections management section |

**Files to Leave Untouched:**
- All AI pipeline code — publishing is post-generation
- All schemas and prompts
- Budget/credit system
- Theme system
- Auth system (built in Phase 7)

**Dependencies:**
| Package | Purpose |
|---|---|
| `twitter-api-v2` | X/Twitter API v2 SDK |
| `@googleapis/people` or LinkedIn REST API | LinkedIn API client (no official SDK — use REST) |

**Breaking Changes:** None. Publishing is an entirely additive feature. All existing workflows (copy/download) continue to work.

**Acceptance Criteria:**
1. Users can connect X/Twitter and LinkedIn accounts via OAuth
2. One-click publish sends a tweet or LinkedIn post directly from the output view
3. Twitter thread publishing sends all tweets as a connected thread
4. Scheduled posts publish at the specified time (±1 minute tolerance)
5. Failed publishes retry with exponential backoff and show clear error status (never silently fail)

**Risks & Mitigations:**
- **Risk:** Social platform API access requires developer app review (especially X) → **Mitigation:** Apply for developer access early; start with X Free tier (1,500 tweets/month); LinkedIn requires company page for some features
- **Risk:** OAuth token expiry causes silent publish failures → **Mitigation:** Token manager checks expiry before publish; proactive refresh; email/in-app notification on auth failure
- **Risk:** Rate limits on social APIs block bulk publishing → **Mitigation:** Enforce minimum 30s between posts; queue-based publishing; show rate limit status to user
- **Risk:** LinkedIn carousel requires PDF upload — complex formatting → **Mitigation:** Use a simple HTML-to-PDF library (e.g., `puppeteer` or `jspdf`) to convert carousel slides to PDF; start with text-only posts if PDF proves too complex

---

## Dependency Graph

```
Phase 1 (Predictive Virality)  ─── independent, zero-risk ───────────┐
Phase 2 (Reflexion + Additive) ─── independent ──────────────────────┤
                                                                      ├─→ AI intelligence first
Phase 3 (UX Clarity)           ─── benefits from Phases 1-2 output ──┤
Phase 4 (Fair-Play Credits)    ─── independent ──────────────────────┤
Phase 5 (C2PA Signing)         ─── independent ──────────────────────┘

Phase 6 (Multimodal Input)     ─── SOFT DEPENDENCY on Phase 4 (pre-flight validation infrastructure)

Phase 7 (Auth & Monetization)  ─── depends on: none strictly, but benefits from Phase 2 (brand voice persistence) and Phase 4 (credits) being done first

Phase 8 (Social Publishing)    ─── HARD DEPENDENCY on Phase 7 (requires auth for user-scoped token storage)
```

**Parallelism opportunities:**
- Phases 1–5 are fully independent and can be developed in any order or in parallel
- Phase 6 benefits from Phase 4's pre-flight infrastructure but can implement its own standalone pre-flight if needed
- Phase 7 should come after Phases 1–6 are stable (it restructures Firestore paths)
- Phase 8 must come after Phase 7 (needs auth infrastructure)

**Recommended execution order for a solo developer:**
1. **Phase 1 (Predictive Virality)** → zero-risk additive agent, immediately proves platform intelligence
2. **Phase 2 (Reflexion + Additive Fingerprinting)** → starts the data flywheel, every user interaction trains the model
3. **Phase 3 (UX)** → wrap the now-superior engine in a frictionless experience
4. **Phase 4 (Fair-Play Credits)** → builds trust with cost transparency and smart refunds
5. **Phase 5 (C2PA)** → compliance, depends on external lib viability
6. **Phase 6 (Multimodal)** → high effort, high value, leverages Phase 4 pre-flight
7. **Phase 7 (Auth)** → foundation for monetization, persistent brand voice
8. **Phase 8 (Publishing)** → capstone feature

---

## Revision Notes (Expert Critique Integration)

This plan was revised 2026-03-28 based on a comprehensive expert critique. All three major critique points have been fully incorporated:

### Critique Point 1: Subtractive → Additive Tone Fingerprinting

**Problem identified:** V2's Authenticator agent and the original V3 Phase 4 reflexion loop relied entirely on *subtractive* filtering — scanning for slop patterns (generic openers, excessive hedging, corporate filler) and zeroing them out. From an LLM perspective, negative prompting is inefficient: zeroing out token probabilities doesn't guide the attention mechanism toward the tokens that make a creator unique. The result is content that "offends no one and excites no one."

**Changes made:**
- **Phase 2 (formerly Phase 4):** Completely restructured around additive fingerprinting. The SKO extraction phase now explicitly maps positive linguistic markers: analogy style, sentence cadence variance (categorized on a spectrum via few-shot prompting — LLMs categorize well, they count poorly), signature phrases, storytelling structure, humor type, niche colloquialisms, and explanation patterns.
- **Phase 2 feedback buttons:** Changed from negative quick-select ("too formal", "too generic") to dynamic positive options derived from the user's fingerprint ("Needs more of my mechanical metaphors", "Use my typical storytelling pacing").
- **SKO schema:** Extended `brand_tone_fingerprint` with rich additive fields (all optional for backwards compatibility).
- **Phase 7:** Persistent brand voice explicitly builds on Phase 2's additive fingerprint data, creating the "data moat" the experts recommended.

### Critique Point 2: Fair-Play Credits × Multimodal Cost Tension (Token Trap)

**Problem identified:** The blanket "refund everything on failure" model creates a hidden financial vulnerability. When expensive multimodal extraction succeeds but cheap downstream synthesis fails, the system refunds the entire project cost — eating the most expensive compute while delivering zero value. The `Promise.allSettled` block in synthesis is the specific architectural trap: one platform failure triggers a full refund that includes perfectly successful heavy extraction.

**Changes made:**
- **Phase 4 (formerly Phase 2):** Completely restructured with tiered refund logic. Extraction costs are decoupled from synthesis costs. If synthesis fails but extraction succeeded, only synthesis cost is refunded. The SKO is retained as a user-owned asset with a "Regenerate for fewer credits" option.
- **Phase 4:** Added pre-flight validation system using `gemini-2.5-flash-8b` to catch unparseable/empty inputs before committing to expensive extraction.
- **Phase 4:** New `SKOAssetCard` UI component and partial-success UI state — transforms "Generation failed" into "Source material processed, click to regenerate."
- **Phase 6:** Mandatory pre-flight check integrated for all video/YouTube inputs before heavy multimodal extraction begins.

### Critique Point 3: Phase Reordering — Intelligence Before Interface

**Problem identified:** The original plan scheduled UX polish (Phase 1) and credit mechanics (Phase 2) as the first deployments, with intelligence upgrades (Phases 4-5) coming later. The experts argued this is "renovating the lobby of a hotel before fixing the plumbing in the guest rooms" — beta testers would interact with a prettier interface that still generates V2-quality output. The market research explicitly states the biggest pain points are AI slop and context-blind content, not UI friction.

**Changes made:**
- **Phase 1 is now Predictive Virality** (was Phase 5): Zero-risk, fault-tolerant agent that immediately proves platform intelligence. If it fails, no harm. If it succeeds, users see the tool understands their audience.
- **Phase 2 is now Reflexion + Additive Fingerprinting** (was Phase 4): Deployed early to start the data flywheel. Every user interaction trains the persistent brand model — months of wasted training data are avoided.
- **Phase 3 is now UX Clarity** (was Phase 1): Wraps the now-demonstrably-superior engine in a frictionless experience. "You only deploy UX after the output quality is unmatched."
- **Phase 4 is now Fair-Play Credits** (was Phase 2): Trust mechanics come after the engine proves itself.
- **Dependency graph rewritten** to reflect intelligence-first ordering.
- **Executive summary rewritten** to lead with AI intelligence strategy, not UX improvements.

---

## Implementation Reality: Plan vs. Execution (Phases 1–5)

> **Added:** 2026-04-05 — Documents how the actual implementation diverged from the original plan across the first five phases, and why.

### Phase 1: Predictive Virality & Hook Scoring

**Divergence level:** Low — implemented largely as planned.

| Planned | Actual | Why |
|---------|--------|-----|
| A/B hook suggestions for each platform's top hook | A/B variants generated for all hooks with `composite_score ≥ 0.70` | More useful to generate variants for *any* strong hook, not just the top one per platform. The 0.70 threshold emerged from testing — below that, the hook itself needs rewriting, not a variant. |
| Score badge inline per tweet/post | Implemented exactly | — |
| Hook leaderboard as a new tab in OutputTabs | Implemented as a tab, gated on Twitter readiness | Leaderboard needs at least one platform's hooks to be meaningful; Twitter loads first in most runs so it's the natural gate. |
| Newsletter subject scoring | Newsletter subject is treated as a hook and scored | Plan implied it but didn't explicitly spec it — obvious inclusion. |

**Files divergence:** `app/project/[projectId]/page.tsx` was listed as a place to render HookLeaderboard directly, but it ended up inside `OutputTabs` as a tab instead. Cleaner — keeps all output viewing in one tabbed container.

**Minor UI note:** `HookScoreBadge` is not rendered in native preview mode for Twitter and LinkedIn. Intentional — native previews mimic the real platform UI where custom badges would not appear.

---

### Phase 2: Reflexion Loop + Additive Tone Fingerprinting

**Divergence level:** Medium — core architecture matches, but Gemini CLI implemented it (not Claude), leading to some structural differences and a large skill file restoration.

| Planned | Actual | Why |
|---------|--------|-----|
| "Refine my voice" button per tab | "Not my voice" floating pill at bottom-right of output container | Gemini CLI chose a different UX trigger — floating pill is less intrusive than per-tab buttons and avoids cluttering each platform's output view. The button appears globally rather than per-platform, since tone refinement applies to the creator's voice, not individual platforms. |
| Dynamic *positive* feedback buttons from fingerprint | Implemented: dynamic pills from `sko.brand_tone_fingerprint` additive fields + static fallbacks ("More contrarian", "More data-driven", "Warmer tone", "Sharper hooks") | Static fallbacks were added because early testing showed fingerprints from short text inputs often had sparse additive markers, leaving the form nearly empty. |
| Visual diff (stretch goal) | Not implemented | Correctly scoped as optional/stretch. Deferred — not enough value vs. complexity for V3. |
| `regeneratedAt` timestamp on overwritten output | `isRegenerated: boolean` flag + separate `regenerationState` on project doc | Firestore `onSnapshot` drives the UI — boolean flag is simpler to query than timestamp comparison. `regenerationState` on the project doc (not the output doc) lets the project page show regen status without subscribing to each output individually. |
| Orchestrator untouched | Orchestrator untouched — regeneration is a separate flow via `/api/pipeline/regenerate` | Matches plan exactly. |
| 100+ Gemini skill files restored | Not in original plan | Gemini CLI's implementation session accidentally deleted skill files from `.gemini/skills/`. Restoration was maintenance, not feature work, but it happened during this phase. |

**Key architectural alignment:** The additive fingerprint schema (`AdditiveFingerprint` with 7 optional fields merged into `BrandToneFingerprintSchema`) matches the plan's specification exactly. The refinement agent, regeneration pipeline, and `tone_history` subcollection all shipped as designed.

**Extra file (not in plan):** `src/hooks/useSourceContent.ts` — fetches raw source content from `projects/{id}/source/current` for the collapsible source preview on the project page. Added to support a "Show full content" toggle that lazy-loads the full ingested text. Not in the Phase 2 plan but added in the same batch since it complemented the project page improvements.

---

### Phase 3: UX Clarity & Progressive Disclosure

**Divergence level:** Low-Medium — all major features shipped, some scoping differences.

**Extra files (not in plan):**
- `src/hooks/useOutputExistence.ts` — `onSnapshot` on the entire `outputs/` subcollection; returns `ready: Platform[]` as docs appear. Needed to drive progressive tab reveal; the plan described the feature but didn't enumerate this hook as a required file.
- `src/hooks/useArtifactPreviews.ts` — batch `getDoc` for `twitter[0].text`, `linkedin[0].hook`, `newsletter.subject_line` per completed project. Powers the artifact preview snippets on the dashboard. Uses a `fetchedRef` to prevent re-fetching the same project set.

Both hooks are entirely client-side and follow the same pattern as existing hooks — no new Firestore collections, no schema changes.

| Planned | Actual | Why |
|---------|--------|-----|
| `ProjectArtifactCard.tsx` (new component) | Artifact previews rendered inline in `app/page.tsx` using `useArtifactPreviews` hook | A dedicated card component was overengineering — the dashboard already had a project list; adding preview snippets (firstTweet, linkedInHook, newsletterSubject) inline was simpler and avoided a new abstraction for what amounts to 3 lines of text per card. |
| Progressive output reveal with skeleton placeholders | Tabs dim (opacity-30) + pulse dot when pending; `effectiveTab` via `useMemo` auto-selects most recently ready tab | Skeletons per tab felt heavy — dimmed tabs with a pulse dot communicate "coming soon" more elegantly. The `effectiveTab` derivation (useMemo instead of setState-in-useEffect) was a React 19 best practice that avoided a lint rule violation. |
| DarkSocialPreview collapsed behind OverflowMenu | Left untouched — each section has exactly one action | Plan listed it for modification, but inspection showed Dark Social already had minimal actions. Adding an overflow menu for a single button would be worse UX. |
| Smart input auto-detects URL vs text | `/^https?:\/\/\S+$/` + no-newline guard to prevent false positives on prose containing URLs | Plan didn't specify the regex — the no-newline guard was critical because a paragraph mentioning "check out https://example.com for details" would otherwise trigger URL mode. |
| ProgressRing error state | Freezes at 37% (extract position) and turns red | Plan said "animated progress ring" but didn't specify error behavior. 37% = extract stage, which is where most errors occur — gives the user location context about where the pipeline failed. |

---

### Phase 4: Fair-Play Credits, Tiered Refunds & Pre-flight

**Divergence level:** Medium — the first implementation attempt had critical bugs and was stashed; the second attempt diverged in several important ways.

| Planned | Actual | Why |
|---------|--------|-----|
| Refund logic in a single function | `processRefund(projectId, "full" \| "synthesis_only")` with correct synthesis agent names | The first attempt used `"synthesize"` as the agent name in refund logic, but cost_log entries use platform-specific names like `synthesize_twitter`. This mismatch meant synthesis costs were never actually refunded. Fixed in the rebuild. |
| `BudgetExceededError` triggers refund | `BudgetExceededError` explicitly excluded from refund logic | Critical design correction: budget exceeded is a *safety stop*, not a failure. The user chose the limit — refunding would undermine the budget protection system. |
| SpendChart with per-project cost on artifact cards | SpendChart uses `collectionGroup("cost_log")` query — O(1) reads regardless of project count | Plan implied N+1 reads (one per project). `collectionGroup` was the correct Firestore pattern — 1 query for all cost data across all projects. |
| `allFailed` check triggers full refund | `allFailed` checks actual output presence, not just error count | First attempt counted errors from `Promise.allSettled` but didn't verify that zero outputs were actually written. A platform could fail its settled result but still write partial data before failing. |
| Pre-flight uses string matching for validation | Pre-flight uses `generateStructured` with a Zod schema | String matching on Gemini text output is fragile. Structured output with a schema guarantees parseable validation results. |
| Per-project cost on dashboard artifact cards | Cost shown on project detail page via `CostBreakdown`, not on dashboard cards | Dashboard cards already had preview snippets from Phase 3 — adding cost numbers would clutter them. Cost belongs on the detail page where creators are reviewing a specific project. |
| `generateText` existed without budget check | `generateText` updated to call `checkBudget()` first | The preflight agent used `generateText` which bypassed budget safety. This was a gap in the original `gemini-client.ts` — all Gemini calls must check budget. |
| `gemini-2.5-flash-8b` in pricing map | Added to `pricing.ts` | Plan mentioned the model for preflight but didn't note it was missing from the pricing map. Without it, cost tracking would default to a 4× pricier model's rates. |

**Extra file (not in plan):** `src/hooks/useMonthlyRefunds.ts` — client-side `onSnapshot` hook that queries projects where `refunded == true` and `updatedAt >= startOfMonth`, summing `refundedAmount`. The plan specified a server-side `getMonthlyRefundTotal()` helper in `helpers.ts` (which exists), but the dashboard's `BudgetMeter` needed a live-updating client hook to reflect refunds as they happen in real time. This hook bridges that gap.

**Rebuild context:** The first implementation attempt accumulated enough bugs (wrong agent names, missing budget checks, dead imports, incorrect allFailed logic) that it was stashed and rebuilt cleanly. The second attempt took ~90 minutes and produced correct code. Lesson: for phases with interconnected Firestore writes and budget math, building from scratch is faster than debugging a broken first pass.

---

### Phase 5: C2PA Cryptographic Signing & Provenance Upgrade

**Divergence level:** High — the core signing technology was completely changed from the plan.

| Planned | Actual | Why |
|---------|--------|-----|
| `c2pa-node` (Rust NAPI bindings) for real C2PA signing | ECDSA P-256 signing via Node.js built-in `crypto` module — zero native dependencies | **C2PA is designed for binary media assets (JPEG, PNG, MP4), not JSON text.** The `c2pa-node` SDK expects binary buffers and produces JUMBF-embedded manifests inside media files. Our outputs are all JSON text — there is no standard way to embed a C2PA manifest inside a JSON document. Additionally, `c2pa-node`'s native Rust bindings risk breaking on Firebase App Hosting's Cloud Run container. The Node.js `crypto` approach gives genuine cryptographic provenance (ECDSA signatures, not fake hashes) with zero native dependencies, and the manifest structure stays C2PA-vocabulary-compatible for Phase 6 when Veo produces actual video. |
| Manifests verifiable at `contentcredentials.org/verify` | Not achievable — contentcredentials.org verifies JUMBF-embedded C2PA manifests in media files, not standalone JSON | The plan's acceptance criterion was written assuming `c2pa-node` would produce standard C2PA manifests. Our JSON signing approach produces a different artifact — a cryptographically signed content credential, not a C2PA JUMBF manifest. Verification is done by checking the ECDSA signature against the public key, not via contentcredentials.org. |
| `.c2pa` manifest file downloads | `.json` manifest downloads | Since we don't produce JUMBF binary manifests, the download format is JSON. Labeled as "Zapocalypse Content Credential" to avoid confusion with standard `.c2pa` files. |
| Self-signed certificate generation on first run | ECDSA P-256 keypair generated on first run, persisted to Firestore `system/c2pa_signing_key` | Same concept, different technology. The plan said "self-signed certificate" in the context of `c2pa-node` (which uses X.509 certs). Our approach generates a raw ECDSA keypair instead — simpler, sufficient for single-user app. |
| `c2pa-generator.ts` refactored to call signer | `c2pa-generator.ts` becomes async, delegates to `c2pa-signer.ts` | Plan matched — the generator became a thin async wrapper. Breaking change: `generateAllC2PAManifests` went from sync to async, requiring `await` in `agent-authenticate.ts`. |
| Schema extended with `signature`, `certificate_thumbprint`, `manifest_uri` | Extended with `signature`, `certificate_thumbprint`, `signing_status`, `public_key_pem`, `manifest_uri` | Added `signing_status` (enum: "signed" / "metadata_only") and `public_key_pem` beyond what the plan specified. `signing_status` is critical for the UI to distinguish new signed manifests from legacy metadata-only ones. `public_key_pem` allows client-side display of the certificate. |
| C2PABadge as a popover | C2PABadge as a `<details>` element | The codebase uses `<details>` for all expandable panels (ToneCheckBadge, CostBreakdown, SourcePreview). A popover would be inconsistent. |
| C2PAManifestViewer rendered once on project page | Rendered once after ToneCheckBadge + C2PABadge rendered per-platform inside OutputTabs | Both components shipped — the viewer gives a project-level summary while the badge gives per-platform detail. |
| `c2pa-node` fallback to metadata-only | Signing errors fall back to `signing_status: "metadata_only"` with warning log | Same concept, cleaner implementation — try/catch around the signing call, not around native binding loading. |
| C2PABadge already existed but was never rendered | Wired into OutputTabs per platform tab + C2PAManifestViewer on project page | The V2 badge component existed as dead code for months. Phase 5 finally renders it. |

**Extra files (not in plan):**
- `src/hooks/useC2PAManifests.ts` — two hooks: `useC2PAManifest(projectId, platform)` for single-platform `onSnapshot` (used by `C2PABadge`), and `useC2PAManifests(projectId)` for all-platform collection listener (used by `C2PAManifestViewer`). The plan described the UI components but didn't enumerate the required client hooks.
- `src/lib/firestore/helpers.ts` additions: `readSigningKey()` and `writeSigningKey()` for persisting the ECDSA keypair to `system/c2pa_signing_key`. Required by `c2pa-signer.ts` but not mentioned in the plan's "files to modify" list since the keypair persistence mechanism was unspecified in the original design.
- `src/lib/pipeline/agent-authenticate.ts` — required a single-line change (adding `await` to `generateAllC2PAManifests`) because the function became async. The plan's "files to modify" list for Phase 5 omitted this since the async nature of the signer wasn't anticipated.

**Why the technology shift matters:** The plan assumed C2PA was the right tool because the research document said "C2PA Digital Proof Signer." But C2PA (Coalition for Content Provenance and Authenticity) is an industry standard for embedding provenance metadata *inside binary media files* — it was designed for photos and videos, not JSON text. Attempting to force `c2pa-node` to sign text content it wasn't designed for would produce non-standard artifacts that don't validate anywhere, while introducing fragile native dependencies. The ECDSA approach achieves the actual goal (cryptographic proof that content originated from this Zapocalypse instance) without pretending to be something it's not. When Phase 6 adds Veo video output (actual binary media), `c2pa-node` becomes the correct tool for *those specific assets*.

---

### Cross-Phase Patterns

Several patterns emerged across all five phases that weren't in the original plan:

1. **Memory sync protocol:** Every phase completion triggers a full update of `.claude/memory/` files — `codebase_architecture.md`, `phase_status.md`, `project_state.md`. This wasn't in the plan but became a mandatory practice after Phase 2 when stale architecture docs caused incorrect assumptions.

2. **Branch-per-phase workflow:** Each phase gets its own feature branch (`v3/phase-N-name`) merged to main on completion. The plan mentioned this in passing; it became a hard rule after the Phase 4 stash-and-rebuild incident proved the value of clean main-branch state.

3. **Pre-existing lint errors carried forward:** Three lint errors (setState-in-effect in SpendChart and useSourceContent, ref-during-render in OutputTabs) accumulated across phases and were carried forward rather than fixed in unrelated phase branches. These should be addressed in a dedicated cleanup pass.

4. **Gemini CLI collaboration:** Phase 2 was implemented by Gemini CLI (not Claude), introducing some structural differences that subsequent phases had to work around — particularly the "Not my voice" button placement and the `.gemini/skills/` file restoration. Cross-agent collaboration requires strict schema contracts, which the Zod-first architecture enabled.

5. **No new npm dependencies added:** Phases 1–5 introduced zero new npm packages. The plan specified `c2pa-node` for Phase 5, but the technology pivot eliminated that dependency. All functionality uses Node.js built-ins, existing Firebase SDKs, and Zod.
