"use client";

import { useState } from "react";
import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";
import { OverflowMenu } from "@/src/components/ui/OverflowMenu";
import { NativeTwitterPreview } from "./native/NativeTwitterPreview";
import { HookScoreBadge } from "./HookScoreBadge";
import type { ScoredHook } from "@/src/lib/ai/schemas/hook-score";

interface TweetData {
  text: string;
  hook: string;
  type: string;
  answer_block?: string;
}

type HookScoreLookup = Record<string, Pick<ScoredHook, "grade" | "composite_score" | "scores">>;

interface TweetCarouselProps {
  tweets: TweetData[];
  threadNarrative?: string;
  isNative?: boolean;
  hookScores?: HookScoreLookup;
}

export function TweetCarousel({ tweets, threadNarrative, isNative, hookScores }: TweetCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { copy, isCopied } = useCopyToClipboard();
  const tweet = tweets[activeIndex];

  const allText = tweets.map((t, i) => `${i + 1}/${tweets.length}\n${t.text}`).join("\n\n");

  if (isNative && tweets.length > 0) {
    return (
      <div className="space-y-4">
        {threadNarrative && (
          <p className="text-xs italic text-[var(--glass-text-tertiary)]">
            Thread arc: {threadNarrative}
          </p>
        )}
        <div className="space-y-4 flex flex-col items-center">
          {tweets.map((tweet, i) => (
            <NativeTwitterPreview key={i} tweet={tweet} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 pt-2">
          <CopyButton
            copied={isCopied("all-tweets")}
            onClick={() => copy(allText, "all-tweets")}
            label="Copy thread"
          />
          <DownloadButton
            content={allText}
            filename="twitter-thread.txt"
            label="Download thread"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threadNarrative && (
        <p className="text-xs italic text-[var(--glass-text-tertiary)]">
          Thread arc: {threadNarrative}
        </p>
      )}

      {/* Carousel navigation */}
      <div className="flex flex-wrap justify-center items-center gap-2 pb-2">
        {tweets.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-150 ${
              i === activeIndex
                ? "bg-[var(--glass-accent)] text-[var(--glass-bg)]"
                : "bg-[var(--glass-bg-secondary)] text-[var(--glass-text-tertiary)] hover:text-[var(--glass-text-secondary)]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Active tweet card */}
      {tweet && (
        <div className="rounded-xl p-5 glass">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--glass-accent)]/10 text-[var(--glass-text-secondary)]">
                {tweet.type}
              </span>
              {hookScores?.[`twitter_${activeIndex}`] && (
                <HookScoreBadge
                  grade={hookScores[`twitter_${activeIndex}`].grade}
                  compositeScore={hookScores[`twitter_${activeIndex}`].composite_score}
                  dimensions={hookScores[`twitter_${activeIndex}`].scores}
                />
              )}
            </div>
            <span className="text-xs text-[var(--glass-text-tertiary)]">
              {tweet.text.length}/280
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap mb-4 text-[var(--glass-text)]">
            {tweet.text}
          </p>
          {tweet.answer_block && (
            <div className="mb-4 p-3 rounded-lg bg-[var(--glass-accent)]/5 border border-[var(--glass-accent)]/15">
              <p className="text-[10px] font-medium text-[var(--glass-accent)] uppercase tracking-widest mb-1">
                GEO Answer Block
              </p>
              <p className="text-xs text-[var(--glass-text-secondary)] leading-relaxed">
                {tweet.answer_block}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <CopyButton
              copied={isCopied(`tweet-${activeIndex}`)}
              onClick={() => copy(tweet.text, `tweet-${activeIndex}`)}
              label="Copy tweet"
            />
          </div>
        </div>
      )}

      {/* Bulk actions */}
      <div className="flex items-center gap-2">
        <CopyButton
          copied={isCopied("all-tweets")}
          onClick={() => copy(allText, "all-tweets")}
          label="Copy all"
        />
        <OverflowMenu>
          <DownloadButton
            content={allText}
            filename="twitter-thread.txt"
            label="Download thread"
          />
        </OverflowMenu>
      </div>
    </div>
  );
}
