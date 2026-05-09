"use client";

import { Fragment, useMemo } from "react";
import { useProjectCost } from "@/src/hooks/useProjectCost";
import { useProjectRefunds } from "@/src/hooks/useProjectRefunds";

const AGENT_LABELS: Record<string, string> = {
  ingest: "Ingestion",
  analyze: "Analysis",
  extract: "Extraction",
  preflight: "Pre-flight Check",
  synthesize_twitter: "Twitter Synthesis",
  synthesize_linkedin: "LinkedIn Synthesis",
  synthesize_newsletter: "Newsletter Synthesis",
  synthesize_veo: "Veo Synthesis",
  synthesize_dark_social: "Dark Social Synthesis",
  score_hooks: "Hook Scoring",
  authenticate: "Authentication",
  refine_tone: "Tone Refinement",
  regenerate_twitter: "Twitter Synthesis",
  regenerate_linkedin: "LinkedIn Synthesis",
  regenerate_newsletter: "Newsletter Synthesis",
  regenerate_veo: "Veo Synthesis",
  regenerate_dark_social: "Dark Social Synthesis",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  veo: "Veo Script",
  dark_social: "Dark Social",
};

function agentLabel(name: string): string {
  return AGENT_LABELS[name] ?? name.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CostBreakdownProps {
  projectId: string;
  // Pipeline-wide stage refund (full / synthesis_only — set on total pipeline failure only)
  refundedAmount?: number;
  refundStage?: "full" | "synthesis_only";
}

export function CostBreakdown({ projectId, refundedAmount }: CostBreakdownProps) {
  const { costLog, loading: costLoading } = useProjectCost(projectId);
  const { refunds, loading: refundLoading } = useProjectRefunds(projectId);

  const loading = costLoading || refundLoading;

  // --- Refund lookups ---
  // Which initial agentNames have been refunded (attempt=0, reason=synthesis_failed)?
  const initialRefundedAgents = useMemo(() => {
    const agents = new Set<string>();
    for (const r of refunds) {
      if (r.attempt === 0 && r.reason === "synthesis_failed") {
        for (const name of r.agentNames) agents.add(name);
      }
    }
    return agents;
  }, [refunds]);

  // Which (platform, attemptIndex) regen groups are refunded?
  const regenRefundedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const r of refunds) {
      if (r.attempt > 0 && r.reason === "regen_failed") {
        keys.add(`${r.platform}:${r.attempt}`);
      }
    }
    return keys;
  }, [refunds]);

  // --- Grouping ---
  // An entry is "initial" if it has no regenPlatform tag.
  // An entry belongs to a regen group if it has a regenPlatform tag.
  // Within each platform, consecutive entries are grouped into attempts:
  // a new attempt starts each time we see a regenerate_{platform} agentName.
  const { initialEntries, regenGroups } = useMemo(() => {
    const initial = costLog.filter((e) => !e.regenPlatform);
    const regenEntries = costLog.filter((e) => !!e.regenPlatform);

    // Group by platform, then split into attempts on each regenerate_{platform} boundary
    const platformAttempts: Map<string, Array<typeof regenEntries>> = new Map();

    for (const entry of regenEntries) {
      const plat = entry.regenPlatform!;
      if (!platformAttempts.has(plat)) platformAttempts.set(plat, [[]]);
      const attempts = platformAttempts.get(plat)!;
      const lastGroup = attempts[attempts.length - 1];
      // New attempt starts when the last group already has a regenerate_ entry AND the
      // incoming entry is either refine_tone (start of next refinement cycle) or another
      // regenerate_ (retry-only path with no refine_tone prefix).
      const lastGroupHasRegen = lastGroup.some((e) => e.agentName.startsWith("regenerate_"));
      const isAttemptStarter =
        entry.agentName === "refine_tone" || entry.agentName.startsWith("regenerate_");
      if (lastGroupHasRegen && isAttemptStarter) {
        attempts.push([entry]);
      } else {
        lastGroup.push(entry);
      }
    }

    const groups: Array<{
      platform: string;
      attemptIndex: number;
      entries: typeof regenEntries;
      isRefunded: boolean;
    }> = [];

    for (const [plat, attempts] of platformAttempts.entries()) {
      attempts.forEach((entries, idx) => {
        if (entries.length > 0) {
          const attemptIndex = idx + 1;
          groups.push({
            platform: plat,
            attemptIndex,
            entries,
            isRefunded: regenRefundedKeys.has(`${plat}:${attemptIndex}`),
          });
        }
      });
    }

    return { initialEntries: initial, regenGroups: groups };
  }, [costLog, regenRefundedKeys]);

  // --- Totals ---
  // Gross = sum of non-refunded entries (refunded rows are still shown but struck-through)
  const gross = useMemo(() => {
    const initGross = initialEntries
      .filter((e) => !initialRefundedAgents.has(e.agentName))
      .reduce((s, e) => s + e.costUsd, 0);
    const regenGross = regenGroups
      .filter((g) => !g.isRefunded)
      .flatMap((g) => g.entries)
      .reduce((s, e) => s + e.costUsd, 0);
    return initGross + regenGross;
  }, [initialEntries, regenGroups, initialRefundedAgents]);

  const pipelineRefund = refundedAmount ?? 0;
  const netCost = Math.max(0, gross - pipelineRefund);
  const hasPipelineRefund = pipelineRefund > 0;
  const hasAnyRefund = initialRefundedAgents.size > 0
    || regenGroups.some((g) => g.isRefunded)
    || hasPipelineRefund;

  if (loading || costLog.length === 0) return null;

  return (
    <details className="group rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] p-4 text-xs">
      <summary className="flex cursor-pointer items-center justify-between gap-6 text-[var(--glass-text-secondary)] select-none">
        <span className="font-medium">Pipeline cost</span>
        <div className="flex items-center gap-2">
          {hasAnyRefund && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-current" />
              Credits returned
            </span>
          )}
          <span className="font-bold text-[var(--glass-text)]">
            ${(hasPipelineRefund ? netCost : gross).toFixed(4)} →
          </span>
        </div>
      </summary>

      <div className="mt-3" style={{ display: "grid", gridTemplateColumns: "1fr max-content max-content", gap: "4px 16px" }}>

        {/* Initial generation */}
        {initialEntries.length > 0 && (
          <span className="col-span-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--glass-text-tertiary)] mt-2 mb-1">
            Initial generation
          </span>
        )}
        {initialEntries.map((entry, i) => {
          const refunded = initialRefundedAgents.has(entry.agentName);
          return (
            <Fragment key={`init-${i}`}>
              <span className={`truncate pl-2 ${refunded ? "line-through text-emerald-400/60" : "text-[var(--glass-text-secondary)]"}`}>
                {agentLabel(entry.agentName)}
              </span>
              <span className={`text-right tabular-nums ${refunded ? "line-through text-emerald-400/60" : "text-[var(--glass-text-tertiary)]"}`}>
                {(entry.promptTokens + entry.outputTokens).toLocaleString()} tok
              </span>
              <span className={`text-right font-mono tabular-nums ${refunded ? "line-through text-emerald-400 font-medium" : "text-[var(--glass-text)]"}`}>
                ${entry.costUsd.toFixed(4)}
              </span>
            </Fragment>
          );
        })}

        {/* Regen attempt groups */}
        {regenGroups.map((group) => (
          <Fragment key={`regen-${group.platform}-${group.attemptIndex}`}>
            <span className="col-span-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--glass-text-tertiary)] mt-3 mb-1">
              Regeneration {group.attemptIndex} · {platformLabel(group.platform)}
            </span>
            {group.entries.map((entry, i) => (
              <Fragment key={`regen-e-${i}`}>
                <span className={`truncate pl-2 ${group.isRefunded ? "line-through text-emerald-400/60" : "text-[var(--glass-text-secondary)]"}`}>
                  {agentLabel(entry.agentName)}
                </span>
                <span className={`text-right tabular-nums ${group.isRefunded ? "line-through text-emerald-400/60" : "text-[var(--glass-text-tertiary)]"}`}>
                  {(entry.promptTokens + entry.outputTokens).toLocaleString()} tok
                </span>
                <span className={`text-right font-mono tabular-nums ${group.isRefunded ? "line-through text-emerald-400 font-medium" : "text-[var(--glass-text)]"}`}>
                  ${entry.costUsd.toFixed(4)}
                </span>
              </Fragment>
            ))}
          </Fragment>
        ))}

        {/* Footer */}
        <span className="col-span-3 border-t border-[var(--glass-border)] mt-2 pt-1" />
        <span className="font-medium text-[var(--glass-text-secondary)]">
          {hasPipelineRefund ? "Gross" : "Total"}
        </span>
        <span />
        <span className="text-right font-mono font-medium text-[var(--glass-text)] tabular-nums">
          ${gross.toFixed(4)}
        </span>

        {hasPipelineRefund && (
          <Fragment key="pipeline-refund">
            <span className="text-emerald-400 font-medium">Credits returned</span>
            <span />
            <span className="text-right font-mono font-medium text-emerald-400 tabular-nums">
              −${pipelineRefund.toFixed(4)}
            </span>
          </Fragment>
        )}

        {hasPipelineRefund && (
          <Fragment key="net">
            <span className="col-span-3 border-t border-emerald-500/20 mt-1 pt-1" />
            <span className="font-semibold text-[var(--glass-text)]">You paid</span>
            <span />
            <span className="text-right font-mono font-semibold text-[var(--glass-text)] tabular-nums">
              ${netCost.toFixed(4)}
            </span>
          </Fragment>
        )}
      </div>
    </details>
  );
}
