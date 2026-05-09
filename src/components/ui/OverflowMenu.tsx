"use client";

import { useState, useEffect, useRef } from "react";

interface OverflowMenuProps {
  children: React.ReactNode;
}

export function OverflowMenu({ children }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="More options"
        className="flex items-center justify-center w-8 h-8 rounded-full text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] hover:bg-[var(--glass-bg-secondary)] transition-all text-base leading-none"
      >
        ···
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 z-20 min-w-[160px] glass-elevated rounded-xl shadow-lg border border-[var(--glass-border)] overflow-hidden">
          <div
            className="flex flex-col py-1"
            onClick={() => setOpen(false)}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
