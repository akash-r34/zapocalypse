import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { SynthesisOutputs } from "@/src/lib/pipeline/agent-synthesize";
import { withSystemPrompt } from "./system";

export function buildToneCheckPrompt(sko: SKO, outputs: SynthesisOutputs): string {
  // Build only the sections for platforms that have output — skip null platforms entirely
  // so the AI doesn't produce 0-score per_platform entries for failed platforms.
  const platformSections: string[] = [];

  if (outputs.twitter) {
    const summary = outputs.twitter.tweets
      .map((t, i) => `  ${i + 1}. [${t.type}] ${t.hook}`)
      .join("\n");
    platformSections.push(`### Twitter (hooks only)\n${summary}`);
  }

  if (outputs.linkedin) {
    const summary = outputs.linkedin.posts
      .map((p, i) => `  ${i + 1}. [${p.angle}] ${p.hook.slice(0, 80)}`)
      .join("\n");
    platformSections.push(`### LinkedIn (hooks/angles only)\n${summary}`);
  }

  if (outputs.newsletter) {
    const summary = `  Subject: ${outputs.newsletter.subject_line}\n  Sections: ${outputs.newsletter.sections.map((s) => s.heading).join(", ")}`;
    platformSections.push(`### Newsletter\n${summary}`);
  }

  if (outputs.dark_social) {
    const summary = `  Slack: ${outputs.dark_social.slack_message.hook}\n  Quote: ${outputs.dark_social.shareable_quote}`;
    platformSections.push(`### Dark Social\n${summary}`);
  }

  return withSystemPrompt(`## YOUR TASK: Tone Fingerprint Check

Analyze the generated content against the brand voice fingerprint from the Structured Knowledge Object. Flag any tone inconsistencies and detect AI slop patterns.

## BRAND VOICE FINGERPRINT (source of truth)
Voice: ${sko.brand_tone_fingerprint.voice}
Style: ${sko.brand_tone_fingerprint.style}
Vocabulary Level: ${sko.brand_tone_fingerprint.vocabulary_level}
Preferred Structures: ${sko.brand_tone_fingerprint.preferred_structures.join(", ")}
Avoid: ${sko.brand_tone_fingerprint.avoid.join(", ")}

## GENERATED CONTENT SUMMARY

${platformSections.join("\n\n")}

---

## YOUR ANALYSIS

For each platform present above, score tone match (0.0-1.0) and list any deviations from the brand voice. Only analyse platforms listed above — do not produce entries for platforms not shown.

IMPORTANT — use these exact lowercase identifiers as keys in per_platform (not the heading names):
  "twitter", "linkedin", "newsletter", "veo", "dark_social"
Use the same identifiers in ai_slop_flags[].platform.

AI SLOP PATTERNS to detect (common offenders):
- "In today's fast-paced world..."
- "At the end of the day..."
- "Game-changer", "leverage", "synergy", "paradigm shift"
- Excessive use of "delve", "crucial", "key takeaway"
- Starting sentences with "It's worth noting that..."
- Vague superlatives with no evidence ("one of the most important...")
- AI hedging: "While it's difficult to say definitively..."
- Filler transitions: "Furthermore", "Moreover", "In conclusion"

For each slop flag, specify: platform, item_index (0-based), exact pattern found, severity (low/medium/high), and a suggested fix.

Set passed = true if overall_match_score >= 0.7 AND no high-severity slop flags exist.

Respond with a valid JSON object matching the required schema.`);
}
