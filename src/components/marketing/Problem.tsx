export function Problem() {
  const problems = [
    {
      title: "The \"AI Slop\" Penalty",
      description: "52% of consumers immediately reduce engagement when they suspect generic, robotic AI content."
    },
    {
      title: "The \"Credit Trap\"",
      description: "You are forced to waste your hard-earned credits regenerating content because the AI failed or missed the point."
    },
    {
      title: "Timeline Fatigue",
      description: "Complex, bloated interfaces make editing AI output take longer than just writing it yourself."
    }
  ];

  return (
    <section className="py-20 border-t border-[var(--glass-border)]/50 relative overflow-hidden">
      <div className="text-center mb-16 relative z-10 max-w-3xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--glass-text)]">The era of generic "AI Slop" is over.</h2>
        <p className="mt-4 text-[var(--glass-text-secondary)] text-lg">
          First-generation AI tools gave you speed, but they cost you your authenticity. Creators today are suffering from three massive problems:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {problems.map((problem, idx) => (
          <div key={idx} className="glass p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--glass-danger)]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--glass-danger)]/20 transition-colors" />
            <h3 className="text-xl font-bold mb-3 text-[var(--glass-text)]">{problem.title}</h3>
            <p className="text-[var(--glass-text-secondary)] leading-relaxed text-sm">
              {problem.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
