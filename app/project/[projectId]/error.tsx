"use client";

import Link from "next/link";
import { AppShell } from "@/src/components/layout/AppShell";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProjectError({ error, reset }: ErrorPageProps) {
  return (
    <AppShell>
      <div className="max-w-lg mx-auto py-16 space-y-4">
        <Link
          href="/"
          className="text-sm text-[var(--glass-accent)]"
        >
          &larr; Back to projects
        </Link>
        <div className="rounded-[28px] p-8 text-center bg-[var(--glass-danger)]/10">
          <p className="text-base font-semibold mb-2 text-[var(--glass-text)]">
            Could not load project
          </p>
          <p className="text-sm mb-6 text-[var(--glass-text-secondary)]">
            {error.message}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 rounded-full text-sm font-medium bg-[var(--glass-danger)] text-[var(--glass-bg)]"
          >
            Retry
          </button>
        </div>
      </div>
    </AppShell>
  );
}
