export function FAQ() {
  const faqs = [
    {
      q: "What is the \"Credit Trap\" and how do you fix it?",
      a: "Competitor tools charge you full price even if their AI hallucinates or errors out. We use a mandatory pre-flight validation check to catch bad inputs *before* you are charged. If a generation fails, our Fair-Play system automatically issues you a stage-aware refund."
    },
    {
      q: "Can I process YouTube links or video files?",
      a: "Coming soon! Currently, we dominate text and URL inputs. Our Phase 6 Multimodal update is right around the corner, which will use Gemini's vision capabilities to actually \"watch\" video files and YouTube links, extracting rich visual context alongside the audio transcript."
    },
    {
      q: "What happens if I don't like the generated content?",
      a: "You don't have to start over. Use our \"Reflexion Loop\" by clicking the \"Not my voice\" button. Tell the AI exactly what it missed (e.g., \"Use my typical storytelling pacing\"), and it will regenerate just that single post for a fraction of the cost."
    },
    {
      q: "What exactly is a Zapocalypse Content Credential?",
      a: "To comply with upcoming 2026 regulations like the EU AI Act, creators must prove their content isn't generic AI slop. We use Node.js crypto to generate an ECDSA P-256 signature for your outputs. This creates a verifiable JSON manifest that proves your content is authentically yours."
    }
  ];

  return (
    <section className="py-24 border-t border-[var(--glass-border)]/50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--glass-text)] text-center mb-12">FAQ</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <details key={idx} className="group glass rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 text-[var(--glass-text)] font-semibold cursor-pointer outline-none">
                {faq.q}
                <span className="text-[var(--glass-accent)] transition-transform duration-300 group-open:-rotate-180">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 text-[var(--glass-text-secondary)] text-sm leading-relaxed whitespace-pre-line">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
