"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { authedFetch } from "@/src/lib/auth/authedFetch";
import { useProject } from "@/src/hooks/useProject";
import { useOutput } from "@/src/hooks/useOutput";
import { useOutputExistence } from "@/src/hooks/useOutputExistence";
import { useHookScores } from "@/src/hooks/useHookScores";
import { TweetCarousel } from "./TweetCarousel";
import { LinkedInPreview } from "./LinkedInPreview";
import { NewsletterPreview } from "./NewsletterPreview";
import { VeoPreview } from "./VeoPreview";
import { DarkSocialPreview } from "./DarkSocialPreview";
import { HookLeaderboard } from "./HookLeaderboard";
import { FeedbackForm } from "./FeedbackForm";
import { RegenerationIndicator, RegenerationBadge } from "./RegenerationIndicator";
import { C2PABadge } from "./C2PABadge";
import type { Platform } from "@/src/types/outputs";
import type { ScoredHook } from "@/src/lib/ai/schemas/hook-score";

type TabKey = Platform | "leaderboard";
type HookScoreLookup = Record<string, Pick<ScoredHook, "grade" | "composite_score" | "scores">>;

function humanizeError(raw: string): string {
  if (!raw) return "Unknown error.";

  if (raw.includes("Empty response from Gemini")) {
    return "Gemini returned an empty response. This can happen with complex prompts — try running the pipeline again.";
  }

  if (raw.toLowerCase().includes("quota") || raw.includes("429")) {
    return "Rate limit reached. Wait a moment and try again.";
  }

  if (raw.includes("SyntaxError") || raw.includes("Unexpected token") || raw.includes("JSON")) {
    return "Gemini returned malformed output that couldn't be parsed. Try running again.";
  }

  try {
    const issues = JSON.parse(raw) as Array<{ message: string; path?: string[] }>;
    if (Array.isArray(issues) && issues.length > 0) {
      return issues
        .map((i) => {
          const path = i.path && i.path.length > 0 ? ` (field: ${i.path.join(".")})` : "";
          return i.message + path;
        })
        .join(" · ");
    }
  } catch {
    // not JSON
  }

  return raw;
}

interface OutputTabsProps {
  projectId: string;
  outputErrors?: Record<string, string>;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "twitter", label: "X / Twitter" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "newsletter", label: "Newsletter" },
  { key: "veo", label: "Veo Script" },
  { key: "dark_social", label: "Dark Social" },
  { key: "leaderboard", label: "Hook Leaderboard" },
];

