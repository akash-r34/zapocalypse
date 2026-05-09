"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "zapocalypse-theme";

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always start with "dark" to match server render. If we read localStorage
  // here (lazy init), the server returns "dark" but the client may return "light",
  // causing a React hydration mismatch that shows an invisible error overlay in
  // dev mode — which intercepts all clicks and makes the UI appear broken.
  const [mode, setMode] = useState<ThemeMode>("dark");

  // After mount: read localStorage and correct the mode if needed.
  // Also keep the DOM class in sync on every mode change.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial: ThemeMode = stored === "light" ? "light" : "dark";
    // Intentional setState in effect — required for hydration-safe theme init.
    // The FOUC script in layout.tsx handles the visual side before React loads.
    setMode(initial); // eslint-disable-line react-hooks/set-state-in-effect
    applyMode(initial);
  }, []);

  // Sync DOM class whenever mode changes after the initial mount
  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  function toggleMode() {
    setMode((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "light") {
    root.classList.add("light");
  } else {
    root.classList.remove("light");
  }
}
