"use client";

import { useState } from "react";
import { useHookScores } from "@/src/hooks/useHookScores";
import { HookScoreBadge } from "./HookScoreBadge";
import type { ScoredHook } from "@/src/lib/ai/schemas/hook-score";

const PLATFORM_LABELS: Record<string, { label: string; color: string }> = {
  twitter:      { label: "X / Twitter", color: "#007aff" },
  linkedin:     { label: "LinkedIn",    color: "#0077b5" },
  newsletter:   { label: "Newsletter",  color: "#34c759" },
  dark_social:  { label: "Dark Social", color: "#8e44ad" },
};

interface HookLeaderboardProps {
  projectId: string;
}

export function HookLeaderboard({ projectId }: HookLeaderboardProps) {
  const { data, loading } = useHookScores(projectId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="rounded-2xl p-6 glass animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded-xl bg-[var(--glass-bg-secondary)]" />
        ))}
      </div>
    );
  }

  if (!data?.hooks?.length) {
    return (
      <div className="rounded-2xl p-6 glass text-center">
        <p className="text-sm text-[var(--glass-text-tertiary)]">Hook scores not available for this project.</p>
      </div>
    );
  }

  const hooks = [...(data.hooks as ScoredHook[])].sort(
    (a, b) => b.composite_score - a.composite_score
  );

  return (
    <div className="rounded-2xl p-5 glass space-y-2">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest">
          Hook Leaderboard
        </p>
        <span className="text-xs text-[var(--glass-text-tertiary)]">
          {hooks.length} hooks ranked
        </span>
      </div>

      {hooks.map((hook, idx) => {
        const isTop = hook.hook_id === data.top_hook_id;
        const platformInfo = PLATFORM_LABELS[hook.platform] ?? { label: hook.platform, color: "#888" };
        const isExpanded = expandedId === hook.hook_id;
        const hasVariants = hook.ab_variants && hook.ab_variants.length > 0;

        return (
          <div
            key={hook.hook_id}
            className={`rounded-xl px-3 py-2.5 transition-all duration-200 ${
              isTop
                ? "border border-[var(--glass-accent)]/25 bg-[var(--glass-accent)]/5"
                : "border border-transparent hover:bg-[var(--glass-bg-secondary)]/50"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Rank */}
              <span className={`text-xs font-bold shrink-0 w-5 text-right ${
                idx === 0 ? "text-[var(--glass-accent)]" : "text-[var(--glass-text-tertiary)]"
              }`}>
                {idx + 1}
              </span>

              {/* Platform pill */}
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
                style={{
                  backgroundColor: `${platformInfo.color}20`,
                  color: platformInfo.color,
                }}
              >
                {platformInfo.label}
              </span>

              {/* Hook text */}
              <p className="text-xs text-[var(--glass-text-secondary)] truncate flex-1 min-w-0">
                {hook.original_text}
              </p>

              {/* Score badge */}
              <HookScoreBadge
                grade={hook.grade}
                compositeScore={hook.composite_score}
                dimensions={hook.scores}
              />

              {/* A/B toggle */}
              {hasVariants && (
                <button
                  onClick={() => setExpandedId(isExpanded ? null : hook.hook_id)}
                  className="text-[10px] font-medium text-[var(--glass-accent)] shrink-0 hover:opacity-70 transition-opacity"
                >
                  {isExpanded ? "▲" : "A/B"}
                </button>
              )}
            </div>

            {/* A/B variants */}
            {isExpanded && hasVariants && (
              <div className="mt-2 ml-7 space-y-1.5">
                {hook.ab_variants!.map((v, vi) => (
                  <div key={vi} className="rounded-lg bg-[var(--glass-bg-secondary)] px-3 py-2">
                    <p className="text-xs text-[var(--glass-text)]">{v.text}</p>
                    <p className="text-[10px] text-[var(--glass-text-tertiary)] mt-0.5">{v.rationale}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Persona footnote */}
      {data.audience_persona_used && (
        <p className="text-[10px] text-[var(--glass-text-tertiary)] pt-2 border-t border-[var(--glass-border)]/20">
          Scores anchored to: {data.audience_persona_used as string}
        </p>
      )}
    </div>
  );
}