const nativeIcons = [
  { id: 'twitter', tab: 'twitter', label: 'X', icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { id: 'linkedin', tab: 'linkedin', label: 'LinkedIn', icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { id: 'newsletter', tab: 'newsletter', label: 'Newsletter', icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> },
  { id: 'discord', tab: 'dark_social', label: 'Discord', icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.92.01.02.02.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06-.01.07-.04.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.03.03.03.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.02.03.05.04.08.03 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.92-.01-.01-.02-.02-.03-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12z"/></svg> },
  { id: 'slack', tab: 'dark_social', label: 'Slack', icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.165 0a2.528 2.528 0 012.523 2.522v6.312zM15.165 18.958a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.165 24a2.527 2.527 0 01-2.52-2.52v-2.522h2.52zM15.165 17.687a2.527 2.527 0 01-2.52-2.52 2.527 2.527 0 012.52-2.522h6.313A2.527 2.527 0 0124 15.165a2.528 2.528 0 01-2.522 2.522h-6.313z"/></svg> },
];

const PLATFORM_TABS: Platform[] = ["twitter", "linkedin", "newsletter", "veo", "dark_social"];

export function OutputTabs({ projectId, outputErrors }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("twitter");
  const [nativeView, setNativeView] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  // Tracks whether each platform regen was triggered as a retry vs feedback refinement
  const regenMode = useRef<Record<string, "retry" | "refine">>({});
  // Timestamp of when retry was requested — used to detect Firestore confirmation
  const retryTimestamp = useRef<number>(0);
  // Safety timer to clear retrying if Firestore never responds
  const retryTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { project } = useProject(projectId);
  const { ready } = useOutputExistence(projectId);
  const { data: hookScoreData, loading: hookScoresLoading } = useHookScores(projectId);

  // Derive the displayed tab — if user's selected tab isn't ready yet, show the most recently ready one.
  // Failed tabs are always accessible (user clicked deliberately to see error + retry).
  const effectiveTab: TabKey = useMemo(() => {
    if (activeTab === "leaderboard") return activeTab;
    if (outputErrors?.[activeTab]) return activeTab; // failed tab — show it
    if (ready.length === 0) return activeTab;
    if (ready.includes(activeTab as Platform)) return activeTab;
    return ready[ready.length - 1];
  }, [activeTab, ready, outputErrors]);

  const handleTabClick = (key: TabKey) => {
    setActiveTab(key);
    setNativeView(null);
    setShowFeedback(false);
  };

  // Watch Firestore regenerationState to clear retrying once the server confirms the status
  // change. This prevents the flicker caused by clearing retrying too early (on 202 response).
  useEffect(() => {
    if (!project?.regenerationState) return;
    for (const [platform, entry] of Object.entries(project.regenerationState)) {
      // Clear regen mode for completed/errored platforms
      if (entry.status === "complete" || entry.status === "error") {
        delete regenMode.current[platform];
      }
      // Clear retrying for this platform once Firestore confirms it started (or finished)
      if (retrying === platform) {
        const isConfirmed =
          entry.status === "processing" ||
          entry.status === "complete" ||
          entry.status === "error";
        // Only clear if Firestore update is from after we issued the retry (prevents
        // a stale "processing" from a previous regen clearing too early)
        const entryTime = entry.startedAt?.getTime() ?? 0;
        if (isConfirmed && entryTime >= retryTimestamp.current) {
          if (retryTimeoutId.current) {
            clearTimeout(retryTimeoutId.current);
            retryTimeoutId.current = null;
          }
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setRetrying(null);
        }
      }
    }
  }, [project?.regenerationState, retrying]);

  const handleRetry = async (platform: Platform) => {
    if (retrying) return;
    regenMode.current[platform] = "retry";
    retryTimestamp.current = Date.now();
    setRetrying(platform);
    // Safety: clear retrying after 10s if Firestore never responds
    retryTimeoutId.current = setTimeout(() => {
      setRetrying(null);
      retryTimeoutId.current = null;
    }, 10000);
    // Fire-and-forget — don't await; retrying state cleared by useEffect above
    authedFetch("/api/pipeline/regenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, platform, retry: true }),
    }).catch(() => {
      // Network error — clear retrying immediately
      setRetrying(null);
      if (retryTimeoutId.current) {
        clearTimeout(retryTimeoutId.current);
        retryTimeoutId.current = null;
      }
    });
  };

  const handleNativeClick = (item: typeof nativeIcons[0]) => {
    setActiveTab(item.tab as Platform);
    setNativeView(item.id);
    setShowFeedback(false);
  };

  const activePlatform = effectiveTab as Platform;
  const regenEntry = project?.regenerationState?.[activePlatform];
  const isRegenerating = regenEntry?.status === "processing";
  const regenRefundedAmount = regenEntry?.status === "error" ? regenEntry.refundedAmount : undefined;
  // Per-platform regen count from tone_history is tracked server-side;
  // total count on project doc gives a rough upper bound for UI gating.
  const regenCount = project?.regenerationCount ?? 0;

  const navRegenerating = (tabKey: string) =>
    project?.regenerationState?.[tabKey]?.status === "processing" || retrying === tabKey;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mb-4">
        <div className="flex overflow-x-auto scrollbar-hide rounded-full p-1 gap-1 glass min-w-0 md:w-auto">
          {tabs.map((tab) => {
            const isPlatformTab = PLATFORM_TABS.includes(tab.key as Platform);
            // isFailed only when error exists AND the output hasn't since been regenerated successfully
            const isFailed = isPlatformTab && !!outputErrors?.[tab.key] && !ready.includes(tab.key as Platform);
            const isLeaderboard = tab.key === "leaderboard";
            const regenEntry = isPlatformTab ? project?.regenerationState?.[tab.key] : undefined;
            const isRegeneratingTab = isPlatformTab && (regenEntry?.status === "processing" || retrying === tab.key);

            // Platform tabs: ready when output doc exists OR when failed (make clickable to show error)
            // Leaderboard: ready when hook scores are loaded
            const isReady = isPlatformTab
              ? ready.includes(tab.key as Platform) || isFailed
              : isLeaderboard
                ? !hookScoresLoading && !!hookScoreData?.hooks
                : true;

            // Pending: still generating (not ready and not failed)
            const isPending = isPlatformTab
              ? !ready.includes(tab.key as Platform) && !isFailed
              : isLeaderboard
                ? hookScoresLoading || (!hookScoreData?.hooks && project?.status !== "complete" && project?.status !== "error")
                : false;

            return (
              <button
                key={tab.key}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (isReady || isRegeneratingTab) ? handleTabClick(tab.key) : undefined}
                disabled={!isReady && !isPending && !isRegeneratingTab}
                title={
                  isRegeneratingTab ? "Regenerating…"
                  : isPending ? "Generating…"
                  : isFailed ? "Failed — click to retry"
                  : undefined
                }
                className={`flex-1 shrink-0 whitespace-nowrap text-xs font-medium py-2 px-3 rounded-full transition-all duration-150 ${
                  isFailed && !isRegeneratingTab
                    ? "text-[var(--glass-danger)] opacity-80 cursor-pointer"
                    : isRegeneratingTab
                    ? "text-[var(--glass-accent)] opacity-90 cursor-pointer"
                    : !isReady
                    ? "opacity-30 cursor-not-allowed text-[var(--glass-text-tertiary)]"
                    : effectiveTab === tab.key
                    ? "bg-[var(--glass-accent)] text-[var(--glass-bg)]"
                    : "bg-transparent text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  {isFailed && !isRegeneratingTab ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--glass-danger)]" />
                  ) : isRegeneratingTab ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--glass-accent)] animate-pulse" />
                  ) : isPending ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  ) : null}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 p-1 rounded-full glass shrink-0 sm:overflow-visible overflow-x-auto scrollbar-hide max-w-full">
          <span className="text-[10px] sm:text-[10px] font-bold uppercase tracking-widest text-[var(--glass-text-tertiary)] ml-2 mr-1 whitespace-nowrap hidden sm:inline">Native</span>
          {nativeIcons.map((nav) => {
            const navReady = ready.includes(nav.tab as Platform);
            const navFailed = !!outputErrors?.[nav.tab] && !navReady && !navRegenerating(nav.tab);
            const navRegen = navRegenerating(nav.tab);
            return (
              <button
                key={nav.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => (navReady || navFailed || navRegen) ? handleNativeClick(nav) : undefined}
                disabled={!navReady && !navFailed && !navRegen}
                title={navRegen ? `${nav.label} regenerating…` : navFailed ? `${nav.label} failed` : navReady ? `${nav.label} Preview` : "Generating…"}
                className={`relative p-2 rounded-full transition-all duration-150 ${
                  navFailed
                    ? "opacity-60 text-[var(--glass-danger)] cursor-pointer"
                    : navRegen
                    ? "text-[var(--glass-accent)] opacity-90 cursor-pointer"
                    : !navReady
                    ? "opacity-30 cursor-not-allowed text-[var(--glass-text-tertiary)]"
                    : nativeView === nav.id
                    ? "bg-[var(--glass-accent)] text-[var(--glass-bg)] scale-110 shadow-sm"
                    : "text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] hover:bg-[var(--glass-bg-secondary)]"
                }`}
              >
                {nav.icon}
                {navFailed && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--glass-danger)]" />
                )}
                {navRegen && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--glass-accent)] animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="relative pb-16 min-h-[60vh]">
        {effectiveTab === "leaderboard" ? (
          <HookLeaderboard projectId={projectId} />
        ) : (
          <TabContent
            projectId={projectId}
            platform={activePlatform}
            outputError={ready.includes(effectiveTab as Platform) ? undefined : outputErrors?.[effectiveTab]}
            nativeView={nativeView}
            isRegenerating={isRegenerating || retrying === activePlatform}
            isRetryMode={regenEntry?.intent === "retry" || retrying === activePlatform}
            regenError={regenEntry?.status === "error" ? (regenEntry.error ?? "Regeneration failed") : null}
            regenRefundedAmount={regenRefundedAmount}
            onRetry={handleRetry}
            pipelineStatus={project?.status}
          />
        )}

        {effectiveTab !== "leaderboard" && project?.sko && !isRegenerating && (
          <div className="absolute bottom-0 right-0 z-10">
            <button
              onClick={() => setShowFeedback(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--glass-surface)] hover:bg-[var(--glass-bg-secondary)] text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] rounded-full transition-all border border-[var(--glass-border)] shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Not my voice
            </button>
          </div>
        )}

        {showFeedback && project?.sko && (
          <FeedbackForm
            projectId={projectId}
            platform={activePlatform}
            sko={project.sko}
            regenCount={regenCount}
            onClose={() => setShowFeedback(false)}
            onSubmitted={() => {
              regenMode.current[activePlatform] = "refine";
              setShowFeedback(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function TabContent({
  projectId,
  platform,
  outputError,
  nativeView,
  isRegenerating,
  isRetryMode,
  regenError,
  regenRefundedAmount,
  onRetry,
  pipelineStatus,
}: {
  projectId: string;
  platform: Platform;
  outputError?: string;
  nativeView: string | null;
  isRegenerating: boolean;
  isRetryMode: boolean;
  regenError: string | null;
  regenRefundedAmount?: number;
  onRetry: (platform: Platform) => void;
  pipelineStatus?: string;
}) {
  const { data, loading, error } = useOutput(projectId, platform);
  const { data: hookScoreData } = useHookScores(projectId);

  const hookScoreLookup = useMemo<HookScoreLookup>(() => {
    if (!hookScoreData?.hooks) return {};
    const map: HookScoreLookup = {};
    for (const h of hookScoreData.hooks as ScoredHook[]) {
      map[h.hook_id] = { grade: h.grade, composite_score: h.composite_score, scores: h.scores };
    }
    return map;
  }, [hookScoreData]);

  if (isRegenerating) {
    return <RegenerationIndicator platform={platform} isRetry={isRetryMode} />;
  }

  if (regenError) {
    const platformLabel = platform.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return (
      <div className="rounded-2xl p-6 space-y-4 border border-[var(--glass-border)] bg-[var(--glass-surface)]">
        {/* Refund notice */}
        <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <span className="text-emerald-400 text-base shrink-0">✦</span>
          <div>
            <p className="text-sm font-semibold text-emerald-400">Credits returned</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">
              {regenRefundedAmount !== undefined && regenRefundedAmount > 0
                ? `$${regenRefundedAmount.toFixed(4)} was automatically refunded — you only pay for what works.`
                : "The cost for this attempt was automatically refunded — you only pay for what works."}
            </p>
          </div>
        </div>

        {/* Error detail */}
        <div>
          <p className="text-xs font-medium text-[var(--glass-text-secondary)] mb-1">
            Regeneration failed for {platformLabel}
          </p>
          <p className="text-xs text-[var(--glass-text-tertiary)] leading-relaxed">
            {humanizeError(regenError)}
          </p>
        </div>

        {/* Retry */}
        <button
          onClick={() => onRetry(platform)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[var(--glass-accent)] text-[var(--glass-bg)] hover:opacity-90 active:scale-95 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0113.5-4.5M19.5 12a7.5 7.5 0 01-13.5 4.5M4.5 12H2m17.5 0H22M12 4.5V2m0 17.5V22" />
          </svg>
          Try again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-8 glass animate-pulse">
        <div className="h-4 rounded-full bg-[var(--glass-bg-secondary)] w-3/4 mb-3" />
        <div className="h-3 rounded-full bg-[var(--glass-bg-secondary)] w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-6 glass border border-[var(--glass-danger)]/20">
        <p className="text-sm text-[var(--glass-danger)]">{error}</p>
      </div>
    );
  }

  if (!data) {
    if (outputError) {
      // Platform failed during synthesis — show refund notice + retry
      const platformLabel = platform.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return (
        <div className="rounded-2xl p-6 space-y-4 border border-[var(--glass-border)] bg-[var(--glass-surface)]">
          {/* Refund notice — cheerful */}
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <span className="text-emerald-400 text-base shrink-0">✦</span>
            <div>
              <p className="text-sm font-semibold text-emerald-400">Credits returned</p>
              <p className="text-xs text-emerald-400/70 mt-0.5">
                The cost for {platformLabel} was automatically refunded — you only pay for what works.
              </p>
            </div>
          </div>

          {/* Error detail */}
          <div>
            <p className="text-xs font-medium text-[var(--glass-text-secondary)] mb-1">{platformLabel} failed to generate</p>
            <p className="text-xs text-[var(--glass-text-tertiary)] leading-relaxed">
              {humanizeError(outputError)}
            </p>
          </div>

          {/* Retry button */}
          <button
            onClick={() => onRetry(platform)}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-[var(--glass-accent)] text-[var(--glass-bg)] hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegenerating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Retrying…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0113.5-4.5M19.5 12a7.5 7.5 0 01-13.5 4.5M4.5 12H2m17.5 0H22M12 4.5V2m0 17.5V22" />
                </svg>
                Retry {platformLabel}
              </>
            )}
          </button>
        </div>
      );
    }

    // Pipeline is still generating this platform — show a pending skeleton
    const isStillGenerating = pipelineStatus === "synthesizing" || pipelineStatus === "scoring" || pipelineStatus === "authenticating";
    if (isStillGenerating) {
      return (
        <div className="rounded-2xl p-8 glass animate-pulse space-y-3">
          <div className="h-4 rounded-full bg-[var(--glass-bg-secondary)] w-3/4" />
          <div className="h-3 rounded-full bg-[var(--glass-bg-secondary)] w-1/2" />
          <div className="h-3 rounded-full bg-[var(--glass-bg-secondary)] w-5/6" />
        </div>
      );
    }

    return (
      <div className="rounded-2xl p-8 text-center glass">
        <p className="text-sm text-[var(--glass-text-secondary)]">
          No output generated for this platform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.isRegenerated && (
        <div className="flex justify-end">
          <RegenerationBadge />
        </div>
      )}
      
      {(() => {
        switch (platform) {
          case "twitter":
            return (
              <TweetCarousel
                tweets={
                  (data.tweets ?? []) as Array<{
                    text: string;
                    hook: string;
                    type: string;
                    answer_block?: string;
                  }>
                }
                threadNarrative={data.thread_narrative as string | undefined}
                isNative={nativeView === "twitter"}
                hookScores={hookScoreLookup}
              />
            );

          case "linkedin":
            return (
              <LinkedInPreview
                posts={
                  (data.posts ?? []) as Array<{
                    hook: string;
                    body: string;
                    cta: string;
                    angle: string;
                    estimated_read_time_seconds?: number;
                    answer_block?: string;
                  }>
                }
                document_carousel={
                  data.document_carousel as {
                    title: string;
                    slides: Array<{ page_number: number; headline: string; body: string; visual_suggestion?: string }>;
                    summary: string;
                  } | undefined
                }
                isNative={nativeView === "linkedin"}
                hookScores={hookScoreLookup}
              />
            );

          case "newsletter":
            return (
              <NewsletterPreview
                subjectLine={(data.subject_line as string) ?? "Untitled"}
                previewText={data.preview_text as string | undefined}
                sections={
                  (data.sections ?? []) as Array<{
                    heading: string;
                    content: string;
                  }>
                }
                cta={data.cta as { text: string; context: string } | undefined}
                estimatedReadTimeMinutes={
                  data.estimated_read_time_minutes as number | undefined
                }
                isNative={nativeView === "newsletter"}
              />
            );

          case "veo": {
            const script = data.script as Record<string, unknown> | undefined;
            if (!script) return null;
            return (
              <VeoPreview
                title={(script.title as string) ?? "Untitled"}
                hookSeconds={script.hook_seconds as number | undefined}
                scenes={
                  (script.scenes ?? []) as Array<{
                    scene_number: number;
                    duration_seconds: number;
                    visual_description: string;
                    voiceover: string;
                    on_screen_text?: string;
                  }>
                }
                totalDurationSeconds={(script.total_duration_seconds as number) ?? 60}
                aspectRatio={(script.aspect_ratio as string) ?? "9:16"}
                styleNotes={script.style_notes as string | undefined}
              />
            );
          }

          case "dark_social":
            return (
              <DarkSocialPreview
                data={
                  data as {
                    slack_message: { hook: string; body: string; emoji_prefix: string };
                    discord_message: { hook: string; body: string; embed_title?: string };
                    shareable_quote: string;
                    context_line: string;
                  }
                }
                nativePlatform={nativeView as "slack" | "discord" | null}
              />
            );

          default:
            return null;
        }
      })()}
      <div className="flex justify-end">
        <C2PABadge projectId={projectId} platform={platform} />
      </div>
    </div>
  );
}
