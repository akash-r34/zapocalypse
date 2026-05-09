import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { BackgroundElements } from "@/src/components/layout/BackgroundElements";
import Link from "next/link";
import Image from "next/image";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative isolation overflow-x-hidden">
      <BackgroundElements />
      <header className="sticky top-0 z-50 glass-header px-4 sm:px-8 py-4 flex items-center justify-between gap-4 w-full">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <ZapocalypseLogo />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4 shrink-0">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="text-xs sm:text-sm font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[var(--glass-accent)] text-[var(--glass-bg)] transition-all duration-150 hover:scale-105 active:scale-[0.98] whitespace-nowrap shadow-lg"
          >
            Open app
          </Link>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {children}
      </main>

      <footer className="w-full text-center py-8 border-t border-[var(--glass-border)] text-[var(--glass-text-secondary)] text-sm px-6">
        <p className="mb-2">© {new Date().getFullYear()} Zapocalypse. For creators, by creators.</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="https://github.com/akashr/Zapocalypse" target="_blank" className="hover:text-[var(--glass-accent)] transition-colors">GitHub</Link>
          <span className="opacity-20">•</span>
          <Link href="/dashboard" className="hover:text-[var(--glass-accent)] transition-colors">Workspace</Link>
          <span className="opacity-20">•</span>
          <span className="hover:text-[var(--glass-accent)] transition-colors cursor-help">Status: Operational</span>
        </div>
      </footer>
    </div>
  );
}

function ZapocalypseLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center shrink-0 w-[36px] h-[36px]">
        <Image 
          src="/logos/dark-logo-transparent.png" 
          alt="Zapocalypse Logo" 
          width={36} 
          height={36} 
          className="object-contain dark-logo" 
        />
        <Image 
          src="/logos/light-logo-transparent.png" 
          alt="Zapocalypse Logo" 
          width={36} 
          height={36} 
          className="object-contain light-logo" 
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] sm:text-[17px] font-bold tracking-[0.22em] uppercase text-[var(--glass-text)]">
          Zapocalypse
        </span>
        <span className="block text-[5px] sm:text-[8px] tracking-[0.05em] sm:tracking-[0.28em] uppercase text-[var(--glass-text-tertiary)] mt-0.5 leading-tight">
          Built for the creator economy
        </span>
      </div>
    </div>
  );
}
