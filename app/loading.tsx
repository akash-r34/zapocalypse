export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--glass-bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--glass-accent)] border-t-transparent animate-spin" />
        <p className="text-sm text-[var(--glass-text-secondary)]">Loading…</p>
      </div>
    </div>
  );
}
