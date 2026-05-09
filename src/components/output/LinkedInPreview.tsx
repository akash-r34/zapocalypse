"use client";

import { useState } from "react";
import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";
import { OverflowMenu } from "@/src/components/ui/OverflowMenu";
import { CarouselPreview } from "./CarouselPreview";
import { NativeLinkedInPreview } from "./native/NativeLinkedInPreview";
import { HookScoreBadge } from "./HookScoreBadge";
import type { ScoredHook } from "@/src/lib/ai/schemas/hook-score";

interface PostData {
  hook: string;
  body: string;
  cta: string;
  angle: string;
  estimated_read_time_seconds?: number;
  answer_block?: string;
}

interface CarouselSlide {
  page_number: number;
  headline: string;
  body: string;
  visual_suggestion?: string;
}

type HookScoreLookup = Record<string, Pick<ScoredHook, "grade" | "composite_score" | "scores">>;

interface LinkedInPreviewProps {
  posts: PostData[];
  document_carousel?: {
    title: string;
    slides: CarouselSlide[];
    summary: string;
  };
  isNative?: boolean;
  hookScores?: HookScoreLookup;
}

export function LinkedInPreview({ posts, document_carousel, isNative, hookScores }: LinkedInPreviewProps) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const { copy, isCopied } = useCopyToClipboard();

  function formatPost(post: PostData): string {
    return `${post.hook}\n\n${post.body}\n\n${post.cta}`;
  }

  const allText = posts
    .map((p, i) => `--- Post ${i + 1} (${p.angle}) ---\n\n${formatPost(p)}`)
    .join("\n\n");

  if (isNative && posts.length > 0) {
    return (
      <div className="space-y-6 flex flex-col items-center">
        {posts.map((post, i) => (
          <NativeLinkedInPreview key={i} post={post} />
        ))}
        {/* Bulk actions */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <CopyButton
            copied={isCopied("all-linkedin")}
            onClick={() => copy(allText, "all-linkedin")}
            label="Copy all posts"
          />
          <DownloadButton
            content={allText}
            filename="linkedin-posts.txt"
            label="Download all"
          />
        </div>
        {document_carousel && (
          <div className="space-y-2 pt-2 w-full max-w-[550px] mx-auto">
            <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest text-center">
              Document Carousel Outline
            </p>
            <CarouselPreview carousel={document_carousel} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, i) => {
        const isExpanded = i === expandedIndex;
        const fullText = formatPost(post);

        return (
          <div
            key={i}
            className={`rounded-xl overflow-hidden transition-all duration-200 glass ${
              isExpanded ? "border-[var(--glass-border-light)]" : ""
            }`}
          >
            <button
              onClick={() => setExpandedIndex(i)}
              className="w-full text-left p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--glass-accent)]/10 text-[var(--glass-text-secondary)] shrink-0">
                  {post.angle}
                </span>
                {hookScores?.[`linkedin_${i}`] && (
                  <HookScoreBadge
                    grade={hookScores[`linkedin_${i}`].grade}
                    compositeScore={hookScores[`linkedin_${i}`].composite_score}
                    dimensions={hookScores[`linkedin_${i}`].scores}
                  />
                )}
                <span className="text-sm font-medium truncate text-[var(--glass-text)]">
                  {post.hook.slice(0, 60)}
                  {post.hook.length > 60 ? "..." : ""}
                </span>
              </div>
              <span className="text-xs text-[var(--glass-text-tertiary)] ml-3 shrink-0">
                {isExpanded ? "▲" : "▼"}
              </span>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 space-y-3">
                {post.answer_block && (
                  <div className="p-3 rounded-lg bg-[var(--glass-accent)]/5 border border-[var(--glass-accent)]/15">
                    <p className="text-[10px] font-medium text-[var(--glass-accent)] uppercase tracking-widest mb-1">
                      GEO Answer Block
                    </p>
                    <p className="text-xs text-[var(--glass-text-secondary)] leading-relaxed">
                      {post.answer_block}
                    </p>
                  </div>
                )}
                <p className="font-semibold text-sm text-[var(--glass-text)]">
                  {post.hook}
                </p>
                <p className="text-sm whitespace-pre-wrap text-[var(--glass-text-secondary)]">
                  {post.body}
                </p>
                <p className="text-sm italic text-[var(--glass-text)]">
                  {post.cta}
                </p>
                {post.estimated_read_time_seconds && (
                  <p className="text-xs text-[var(--glass-text-tertiary)]">
                    ~{Math.ceil(post.estimated_read_time_seconds / 60)} min read
                  </p>
                )}
                <div className="flex items-center gap-2 pt-2">
                  <CopyButton
                    copied={isCopied(`linkedin-${i}`)}
                    onClick={() => copy(fullText, `linkedin-${i}`)}
                    label="Copy post"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <CopyButton
          copied={isCopied("all-linkedin")}
          onClick={() => copy(allText, "all-linkedin")}
          label="Copy all"
        />
        <OverflowMenu>
          <DownloadButton
            content={allText}
            filename="linkedin-posts.txt"
            label="Download all"
          />
        </OverflowMenu>
      </div>

      {document_carousel && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest">
            Document Carousel Outline
          </p>
          <CarouselPreview carousel={document_carousel} />
        </div>
      )}
    </div>
  );
}
