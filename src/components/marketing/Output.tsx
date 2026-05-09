export function Output() {
  const outputs = [
    {
      platform: "Twitter",
      title: "10 Twitter Thread-Starters",
      description: "Including specialized \"contrarian\" hooks."
    },
    {
      platform: "LinkedIn",
      title: "5 LinkedIn Posts",
      description: "Including a complete Markdown outline for a multi-page PDF Document Carousel."
    },
    {
      platform: "Newsletter",
      title: "1 Markdown Newsletter",
      description: "Ready to send to your email list."
    },
    {
      platform: "Dark Social",
      title: "1 Dark Social Snippet",
      description: "Formatted perfectly for Slack and Discord community sharing."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 scroll-mt-24 border-t border-[var(--glass-border)]/50">
      <div className="text-center mb-16 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--glass-text)]">One Input. An Entire Week of Strategy.</h2>
        <p className="mt-4 text-[var(--glass-text-secondary)] text-lg">
          Paste a single URL, text, or file, and our multi-agent architecture instantly generates:
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {outputs.map((output, idx) => (
          <div key={idx} className="glass-elevated p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <h3 className="text-xl font-bold mb-3 text-[var(--glass-text)]">{output.title}</h3>
            <p className="text-[var(--glass-text-secondary)] leading-relaxed text-sm">
              {output.description}
            </p>
          </div>
        ))}
      </div>
      
      <div className="glass p-6 rounded-2xl max-w-2xl mx-auto text-center">
        <p className="text-sm text-[var(--glass-text-secondary)] italic">
          (Note: Our interface uses <strong className="text-[var(--glass-text)] font-semibold not-italic">Progressive Disclosure</strong>—meaning your output tabs reveal themselves one-by-one the second they are ready, so you can start reviewing instantly without waiting for the whole pipeline.)
        </p>
      </div>
    </section>
  );
}
