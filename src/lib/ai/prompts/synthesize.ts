import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { InformationGainScore } from "@/src/lib/ai/schemas/information-gain";

function formatSKO(sko: SKO, refinedFingerprint?: Partial<SKO["brand_tone_fingerprint"]>): string {
  const tone = { ...sko.brand_tone_fingerprint, ...refinedFingerprint };
  
  let additiveMarkers = "";
  if (tone.analogy_style) additiveMarkers += `\nANALOGY STYLE: ${tone.analogy_style}`;
  if (tone.sentence_cadence) additiveMarkers += `\nSENTENCE CADENCE: ${tone.sentence_cadence} variance (low/medium/high)`;
  if (tone.signature_phrases?.length) additiveMarkers += `\nSIGNATURE PHRASES: ${tone.signature_phrases.join(", ")}`;
  if (tone.storytelling_structure) additiveMarkers += `\nSTORYTELLING STRUCTURE: ${tone.storytelling_structure}`;
  if (tone.humor_type) additiveMarkers += `\nHUMOR TYPE: ${tone.humor_type}`;
  if (tone.colloquialisms?.length) additiveMarkers += `\nCOLLOQUIALISMS: ${tone.colloquialisms.join(", ")}`;
  if (tone.explanation_pattern) additiveMarkers += `\nEXPLANATION PATTERN: ${tone.explanation_pattern}`;

  return `CORE THESIS: ${sko.core_thesis}

AUDIENCE:
- Primary: ${sko.audience_persona.primary}
- Pain points: ${sko.audience_persona.pain_points.join("; ")}

TOP VIRAL HOOKS:
${sko.viral_hooks.map((h, i) => `${i + 1}. ${h}`).join("\n")}

KEY INSIGHTS:
${sko.semantic_chunks.map((c) => `- [${c.emotional_valence}] ${c.key_insight}${c.supporting_data ? ` (${c.supporting_data})` : ""}`).join("\n")}

BRAND TONE: ${tone.voice} / ${tone.style}
AVOID: ${tone.avoid.join(", ")}${additiveMarkers}`;
}

export function buildTwitterPrompt(sko: SKO, analysisScore?: InformationGainScore, refinedFingerprint?: Partial<SKO["brand_tone_fingerprint"]>): string {
  const isLowOriginality = analysisScore && (analysisScore.grade === "D" || analysisScore.grade === "F");
  const contrarianCount = isLowOriginality ? "at least 5" : "at least 3";
  const tone = { ...sko.brand_tone_fingerprint, ...refinedFingerprint };

  return `You are a viral Twitter/X content writer and GEO (Generative Engine Optimization) strategist. Generate a 10-tweet thread from the following Structured Knowledge Object.

${formatSKO(sko, refinedFingerprint)}${isLowOriginality ? `\n\n⚠️ LOW ORIGINALITY SOURCE (Grade ${analysisScore.grade}): This content is derivative. Increase contrarian angles and frame takes as more provocative to add information value.` : ""}

Requirements:
- Tweet 1: Must be a standalone hook that stops the scroll. Use the strongest viral hook. Max 280 chars.
- Tweets 2-9: Each expands one insight. Mix data tweets, contrarian takes, and practical advice.
- Tweet 10: Strong CTA (follow, share, reply, or save). Make it personal.
- ${contrarianCount} tweets must have type "contrarian" — these challenge conventional wisdom directly
- Each tweet must be independently shareable — no "see above" or "as I said"
- Match the brand tone exactly: ${tone.voice}
- Never use: ${tone.avoid.join(", ")}
- Each tweet under 280 characters (strictly enforced)
- Embody the author's unique markers: use their analogy style, sentence cadence, and signature phrases where appropriate.

For each tweet, also provide:
- hook: the core hook/angle of that tweet (5-10 words)
- type: one of "hook" | "insight" | "data" | "cta" | "bridge" | "contrarian"
- answer_block: a 40-60 word direct answer to the implied question in this tweet, written in plain declarative language. Optimized for AI search engines to cite (GEO). No hedging, no "it depends" — give the direct answer.

Also provide a thread_narrative: 1-2 sentences describing the overall arc of the thread.

Respond with a valid JSON object matching the required schema.`;
}

