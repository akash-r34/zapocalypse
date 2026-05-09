import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { SynthesisOutputs } from "@/src/lib/pipeline/agent-synthesize";
import { withSystemPrompt } from "./system";

export function buildScoreHooksPrompt(sko: SKO, outputs: SynthesisOutputs): string {
  const hookLines: string[] = [];

  if (outputs.twitter) {
    outputs.twitter.tweets.forEach((t, i) => {
      hookLines.push(`- [twitter_${i}] (platform: twitter, type: ${t.type}) "${t.hook}"`);
    });
  }
  if (outputs.linkedin) {
    outputs.linkedin.posts.forEach((p, i) => {
      hookLines.push(`- [linkedin_${i}] (platform: linkedin, angle: ${p.angle}) "${p.hook}"`);
    });
  }
  if (outputs.newsletter) {
    hookLines.push(`- [newsletter_subject] (platform: newsletter) "${outputs.newsletter.subject_line}"`);
  }
  if (outputs.dark_social) {
    hookLines.push(`- [dark_social_slack] (platform: dark_social) "${outputs.dark_social.slack_message.hook}"`);
    hookLines.push(`- [dark_social_discord] (platform: dark_social) "${outputs.dark_social.discord_message.hook}"`);
    hookLines.push(`- [dark_social_quote] (platform: dark_social) "${outputs.dark_social.shareable_quote}"`);
  }

  return withSystemPrompt(`## YOUR TASK: Hook Virality Scoring

Score every hook below on 4 dimensions, anchored entirely to the target audience persona. This is NOT a generic scoring exercise — every score must reflect how this specific audience would react.

## TARGET AUDIENCE PERSONA (anchor ALL scores to this)
Primary: ${sko.audience_persona.primary}
Secondary: ${sko.audience_persona.secondary}
Pain Points: ${sko.audience_persona.pain_points.join("; ")}
Desired Outcomes: ${sko.audience_persona.desired_outcomes.join("; ")}

## CORE THESIS OF SOURCE CONTENT
${sko.core_thesis}

## ALL HOOKS TO SCORE (${hookLines.length} total)
${hookLines.join("\n")}

## SCORING DIMENSIONS (each 0.0–1.0)
1. **novelty** — Does this hook present a surprising angle, contrarian take, or fresh framing that this audience hasn't seen? Score LOW if it's a common pattern for this niche.
2. **emotional_resonance** — Does this hook connect directly to the audience's pain points or desired outcomes listed above? Score based on this specific persona, not general appeal.
3. **niche_relevance** — Is this hook immediately recognizable as "for them"? Would this audience know at a glance this content is in their domain?
4. **shareability** — Would this audience forward, quote, or repost this? Consider social currency, conversation-starting potential, and identity signaling for this persona.

## COMPOSITE SCORE
Compute as: (novelty × 0.30) + (emotional_resonance × 0.25) + (niche_relevance × 0.25) + (shareability × 0.20)

## GRADE THRESHOLDS
A: composite ≥ 0.80 | B: ≥ 0.65 | C: ≥ 0.50 | D: ≥ 0.35 | F: < 0.35

## A/B VARIANTS
For any hook with composite_score ≥ 0.70, generate 1–2 alternative hook variants that aim to score higher. Each variant must include a brief rationale explaining the change.

## REQUIREMENTS
- Score ALL ${hookLines.length} hooks. Do not skip any.
- Use the exact hook_id strings as listed above (e.g., "twitter_0", "linkedin_2", "newsletter_subject").
- Set top_hook_id to the hook_id with the highest composite_score.
- Set audience_persona_used to "${sko.audience_persona.primary}".
- Set scoring_methodology to a 1-sentence summary of your weighting approach.
- reasoning per hook must be 1–2 sentences grounding the score in the audience persona.`);
}
