export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Provide the spark",
      description: "Paste a URL, drop a file, or write raw text. The ingestion engine processes everything from 10-minute videos to 3,000-word guides automatically."
    },
    {
      number: "2",
      title: "AI extracts your DNA",
      description: "The 7-agent pipeline reads your input. It calculates Information Gain, identifies your core thesis, and extracts your unique brand tone fingerprint."
    },
    {
      number: "3",
      title: "Ship to 5 platforms",
      description: "Synthesis spins up immediately. You get an X thread, a LinkedIn carousel, a newsletter, a Veo video script, and dark social assets in seconds."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 scroll-mt-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--glass-text)]">How it works</h2>
        <p className="mt-4 text-[var(--glass-text-secondary)] text-lg">A 7-agent pipeline tailored to you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="glass-elevated p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--glass-accent)]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--glass-accent)]/20 transition-colors" />
            <span className="text-5xl font-extrabold text-[var(--glass-bg-secondary)] border-b border-[var(--glass-border)] pb-4 block mb-6">{step.number}</span>
            <h3 className="text-xl font-bold mb-3 text-[var(--glass-text)]">{step.title}</h3>
            <p className="text-[var(--glass-text-secondary)] leading-relaxed text-sm">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