export function buildLinkedInPrompt(sko: SKO, analysisScore?: InformationGainScore, refinedFingerprint?: Partial<SKO["brand_tone_fingerprint"]>): string {
  const isLowOriginality = analysisScore && (analysisScore.grade === "D" || analysisScore.grade === "F");
  const tone = { ...sko.brand_tone_fingerprint, ...refinedFingerprint };

  return `You are a LinkedIn thought leadership writer and GEO (Generative Engine Optimization) strategist. Generate 5 distinct LinkedIn posts and 1 Document Carousel outline from the following Structured Knowledge Object.

${formatSKO(sko, refinedFingerprint)}${isLowOriginality ? `\n\n⚠️ LOW ORIGINALITY SOURCE (Grade ${analysisScore.grade}): Note in each answer_block where additional original research or first-hand experience would strengthen the claim.` : ""}

POST Requirements:
- Each post must have a different angle/hook — no repetition of the same idea
- Each post: hook (first 2 lines — must create curiosity or stop the scroll), body (3-6 paragraphs of 1-3 short sentences each), CTA (question or action)
- Optimal length: 800-1200 characters per post
- Use line breaks liberally — LinkedIn rewards scannable posts
- Match brand tone: ${tone.voice}
- Avoid: ${tone.avoid.join(", ")}
- Embody unique markers: use their analogy style, storytelling structure, and specific humor type where appropriate.
- Include estimated_read_time_seconds for each post
- answer_block: For each post, write a 40-60 word direct-answer summary before the hook. Written in plain declarative language for AI search engine citation (GEO). State the main insight as a direct answer to an implied question.${isLowOriginality ? ' Note any gaps in originality here.' : ''}

For each post, include:
- hook: the opening 1-2 lines (must create a "read more" moment)
- body: the full post body
- cta: the closing call-to-action question or prompt
- angle: one phrase describing the unique angle of this post (e.g., "myth-busting", "personal story", "data-first")
- answer_block: the 40-60 word GEO-optimized summary

DOCUMENT CAROUSEL (1 outline, 5-7 pages):
Create a framework or checklist PDF outline. This is a thought-leadership carousel people save and share.
- title: the carousel title (should be a framework name or checklist title)
- slides: 5-7 slides, each with page_number, headline, body (2-4 bullet points or 2-3 sentences), and optional visual_suggestion
- summary: 1-2 sentences describing the carousel's value proposition

Slide 1 is always a cover/title slide. Last slide is always a CTA/about slide.

Respond with a valid JSON object matching the required schema.`;
}

export function buildNewsletterPrompt(sko: SKO, analysisScore?: InformationGainScore, refinedFingerprint?: Partial<SKO["brand_tone_fingerprint"]>): string {
  const isLowOriginality = !!(analysisScore && (analysisScore.grade === "D" || analysisScore.grade === "F"));
  const tone = { ...sko.brand_tone_fingerprint, ...refinedFingerprint };

  return `You are a newsletter writer. Write a single high-quality newsletter edition from the following Structured Knowledge Object.${isLowOriginality ? "\n\n⚠️ LOW ORIGINALITY SOURCE: Frame this newsletter honestly as a synthesis of existing thinking on the topic. The value is curation and perspective, not original research." : ""}

${formatSKO(sko, refinedFingerprint)}

Requirements:
- subject_line: 6-10 words, creates urgency or curiosity, no clickbait
- preview_text: 100-150 chars that complement (not repeat) the subject line
- sections: 3-5 sections. Each has a heading and content (2-4 paragraphs). Structure:
  1. Opening hook section
  2. Main insight section(s)
  3. Practical application section
  4. Closing/CTA section
- cta: a clear call to action at the end with text (the link/action text) and context (why they should do it)
- estimated_read_time_minutes: realistic estimate

Match brand tone: ${tone.voice}
Style: ${tone.style}
Avoid: ${tone.avoid.join(", ")}
Embody unique markers: strictly follow the storytelling structure, analogy style, and explanation pattern provided.

The newsletter should feel like a premium, opinionated take — not a rehash of the original content.

Respond with a valid JSON object matching the required schema.`;
}

