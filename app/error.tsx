"use client";

import { useEffect } from "react";
import { AppShell } from "@/src/components/layout/AppShell";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[var(--glass-text)]">
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--glass-text-secondary)]">
          {error.message ?? "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="mt-4 px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--glass-accent)] text-[var(--glass-bg)]"
        >
          Try again
        </button>
      </div>
    </AppShell>
  );
}
