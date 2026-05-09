import Link from "next/link";

export function Pricing() {
  const tiers = [
    {
      name: "Free Tier",
      price: "$0",
      period: "/ month",
      description: "3 full pipeline runs per month."
    },
    {
      name: "Pro Tier",
      price: "$15",
      period: "/ month",
      description: "50 pipeline runs and access to our priority models."
    },
    {
      name: "Hibernation Plan",
      price: "$5",
      period: "/ month",
      description: "Taking a break? Pause your account while saving all your generation history and persistent Brand Voice fingerprints."
    }
  ];

  return (
    <section className="py-24 border-t border-[var(--glass-border)]/50 relative">
      <div className="text-center mb-16 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--glass-text)]">Honest billing that protects your wallet.</h2>
        <p className="mt-4 text-[var(--glass-text-secondary)] text-lg leading-relaxed">
          Say goodbye to the "Credit Trap." We built a <strong>Tiered Refund Logic</strong> system. If a generation fails during the final formatting step, you only get charged a micro-fraction for the successful data extraction, and your source material (the SKO) is saved to your dashboard so you can regenerate it for fewer credits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {tiers.map((tier, idx) => (
          <div key={idx} className={`glass-elevated rounded-[2.5rem] p-8 border hover:border-[var(--glass-accent)]/30 transition-colors ${idx === 1 ? 'border-[var(--glass-accent)]/50 scale-105' : 'border-transparent'}`}>
            {idx === 1 && (
              <div className="inline-block py-1.5 px-4 bg-[var(--glass-accent)] rounded-full text-[10px] font-bold text-[var(--glass-bg)] uppercase tracking-widest mb-6">
                Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-[var(--glass-text)]">{tier.name}</h3>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-extrabold text-[var(--glass-text)]">{tier.price}</span>
              <span className="text-[var(--glass-text-secondary)] mb-1">{tier.period}</span>
            </div>
            
            <p className="mt-6 text-sm text-[var(--glass-text-secondary)] leading-relaxed">
              {tier.description}
            </p>
            
            {idx !== 2 && (
              <Link
                href="/create"
                className={`block w-full text-center mt-10 px-6 py-4 rounded-full font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] ${idx === 1 ? 'bg-[var(--glass-text)] text-[var(--glass-bg)]' : 'bg-[var(--glass-surface)] text-[var(--glass-text)] border border-[var(--glass-border)]'}`}
              >
                {idx === 0 ? 'Start for free' : 'Upgrade to Pro'}
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
