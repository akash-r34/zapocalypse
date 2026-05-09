"use client";

import { useState } from "react";
import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";

interface CarouselSlide {
  page_number: number;
  headline: string;
  body: string;
  visual_suggestion?: string;
}

interface CarouselData {
  title: string;
  slides: CarouselSlide[];
  summary: string;
}

interface CarouselPreviewProps {
  carousel: CarouselData;
}

export function CarouselPreview({ carousel }: CarouselPreviewProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const { copy, isCopied } = useCopyToClipboard();
  const slide = carousel.slides[activeSlide];

  const fullOutline = [
    `# ${carousel.title}`,
    `${carousel.summary}`,
    "",
    ...carousel.slides.map(
      (s) =>
        `## Page ${s.page_number}: ${s.headline}\n${s.body}${s.visual_suggestion ? `\n\n_Visual: ${s.visual_suggestion}_` : ""}`
    ),
  ].join("\n\n");

  return (
    <div className="space-y-4">
      <div className="rounded-xl glass-elevated p-4">
        <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest mb-1">
          Document Carousel
        </p>
        <p className="text-base font-semibold text-[var(--glass-text)]">{carousel.title}</p>
        <p className="text-xs text-[var(--glass-text-secondary)] mt-1">{carousel.summary}</p>
      </div>

      {/* Slide navigation */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {carousel.slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`shrink-0 text-xs font-medium py-1.5 px-3 rounded-full transition-all duration-150 ${
              i === activeSlide
                ? "bg-[var(--glass-accent)] text-[var(--glass-bg)]"
                : "bg-[var(--glass-bg-secondary)] text-[var(--glass-text-tertiary)] hover:text-[var(--glass-text-secondary)]"
            }`}
          >
            {s.page_number}
          </button>
        ))}
      </div>

      {/* Active slide */}
      {slide && (
        <div className="rounded-xl glass p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--glass-accent)]/10 text-[var(--glass-text-secondary)]">
              Page {slide.page_number}
            </span>
          </div>
          <p className="font-semibold text-sm text-[var(--glass-text)]">{slide.headline}</p>
          <p className="text-sm text-[var(--glass-text-secondary)] whitespace-pre-wrap">{slide.body}</p>
          {slide.visual_suggestion && (
            <p className="text-xs italic text-[var(--glass-text-tertiary)] border-l-2 border-[var(--glass-border)] pl-3">
              Visual: {slide.visual_suggestion}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <CopyButton
          copied={isCopied("carousel-outline")}
          onClick={() => copy(fullOutline, "carousel-outline")}
          label="Copy outline"
        />
        <DownloadButton
          content={fullOutline}
          filename="linkedin-carousel-outline.md"
          label="Download .md"
        />
      </div>
    </div>
  );
}
