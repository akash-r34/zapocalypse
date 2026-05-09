"use client";

import { TextareaHTMLAttributes, InputHTMLAttributes, forwardRef } from "react";

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
}

type InputFieldProps = BaseFieldProps &
  InputHTMLAttributes<HTMLInputElement> & { multiline?: false };

type TextareaFieldProps = BaseFieldProps &
  TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

type TextFieldProps = InputFieldProps | TextareaFieldProps;

const inputClasses =
  "w-full px-4 py-3 text-sm rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--glass-text)] placeholder:text-[var(--glass-text-tertiary)] outline-none focus:ring-1 focus:ring-[var(--glass-text)]/20 focus:border-[var(--glass-border-light)] transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]";

export const TextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>(({ label, error, hint, ...props }, ref) => {
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const { multiline, ...restProps } = props as TextareaFieldProps;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-medium text-[var(--glass-text-secondary)]"
      >
        {label}
      </label>

      {multiline ? (
        <textarea
          id={id}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={`${inputClasses} resize-none`}
          {...(restProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          ref={ref as React.Ref<HTMLInputElement>}
          className={inputClasses}
          {...(restProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <p className="text-xs text-[var(--glass-danger)]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--glass-text-tertiary)]">{hint}</p>
      )}
    </div>
  );
});

TextField.displayName = "TextField";
