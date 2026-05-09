import type { AdditiveFingerprint } from "@/src/types/project";

export function buildRefineTonePrompt(
  originalFingerprint: AdditiveFingerprint,
  feedback: string,
  platform: string
): string {
  return `You are an expert brand voice strategist. Your task is to refine a creator's "Additive Tone Fingerprint" based on specific user feedback for a ${platform} output.

The goal is to strengthen the positive linguistic markers that make this creator unique. Do NOT just focus on what to avoid; focus on what to AMPLIFY.

ORIGINAL FINGERPRINT:
- Analogy Style: ${originalFingerprint.analogy_style || "Not specified"}
- Sentence Cadence: ${originalFingerprint.sentence_cadence || "Not specified"}
- Signature Phrases: ${originalFingerprint.signature_phrases?.join(", ") || "None"}
- Storytelling Structure: ${originalFingerprint.storytelling_structure || "Not specified"}
- Humor Type: ${originalFingerprint.humor_type || "Not specified"}
- Colloquialisms: ${originalFingerprint.colloquialisms?.join(", ") || "None"}
- Explanation Pattern: ${originalFingerprint.explanation_pattern || "Not specified"}

USER FEEDBACK:
"${feedback}"

Instructions:
1. Analyze the user feedback to identify which linguistic markers should be strengthened or added.
2. If the user mentions a specific style (e.g., "more mechanical metaphors"), update the corresponding field (e.g., analogy_style).
3. If the user feedback implies a new marker, add it.
4. Keep all existing markers that aren't contradicted by the feedback.
5. Ensure the refined fingerprint is highly specific and actionable for a content generation agent.

Respond with a valid JSON object matching the following schema:
{
  "analogy_style": "string",
  "sentence_cadence": "low" | "medium" | "high",
  "signature_phrases": ["string"],
  "storytelling_structure": "string",
  "humor_type": "string",
  "colloquialisms": ["string"],
  "explanation_pattern": "string"
}

Ensure the response is ONLY the JSON object.`;
}
