import type { IngestedContent } from "@/src/lib/ai/schemas/ingested-content";

export function buildIngestPrompt(
  sourceType: IngestedContent["sourceType"],
  rawInput: string
): string {
  return `You are a content ingestion agent. Your job is to parse the provided content and extract structured information from it.

SOURCE TYPE: ${sourceType}

CONTENT:
${rawInput}

Extract the following from the content:
1. A clear, descriptive title (infer from context if not explicit)
2. The full raw content as-is
3. A breakdown of the content into logical sections with headings and body text
4. Metadata: author name (if mentioned), publish date (if mentioned), approximate word count

Rules:
- If no explicit title exists, create a descriptive one based on the main topic
- Divide content into 3-8 logical sections based on topic shifts or paragraph groupings
- If no section headings exist in the original, infer them from the content
- Word count should be an integer approximation
- Return null for author and publishDate if not found in the content

Respond with a valid JSON object matching the required schema.`;
}
