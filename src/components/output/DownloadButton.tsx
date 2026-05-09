"use client";

interface DownloadButtonProps {
  content: string;
  filename: string;
  mimeType?: string;
  label?: string;
}

export function DownloadButton({
  content,
  filename,
  mimeType = "text/plain",
  label,
}: DownloadButtonProps) {
  function handleDownload() {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="text-xs px-3 py-1.5 rounded-full font-medium glass text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] transition-all duration-150"
    >
      {label ?? "Download"}
    </button>
  );
}
