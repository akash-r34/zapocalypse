"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

const GRADE_CONFIG = {
  A: { color: "#34c759", label: "Excellent", bgOpacity: "0.12" },
  B: { color: "#007aff", label: "Good", bgOpacity: "0.12" },
  C: { color: "#ffd60a", label: "Average", bgOpacity: "0.10" },
  D: { color: "#ff9f0a", label: "Weak", bgOpacity: "0.10" },
  F: { color: "#ff453a", label: "Poor", bgOpacity: "0.10" },
} as const;

type Grade = keyof typeof GRADE_CONFIG;

function ExpandableText({ text, accentColor }: { text: string; accentColor?: string }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((v) => !v), []);
  return (
    <div>
      <p className={`text-[var(--glass-text-secondary)] leading-snug ${expanded ? "" : "line-clamp-2"}`}>
        {text}
      </p>
      <button
        onClick={toggle}
        className="mt-1 text-[10px] font-medium transition-colors"
        style={{ color: accentColor ?? "var(--glass-text-tertiary)" }}
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}

interface ScoreBadgeProps {
  projectId: string;
}

export function ScoreBadge({ projectId }: ScoreBadgeProps) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = doc(db, "projects", projectId, "analysis", "current");

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          setData(snap.data());
          // Delay visibility for pop-in animation
          setTimeout(() => setVisible(true), 50);
        }
      },
      () => {}
    );

    return () => unsubscribe();
  }, [projectId]);

  if (!data) return null;

  const grade = (data.grade as Grade) ?? "C";
  const score = (data.overall_score as number) ?? 5;
  const classification = (data.content_classification as string) ?? "";
  const config = GRADE_CONFIG[grade] ?? GRADE_CONFIG.C;

  // Radial fill: score/10 maps to 0-360 degrees
  const fillDeg = (score / 10) * 360;

  return (
    <div
      className="rounded-2xl p-5 glass space-y-3 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        animationTimingFunction: "var(--spring-bouncy, ease-out)",
      }}
    >
      <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest">
        Information Gain
      </p>

      <div className="flex items-center gap-4">
        {/* Circular score */}
        <div className="relative w-14 h-14 shrink-0">
          <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
            {/* Track */}
            <circle
              cx="28" cy="28" r="22"
              fill="none"
              stroke={config.color}
              strokeWidth="4"
              strokeOpacity="0.15"
            />
            {/* Fill */}
            <circle
              cx="28" cy="28" r="22"
              fill="none"
              stroke={config.color}
              strokeWidth="4"
              strokeDasharray={`${(fillDeg / 360) * 138.2} 138.2`}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 0.8s var(--spring-gentle, ease-out)",
              }}
            />
          </svg>
          {/* Grade letter */}
          <div
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            style={{ color: config.color }}
          >
            {grade}
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-[var(--glass-text)]">
            {score.toFixed(1)}<span className="text-sm font-normal text-[var(--glass-text-tertiary)]">/10</span>
          </p>
          <p className="text-xs text-[var(--glass-text-secondary)] capitalize mt-0.5">
            {config.label} — {classification.replace(/_/g, " ")}
          </p>
        </div>
      </div>

      {/* Strongest asset / biggest gap */}
      {data.strongest_asset && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div
            className="rounded-lg p-2.5 text-xs"
            style={{ background: `${config.color}${Math.round(parseFloat(config.bgOpacity) * 255).toString(16).padStart(2, "0")}` }}
          >
            <p className="font-medium mb-0.5" style={{ color: config.color }}>Strongest</p>
            <ExpandableText text={data.strongest_asset as string} accentColor={config.color} />
          </div>
          <div className="rounded-lg p-2.5 text-xs bg-[var(--glass-bg-secondary)]">
            <p className="font-medium mb-0.5 text-[var(--glass-text-tertiary)]">Biggest gap</p>
            <ExpandableText text={data.biggest_gap as string} />
          </div>
        </div>
      )}
    </div>
  );
}
