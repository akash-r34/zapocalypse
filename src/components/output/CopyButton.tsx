"use client";

interface CopyButtonProps {
  copied: boolean;
  onClick: () => void;
  label?: string;
}

export function CopyButton({ copied, onClick, label }: CopyButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${
        copied
          ? "bg-[var(--glass-accent)] text-[var(--glass-bg)]"
          : "glass text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)]"
      }`}
    >
      {copied ? "Copied!" : label ?? "Copy"}
    </button>
  );
}
