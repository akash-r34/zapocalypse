import type { IngestedContent } from "@/src/lib/ai/schemas/ingested-content";
import type { InformationGainScore } from "@/src/lib/ai/schemas/information-gain";

export function buildExtractPrompt(ingested: IngestedContent, analysisScore?: InformationGainScore): string {
  const sectionsText = ingested.contentSections
    .map((s) => `## ${s.heading}\n${s.body}`)
    .join("\n\n");

  const analysisContext = analysisScore
    ? `\nCONTENT QUALITY ANALYSIS (use this to weight your extraction):
Overall Score: ${analysisScore.overall_score.toFixed(1)}/10 (Grade: ${analysisScore.grade})
Classification: ${analysisScore.content_classification}
Strongest Asset: ${analysisScore.strongest_asset}
Biggest Gap: ${analysisScore.biggest_gap}
${analysisScore.grade === "D" || analysisScore.grade === "F" ? "⚠️ LOW ORIGINALITY: Weight semantic chunks toward the most specific and unique insights. Prioritize any concrete data, examples, or counterintuitive conclusions over generic observations." : "Weight semantic chunks toward the highest-scoring originality signals."}\n`
    : "";

  return `You are a semantic knowledge extraction agent. Your job is to analyze content and build a Structured Knowledge Object (SKO) — a semantic hub that will be used to generate platform-specific content.
${analysisContext}

TITLE: ${ingested.title}
WORD COUNT: ${ingested.metadata.wordCount}
${ingested.metadata.author ? `AUTHOR: ${ingested.metadata.author}` : ""}

CONTENT:
${sectionsText}

Extract the following:

1. CORE THESIS: A single paragraph (3-5 sentences) capturing the central argument or insight of the content. This must be the distilled essence — not a summary.

2. AUDIENCE PERSONA: Who is this content most valuable for? Define:
   - primary: The main audience (role + context)
   - secondary: A secondary audience who would also benefit
   - pain_points: 3-5 specific frustrations this content addresses
   - desired_outcomes: 3-5 things they want to achieve after reading

3. VIRAL HOOKS: 5-8 provocative, standalone statements derived from the content. These should work as tweet-length hooks, LinkedIn openers, or video titles. Make them specific, surprising, or counterintuitive. Do NOT use vague claims.

4. SEMANTIC CHUNKS: Break the content into 5-9 atomic insight units. For each:
   - id: snake_case identifier (e.g., "chunk_main_insight")
   - heading: short descriptive label
   - key_insight: the core takeaway in one sentence
   - supporting_data: specific data, stats, or examples (null if none)
   - emotional_valence: one word describing the emotional response (e.g., "alarming", "inspiring", "counterintuitive", "validating", "provocative")
   - relevance_score: 0.0-1.0 score for how central this is to the core thesis

5. BRAND TONE FINGERPRINT: Characterize the author's voice using both subtractive (what to avoid) and additive (unique positive markers) traits:
   - voice: 2-4 word description (e.g., "authoritative but accessible")
   - style: 2-4 word description (e.g., "evidence-first, contrarian")
   - vocabulary_level: "technical", "accessible", "academic", etc.
   - preferred_structures: list of rhetorical structures used (e.g., "myth-busting", "numbered frameworks")
   - avoid: list of tone elements NOT present in this content (e.g., "corporate jargon", "hedging", "passive voice")
   
   ADDITIVE POSITIVE MARKERS:
   - analogy_style: Describe how the author uses analogies or metaphors (e.g., "explains technical concepts using mechanical metaphors", "uses sports analogies to explain business strategy")
   - sentence_cadence: Categorize the variance in sentence lengths on a spectrum (NOT word counts). Use "low" for uniform sentence lengths, "medium" for some variance, or "high" for alternating very short and very long sentences.
   - signature_phrases: List recurring expressions or unique phrases the author uses.
   - storytelling_structure: Describe how they structure their points (e.g., "opens with a personal anecdote, pivots to data", "starts with a provocative question, answers it with a case study")
   - humor_type: Characterize their humor (e.g., "dry self-deprecation with industry in-jokes", "playful but professional")
   - colloquialisms: List niche-specific informal terms or industry slang they use naturally.
   - explanation_pattern: How they break down complex topics (e.g., "first-principles thinking", "step-by-step logical progression")

Respond with a valid JSON object matching the required schema. Ensure the additive markers are captured even if subtle.`;
}
