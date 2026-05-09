"use client";

import { useTheme } from "@/src/hooks/useTheme";

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
      className="w-9 h-9 rounded-full glass flex items-center justify-center transition-all duration-200 hover:opacity-80 active:scale-95 shrink-0"
    >
      {mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--glass-text)"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="8" cy="8" r="3" />
      <line x1="8" y1="1" x2="8" y2="2.5" />
      <line x1="8" y1="13.5" x2="8" y2="15" />
      <line x1="1" y1="8" x2="2.5" y2="8" />
      <line x1="13.5" y1="8" x2="15" y2="8" />
      <line x1="3.05" y1="3.05" x2="4.11" y2="4.11" />
      <line x1="11.89" y1="11.89" x2="12.95" y2="12.95" />
      <line x1="12.95" y1="3.05" x2="11.89" y2="4.11" />
      <line x1="4.11" y1="11.89" x2="3.05" y2="12.95" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="var(--glass-text)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z" />
    </svg>
  );
}