export function buildVeoPrompt(sko: SKO, refinedFingerprint?: Partial<SKO["brand_tone_fingerprint"]>): string {
  const tone = { ...sko.brand_tone_fingerprint, ...refinedFingerprint };

  return `You are a short-form video script writer. Write a vertical video script (9:16 format, 60-90 seconds) from the following Structured Knowledge Object.

${formatSKO(sko, refinedFingerprint)}

Requirements:
- title: a compelling video title (used as the hook/caption)
- hook_seconds: how long the hook scene runs (must be 3-7 seconds — this is the make-or-break moment)
- scenes: 5-9 scenes. For each:
  - scene_number: sequential integer
  - duration_seconds: how long this scene runs
  - visual_description: specific, cinematic description of what's on screen (not just "person talking") — describe camera angle, motion, setting
  - voiceover: exact script text spoken during this scene
  - on_screen_text: optional text overlay (keep to 5 words max)
- total_duration_seconds: sum of all scene durations (60-90 seconds)
- aspect_ratio: "9:16" (vertical)
- style_notes: 2-3 sentences on the visual aesthetic and pacing

The hook scene must grab attention in the first 3 seconds. Open with the most provocative hook from the SKO.

Match brand tone: ${tone.voice}
Embody unique markers: use their signature phrases and colloquialisms naturally in the voiceover.

Respond with a valid JSON object matching the required schema.`;
}

export function buildDarkSocialPrompt(sko: SKO, refinedFingerprint?: Partial<SKO["brand_tone_fingerprint"]>): string {
  const tone = { ...sko.brand_tone_fingerprint, ...refinedFingerprint };

  return `You are a Dark Social content strategist. Generate short, high-value snippets for private community sharing (Slack workspaces, Discord servers, private DMs). These are NOT public posts — they get shared person-to-person in professional communities where people share things because they're genuinely useful, not to look good.

${formatSKO(sko, refinedFingerprint)}

Requirements:
- Dark social content must feel like a colleague sharing a useful insight, not a brand broadcasting
- No hashtags, no emojis used for decoration (only if they clarify meaning), no "check this out!" energy
- Lead with the most surprising or useful insight — people share things that make them look smart for finding it

Generate:

1. slack_message:
   - hook: 1 sentence that would make someone in a Slack channel stop scrolling (max 100 chars)
   - body: 3-5 sentences expanding the insight with enough context to be valuable standalone. No links needed — this should be complete in itself (max 500 chars)
   - emoji_prefix: 1-2 emojis that signal the content type (e.g., "📊" for data, "💡" for insight, "🔥" for hot take)

2. discord_message:
   - hook: slightly more casual than Slack, but still intelligent (max 100 chars)
   - body: conversational expansion, can use bold **text** for emphasis (max 500 chars)
   - embed_title: optional title for a Discord embed card (if relevant)

3. shareable_quote: The single most screenshot-worthy line from the content. Something someone would screenshot and share to their story or DM. Under 200 chars. No attribution needed.

4. context_line: "From [source title/topic] via Zapocalypse" — max 100 chars. Gives credit without being promotional.

Match the intelligence level and vocabulary of: ${tone.vocabulary_level}
Tone: ${tone.voice}
Embody unique markers: use their signature phrases and specific colloquialisms to make it feel authentic to the author.

Respond with a valid JSON object matching the required schema.`;
}
