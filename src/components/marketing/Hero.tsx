import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 text-center select-none">
      <div className="max-w-4xl mx-auto space-y-8 animate-slide-in">
        <h1 className="text-[2.5rem] sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[var(--glass-text)] leading-[1.1]">
          Stop generating volume.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--glass-accent)] to-[#a855f7]">Start generating influence.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-[var(--glass-text-secondary)] max-w-3xl mx-auto leading-relaxed">
          Zapocalypse is the first creator-grade content intelligence platform designed to close the "vibe-to-value" gap. Turn a single text or URL into an entire ecosystem of highly authentic, algorithm-proof social assets that actually sound like you.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold bg-[var(--glass-text)] text-[var(--glass-bg)] transition-transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-[var(--glass-accent)]/20"
            style={{ animation: 'var(--spring-bouncy) 1s forwards' }}
          >
            Join the Early Access Waitlist
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold border border-[var(--glass-border)] text-[var(--glass-text)] hover:bg-[var(--glass-bg-secondary)] transition-colors"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
