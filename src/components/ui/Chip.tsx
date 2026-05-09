interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export function Chip({ label, selected = false, onClick, icon }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-sm font-medium transition-all duration-150 ${
        selected
          ? "bg-[var(--glass-accent)] text-[var(--glass-bg)]"
          : "glass text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)]"
      }`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {label}
    </button>
  );
}
