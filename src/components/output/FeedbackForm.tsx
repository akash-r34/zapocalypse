"use client";

import { useState } from "react";
import type { SKO } from "@/src/lib/ai/schemas/sko";
import type { SupportedPlatform } from "@/src/lib/pipeline/regenerate";
import { authedFetch } from "@/src/lib/auth/authedFetch";

interface FeedbackFormProps {
  projectId: string;
  platform: SupportedPlatform;
  sko: SKO;
  regenCount: number;
  onClose: () => void;
  onSubmitted: () => void;
}

const MAX_REGENS = 3;

export function FeedbackForm({ projectId, platform, sko, regenCount, onClose, onSubmitted }: FeedbackFormProps) {
  const [customFeedback, setCustomFeedback] = useState("");
  const [selectedTraits, setSelectedTraits] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fingerprint = sko.brand_tone_fingerprint;

  // Dynamically generate pills based on the user's tone fingerprint, plus some statics
  const dynamicOptions = [
    fingerprint.analogy_style ? `More analogical: ${fingerprint.analogy_style}` : null,
    fingerprint.storytelling_structure ? `Stronger storytelling: ${fingerprint.storytelling_structure}` : null,
    fingerprint.explanation_pattern ? `Emphasize pattern: ${fingerprint.explanation_pattern}` : null,
    fingerprint.humor_type ? `More humor: ${fingerprint.humor_type}` : null,
    "More contrarian",
    "More data-driven",
    "Warmer tone",
    "Sharper hooks",
  ].filter(Boolean) as string[];

  const toggleTrait = (trait: string) => {
    setSelectedTraits((prev) => {
      const next = new Set(prev);
      if (next.has(trait)) {
        next.delete(trait);
      } else {
        next.add(trait);
      }
      return next;
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const combinedFeedback = [
      selectedTraits.size > 0 ? `Strengthen these traits: ${Array.from(selectedTraits).join("; ")}.` : "",
      customFeedback.trim() ? `Additional instructions: ${customFeedback.trim()}` : ""
    ].filter(Boolean).join(" ");

    if (!combinedFeedback) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await authedFetch("/api/pipeline/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, platform, feedback: combinedFeedback }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error ?? "Failed to trigger regeneration");
      }

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
      setSubmitting(false); // only re-enable on failure, success will unmount
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--glass-bg)]/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div 
        className="w-full max-w-[600px] rounded-3xl glass-elevated overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 id="feedback-title" className="text-xl font-semibold text-[var(--glass-text)]">
                Refine your voice
              </h3>
              <p className="text-sm text-[var(--glass-text-secondary)]">
                Select what you want more of — Gemini will strengthen those traits.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--glass-bg-secondary)] text-[var(--glass-text-secondary)] transition-colors shrink-0"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Options (Pills) */}
          <div className="flex flex-wrap gap-2.5">
            {dynamicOptions.map((opt) => {
              const isSelected = selectedTraits.has(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleTrait(opt)}
                  className={`text-xs px-3.5 py-2 rounded-full transition-all duration-200 border ${
                    isSelected 
                      ? "bg-[var(--glass-accent)] text-[var(--glass-bg)] border-[var(--glass-accent)] shadow-sm" 
                      : "bg-[var(--glass-bg-secondary)] hover:bg-[var(--glass-surface)] text-[var(--glass-text-secondary)] border-[var(--glass-border)]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Textarea Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="custom-feedback" className="block text-sm font-medium text-[var(--glass-text-secondary)]">
                Or describe what you want (optional)
              </label>
              <textarea
                id="custom-feedback"
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                placeholder="e.g. Use more sports metaphors, shorter sentences"
                className="w-full h-28 p-4 text-sm rounded-2xl bg-black/20 border border-[var(--glass-border)] focus:outline-none focus:ring-1 focus:ring-[var(--glass-accent)] text-[var(--glass-text)] placeholder:text-[var(--glass-text-tertiary)] resize-none transition-all"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-[var(--glass-danger)] bg-[var(--glass-danger)]/10 rounded-xl border border-[var(--glass-danger)]/20">
                {error}
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-[var(--glass-text-tertiary)]">
                {MAX_REGENS - regenCount} of {MAX_REGENS} regenerations remaining
              </p>

              <button
                type="submit"
                disabled={submitting || regenCount >= MAX_REGENS || (selectedTraits.size === 0 && !customFeedback.trim())}
                className="px-6 py-2.5 text-sm font-medium bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--glass-text)] rounded-full hover:bg-[var(--glass-accent)] hover:text-[var(--glass-bg)] hover:border-[var(--glass-accent)] disabled:opacity-50 disabled:hover:bg-[var(--glass-surface)] disabled:hover:text-[var(--glass-text)] disabled:hover:border-[var(--glass-border)] transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : regenCount >= MAX_REGENS ? (
                  "Limit reached"
                ) : (
                  "Regenerate"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
