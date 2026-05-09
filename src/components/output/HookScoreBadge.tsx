"use client";

const GRADE_CONFIG = {
  A: { color: "#34c759" },
  B: { color: "#007aff" },
  C: { color: "#ffd60a" },
  D: { color: "#ff9f0a" },
  F: { color: "#ff453a" },
} as const;

type Grade = keyof typeof GRADE_CONFIG;

interface HookScoreBadgeProps {
  grade: Grade;
  compositeScore: number;
  dimensions?: {
    novelty: number;
    emotional_resonance: number;
    niche_relevance: number;
    shareability: number;
  };
}

export function HookScoreBadge({ grade, compositeScore, dimensions }: HookScoreBadgeProps) {
  const { color } = GRADE_CONFIG[grade];
  const pct = Math.round(compositeScore * 100);

  const title = dimensions
    ? `Novelty: ${Math.round(dimensions.novelty * 100)}% · Resonance: ${Math.round(dimensions.emotional_resonance * 100)}% · Niche: ${Math.round(dimensions.niche_relevance * 100)}% · Shareable: ${Math.round(dimensions.shareability * 100)}%`
    : `Score: ${pct}%`;

  return (
    <span
      title={title}
      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none shrink-0"
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {grade} <span className="opacity-70">{pct}%</span>
    </span>
  );
}
