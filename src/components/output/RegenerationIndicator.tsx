"use client";

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  veo: "Veo Script",
  dark_social: "Dark Social",
};

export function RegenerationIndicator({ platform, isRetry }: { platform?: string; isRetry?: boolean }) {
  const label = platform ? PLATFORM_LABELS[platform] ?? platform : "this platform";

  if (isRetry) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-2xl glass animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--glass-accent)]/20 border-t-[var(--glass-accent)] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--glass-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-medium text-[var(--glass-text)]">Re-synthesising {label}…</h4>
          <p className="text-sm text-[var(--glass-text-secondary)]">
            Running synthesis again with your original voice settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 rounded-2xl glass animate-in fade-in zoom-in duration-300">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[var(--glass-accent)]/20 border-t-[var(--glass-accent)] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--glass-accent)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-lg font-medium text-[var(--glass-text)]">Refining your voice…</h4>
        <p className="text-sm text-[var(--glass-text-secondary)]">
          Updating your tone fingerprint and regenerating {label}.
        </p>
      </div>
    </div>
  );
}

export function RegenerationBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--glass-accent)] text-[var(--glass-bg)] shadow-sm uppercase tracking-wider">
      Regenerated (v2)
    </span>
  );
}
