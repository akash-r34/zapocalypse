export function Features() {
  const features = [
    {
      emoji: "🧬",
      title: "Additive Tone Fingerprinting",
      description: "We don't just filter out \"corporate jargon.\" Our extraction engine actively maps your unique positive linguistic markers—like your specific analogy style, humor type, and sentence cadence variance. The result? Content that hits your exact vibe."
    },
    {
      emoji: "🛑",
      title: "The \"Not My Voice\" Button & Selective Regeneration",
      description: "Did the AI miss the mark? Just click our floating \"Not my voice\" button. Instead of re-running the entire costly pipeline, you can give dynamic, positive feedback to update your Tone Fingerprint, and we will instantly regenerate that specific post."
    },
    {
      emoji: "🔮",
      title: "Predictive Virality & Hook Leaderboards",
      description: "Stop guessing what works. Our post-synthesis AI acts as a Virality Scorer, evaluating every generated hook specifically against your target audience. Review your strongest options on a ranked Hook Leaderboard based on novelty, emotional resonance, and shareability."
    },
    {
      emoji: "🛡️",
      title: "Cryptographic \"Digital Proof\" (C2PA)",
      description: "Protect your reach from the AI slop penalty. Zapocalypse automatically embeds ECDSA P-256 cryptographic signatures into your content, providing a downloadable \"Zapocalypse Content Credential\" manifest. This verifiable digital shield tells platforms your content is human-guided and authentic."
    },
    {
      emoji: "🤖",
      title: "GEO & Dark Social Formatting",
      description: "Traditional SEO is dead. We automatically inject 40–60 word \"Answer Blocks\" into your tweets and LinkedIn posts to maximize your Generative Engine Optimization (GEO) so AI search engines cite you. We also format specialized \"Community Snippets\" for private Slack and Discord channels."
    }
  ];

  return (
    <section className="py-24 border-t border-[var(--glass-border)]/50 relative overflow-hidden">
      <div className="text-center mb-16 relative z-10 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--glass-text)]">A system built for your brand's DNA.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, idx) => (
          <div key={idx} className={`glass p-8 rounded-2xl ${idx === 3 || idx === 4 ? 'lg:col-span-1.5' : ''}`}>
            <div className="text-3xl mb-4">{feature.emoji}</div>
            <h3 className="text-lg font-bold text-[var(--glass-text)] mb-3">{feature.title}</h3>
            <p className="text-[var(--glass-text-secondary)] text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
