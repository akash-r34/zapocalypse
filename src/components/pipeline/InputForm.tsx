"use client";

import { useState, useRef } from "react";
import { Button } from "@/src/components/ui/Button";
import { Chip } from "@/src/components/ui/Chip";
import { Card } from "@/src/components/ui/Card";

type InputMode = "url" | "text" | "file";

interface InputFormProps {
  onSubmit: (input: { mode: InputMode; value: string | File }) => Promise<void>;
  disabled?: boolean;
}

function detectMode(value: string): InputMode {
  const trimmed = value.trim();
  if (!trimmed) return "text";
  // URL only if entire input is a single URL (no spaces, no newlines)
  if (/^https?:\/\/\S+$/.test(trimmed) && !trimmed.includes("\n")) return "url";
  return "text";
}

export function InputForm({ onSubmit, disabled }: InputFormProps) {
  const [rawInput, setRawInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [modeOverride, setModeOverride] = useState<InputMode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectedMode: InputMode = file ? "file" : detectMode(rawInput);
  const activeMode = modeOverride ?? detectedMode;

  const MODE_LABELS: Record<InputMode, string> = {
    url: "URL",
    text: "Text",
    file: "File",
  };

  function handleFileSelect(selected: File) {
    if (selected.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }
    setFile(selected);
    setModeOverride(null); // let detection take over (file mode)
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = activeMode === "file" ? file : rawInput.trim();

    if (!value) {
      setError("Please provide some content to process.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ mode: activeMode, value: value as string | File });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* File chip — shown when a file is selected */}
        {file && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--glass-bg-secondary)] text-sm">
            <svg className="w-4 h-4 shrink-0 text-[var(--glass-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium text-[var(--glass-text)] truncate flex-1">
              {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </span>
            <button
              type="button"
              onClick={() => { setFile(null); setModeOverride(null); }}
              className="text-[var(--glass-text-tertiary)] hover:text-[var(--glass-text)] text-sm leading-none"
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        )}

        {/* Main input + attach button */}
        <div
          className={`relative transition-colors ${dragging ? "ring-2 ring-[var(--glass-accent)] rounded-xl" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <textarea
            rows={file ? 2 : 8}
            placeholder={file ? "Add context or leave empty…" : "Paste a URL, drop a file, or type your content…"}
            value={rawInput}
            onChange={(e) => {
              setRawInput(e.target.value);
              if (modeOverride && !file) setModeOverride(null); // reset override when user types
            }}
            disabled={loading || disabled}
            className="w-full resize-none rounded-xl border border-[var(--glass-border)] bg-transparent px-4 py-3 pr-12 text-sm text-[var(--glass-text)] placeholder:text-[var(--glass-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--glass-accent)]/30 disabled:opacity-50 transition-all"
          />
          {/* Attach icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || disabled}
            title="Attach file"
            className="absolute right-3 bottom-3 p-1.5 rounded-lg text-[var(--glass-text-tertiary)] hover:text-[var(--glass-accent)] hover:bg-[var(--glass-bg-secondary)] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            disabled={loading || disabled}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
              e.target.value = "";
            }}
          />
        </div>

        {/* Mode indicator + override chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[var(--glass-text-tertiary)]">
            Will process as:
          </span>
          <span className="text-xs font-semibold text-[var(--glass-accent)]">
            {MODE_LABELS[activeMode]}
          </span>
          <span className="text-[var(--glass-text-tertiary)] text-xs">·</span>
          <span className="text-xs text-[var(--glass-text-tertiary)]">Override:</span>
          {(["url", "text", "file"] as InputMode[]).map((m) => (
            <Chip
              key={m}
              label={MODE_LABELS[m]}
              selected={modeOverride === m}
              onClick={() => setModeOverride(modeOverride === m ? null : m)}
            />
          ))}
        </div>

        {/* Char count for text mode */}
        {activeMode === "text" && rawInput.length > 0 && (
          <p className="text-xs text-[var(--glass-text-tertiary)] -mt-2">
            {rawInput.length.toLocaleString()} chars (min 100, max 50,000)
          </p>
        )}

        {/* URL hint */}
        {activeMode === "url" && (
          <p className="text-xs text-[var(--glass-text-tertiary)] -mt-2">
            Supports articles and blog posts. YouTube links coming soon.
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-[var(--glass-danger)]">{error}</p>
        )}

        {/* Submit */}
        <Button type="submit" loading={loading} disabled={disabled} className="w-full">
          {loading ? "Running pipeline…" : "Generate Content"}
        </Button>
      </form>
    </Card>
  );
}
