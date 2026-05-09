"use client";

import Link from "next/link";
import { BudgetIndicator } from "@/src/components/budget/BudgetIndicator";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { BackgroundElements } from "./BackgroundElements";
import { useAuth } from "@/src/lib/auth/AuthContext";
import Image from "next/image";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen flex flex-col relative isolation overflow-x-hidden">
      <BackgroundElements />
      <header className="sticky top-0 z-50 glass-header px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand logo — triangle prism + wordmark */}
        <Link href="/dashboard" scroll={false} className="flex items-center gap-2.5 shrink-0 group">
          <ZapocalypseLogo />
        </Link>

        {/* Live budget meter */}
        <div className="flex-1 max-w-[100px] sm:max-w-[200px]">
          <BudgetIndicator />
        </div>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/projects"
            className="text-xs sm:text-sm font-medium px-2 sm:px-4 py-1.5 sm:py-2 text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] transition-colors whitespace-nowrap flex items-center gap-1.5"
            title="All Projects"
          >
            <svg className="w-4 h-4 sm:hidden block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="hidden sm:inline">Projects</span>
          </Link>
          <ThemeToggle />
          {user && (
            <button
              onClick={() => void signOut()}
              title={`Signed in as ${user.email}`}
              className="text-xs font-medium w-8 h-8 flex items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
          <Link
            href="/create"
            className="text-xs sm:text-sm font-medium w-8 h-8 sm:w-auto sm:h-auto flex items-center justify-center sm:px-4 sm:py-2 rounded-full sm:rounded-full bg-[var(--glass-accent)] text-[var(--glass-bg)] transition-all duration-150 hover:opacity-90 active:scale-[0.98] whitespace-nowrap"
            title="New Project"
          >
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden text-lg leading-none">+</span>
          </Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

function ZapocalypseLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center shrink-0 w-[32px] h-[32px]">
        <Image 
          src="/logos/dark-logo-transparent.png" 
          alt="Zapocalypse Dark Logo" 
          width={32} 
          height={32} 
          className="object-contain dark-logo" 
          priority
        />
        <Image 
          src="/logos/light-logo-transparent.png" 
          alt="Zapocalypse Light Logo" 
          width={32} 
          height={32} 
          className="object-contain light-logo" 
          priority
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className="text-[13px] sm:text-[14px] font-bold tracking-[0.22em] uppercase text-[var(--glass-text)]">
          Zapocalypse
        </span>
        <span className="block text-[5px] sm:text-[7px] tracking-[0.05em] sm:tracking-[0.28em] uppercase text-[var(--glass-text-tertiary)] mt-0.5 leading-tight">
          Built for the creator economy
        </span>
      </div>
    </div>
  );
}
