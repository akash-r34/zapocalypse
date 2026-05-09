"use client";

import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";
import { OverflowMenu } from "@/src/components/ui/OverflowMenu";
import { NativeNewsletterPreview } from "./native/NativeNewsletterPreview";

interface SectionData {
  heading: string;
  content: string;
}

interface NewsletterPreviewProps {
  subjectLine: string;
  previewText?: string;
  sections: SectionData[];
  cta?: { text: string; context: string };
  estimatedReadTimeMinutes?: number;
  isNative?: boolean;
}

export function NewsletterPreview({
  subjectLine,
  previewText,
  sections,
  cta,
  estimatedReadTimeMinutes,
  isNative,
}: NewsletterPreviewProps) {
  const { copy, isCopied } = useCopyToClipboard();

  const markdown = [
    `# ${subjectLine}`,
    "",
    ...sections.flatMap((s) => [`## ${s.heading}`, "", s.content, ""]),
    cta ? `---\n\n**${cta.text}**\n\n${cta.context}` : "",
  ].join("\n");

  const fullContent = [
    `Subject: ${subjectLine}`,
    previewText ? `Preview: ${previewText}` : "",
    "",
    ...sections.map((s) => `## ${s.heading}\n\n${s.content}`),
    cta ? `\n---\n${cta.context}\n[${cta.text}]` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const plainText = [
    subjectLine,
    "",
    ...sections.flatMap((s) => [`${s.heading}`, "", s.content, ""]),
    cta ? `---\n${cta.text}\n${cta.context}` : "",
  ].join("\n");

  if (isNative) {
    return (
      <div className="space-y-6 flex flex-col items-center">
        <NativeNewsletterPreview subjectLine={subjectLine} sections={sections} cta={cta} />
        <div className="flex items-center justify-center gap-2 pt-2">
          <CopyButton
            copied={isCopied("newsletter")}
            onClick={() => copy(fullContent, "newsletter")}
            label="Copy raw markdown"
          />
          <DownloadButton
            content={fullContent}
            filename="newsletter.md"
            label="Download .md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 md:p-8 space-y-8 glass">
      {/* Email header */}
      <div className="rounded-xl p-6 glass">
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-[var(--glass-text-tertiary)]">
              Subject
            </span>
            <p className="text-lg font-bold text-[var(--glass-text)]">
              {subjectLine}
            </p>
          </div>
          {previewText && (
            <div>
              <span className="text-xs font-medium text-[var(--glass-text-tertiary)]">
                Preview text
              </span>
              <p className="text-sm text-[var(--glass-text-secondary)]">
                {previewText}
              </p>
            </div>
          )}
          {estimatedReadTimeMinutes && (
            <p className="text-xs text-[var(--glass-text-tertiary)]">
              ~{estimatedReadTimeMinutes} min read
            </p>
          )}
        </div>
      </div>

      {/* Newsletter body */}
      <div className="rounded-xl p-8 glass space-y-6">
        {sections.map((section, i) => (
          <div key={i}>
            <h3 className="text-sm font-bold mb-2 text-[var(--glass-text)]">
              {section.heading}
            </h3>
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-[var(--glass-text-secondary)]">
              {section.content}
            </p>
          </div>
        ))}

        {cta && (
          <div className="rounded-xl p-4 bg-[var(--glass-accent)]/8 border border-[var(--glass-border)]">
            <p className="text-sm font-bold mb-1 text-[var(--glass-text)]">{cta.text}</p>
            <p className="text-xs text-[var(--glass-text-secondary)]">{cta.context}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <CopyButton
          copied={isCopied("newsletter-plain")}
          onClick={() => copy(plainText, "newsletter-plain")}
          label="Copy text"
        />
        <OverflowMenu>
          <CopyButton
            copied={isCopied("newsletter-md")}
            onClick={() => copy(markdown, "newsletter-md")}
            label="Copy markdown"
          />
          <DownloadButton
            content={markdown}
            filename="newsletter.md"
            mimeType="text/markdown"
            label="Download .md"
          />
        </OverflowMenu>
      </div>
    </div>
  );
}
