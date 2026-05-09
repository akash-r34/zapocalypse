"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "filled" | "tonal" | "outlined" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  filled:
    "bg-[var(--glass-accent)] text-[var(--glass-bg)] hover:opacity-90 active:scale-[0.98]",
  tonal:
    "glass text-[var(--glass-text)] hover:bg-[var(--glass-surface-hover)]",
  outlined:
    "border border-[var(--glass-border-light)] text-[var(--glass-text)] bg-transparent hover:bg-[var(--glass-surface)]",
  text:
    "bg-transparent text-[var(--glass-text)] hover:opacity-70",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "filled", loading, disabled, children, className = "", style, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 px-6 h-10 rounded-full text-sm font-medium transition-all duration-150 select-none ${
          isDisabled ? "opacity-40 cursor-not-allowed" : `cursor-pointer ${variantClasses[variant]}`
        } ${className}`}
        style={style}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-[var(--glass-text)]/30 border-t-[var(--glass-text)] animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
