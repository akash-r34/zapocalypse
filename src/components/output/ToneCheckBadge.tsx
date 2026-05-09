"use client";

import { useToneCheck } from "@/src/hooks/useToneCheck";

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  veo: "Veo Video Script",
  dark_social: "Dark Social",
};

const ALL_PLATFORMS = ["twitter", "linkedin", "newsletter", "veo", "dark_social"];

interface PlatformResult {
  match_score: number;
  deviations: string[];
  suggested_fixes: string[];
}

interface ToneCheckBadgeProps {
  projectId: string;
  outputErrors?: Record<string, string>;
}

export function ToneCheckBadge({ projectId, outputErrors }: ToneCheckBadgeProps) {
  const { data, loading } = useToneCheck(projectId);

  if (loading || !data) return null;

  const passed = data.passed as boolean;
  const score = data.overall_match_score as number;
  const perPlatform = (data.per_platform ?? {}) as Record<string, PlatformResult>;

  // Build the platform list: scored platforms first (sorted desc), then failed ones at 0%.
  // Exclude any per_platform entry whose platform currently has an outputError — those belong
  // in the failedPlatforms section (handles stale 0-score entries on existing projects).
  const scoredPlatforms = Object.entries(perPlatform)
    .filter(([platform]) => !outputErrors?.[platform])
    .sort(([, a], [, b]) => b.match_score - a.match_score);

  const failedPlatforms = ALL_PLATFORMS.filter((p) => !!outputErrors?.[p]);

  return (
    <details className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)] text-xs overflow-hidden">
      <summary
        className={`flex cursor-pointer items-center gap-2 px-4 py-3 select-none list-none ${
          passed
            ? "text-green-400"
            : "text-[var(--glass-warning)]"
        }`}
      >
        <span>{passed ? "✓" : "⚠"}</span>
        <span className="font-semibold">{(score * 100).toFixed(0)}% tone</span>
        <span className="opacity-60 ml-0.5">▴</span>
      </summary>

      <div className="px-4 pb-4 space-y-4">
        {/* Explainer */}
        <p className="text-[var(--glass-text-secondary)] leading-relaxed">
          Tone match measures how closely outputs match your source&apos;s voice and style.
        </p>

        {/* Per-platform breakdown */}
        <div className="space-y-3">
          {scoredPlatforms.map(([platform, result]) => {
            const pct = Math.round(result.match_score * 100);
            const label = PLATFORM_LABELS[platform] ?? platform;
            return (
              <div key={platform} className="space-y-1.5">
                {/* Bar row */}
                <div className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[var(--glass-text-secondary)]">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--glass-bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[var(--glass-text)] shrink-0">
                    {pct}%
                  </span>
                </div>
                {/* Deviations */}
                {result.deviations.map((d, i) => (
                  <p key={i} className="pl-1 text-[var(--glass-text-tertiary)] leading-snug">
                    · {d}
                  </p>
                ))}
                {/* Suggested fixes */}
                {result.suggested_fixes.map((f, i) => (
                  <p key={i} className="pl-1 text-[var(--glass-text-secondary)] font-medium leading-snug">
                    → {f}
                  </p>
                ))}
              </div>
            );
          })}

          {/* Failed platforms — 0% bar with failure message */}
          {failedPlatforms.map((platform) => {
            const label = PLATFORM_LABELS[platform] ?? platform;
            return (
              <div key={platform} className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[var(--glass-text-secondary)]">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--glass-bg-secondary)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--glass-danger)]" style={{ width: "0%" }} />
                  </div>
                  <span className="w-8 text-right font-mono text-[var(--glass-danger)] shrink-0">0%</span>
                </div>
                <p className="pl-1 text-[var(--glass-danger)]/70 leading-snug">
                  · Content for {label} failed to generate.
                </p>
                <p className="pl-1 text-[var(--glass-text-secondary)] font-medium leading-snug">
                  → Ensure {label} is generated as per the output contract.
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
