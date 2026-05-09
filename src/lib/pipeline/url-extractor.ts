import { extract } from "@extractus/article-extractor";

export interface ExtractedArticle {
  title: string;
  content: string;
  author: string | null;
  publishDate: string | null;
}

export class UrlExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrlExtractionError";
  }
}

const YOUTUBE_PATTERN = /(?:youtube\.com\/watch|youtu\.be\/)/i;

export async function extractFromUrl(url: string): Promise<ExtractedArticle> {
  if (YOUTUBE_PATTERN.test(url)) {
    throw new UrlExtractionError(
      "YouTube URLs are not supported yet. Please paste the transcript manually as text."
    );
  }

  const article = await extract(url);

  if (!article || !article.content) {
    throw new UrlExtractionError(
      "Could not extract article content from this URL. Try pasting the text directly."
    );
  }

  // Strip HTML tags from extracted content
  const plainText = stripHtml(article.content);

  if (plainText.length < 100) {
    throw new UrlExtractionError(
      "Extracted content is too short. Try pasting the text directly."
    );
  }

  return {
    title: article.title ?? inferTitleFromUrl(url),
    content: plainText,
    author: article.author ?? null,
    publishDate: article.published ?? null,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function inferTitleFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const slug = pathname.split("/").filter(Boolean).pop() ?? "article";
    return slug
      .replace(/[-_]/g, " ")
      .replace(/\.\w+$/, "")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Untitled Article";
  }
}
