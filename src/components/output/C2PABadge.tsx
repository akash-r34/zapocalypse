"use client";

import { useC2PAManifest } from "@/src/hooks/useC2PAManifests";
import { DownloadButton } from "./DownloadButton";

interface C2PABadgeProps {
  projectId: string;
  platform: string;
}

export function C2PABadge({ projectId, platform }: C2PABadgeProps) {
  const { data, loading } = useC2PAManifest(projectId, platform);

  if (loading || !data) return null;

  const isSigned = data.signing_status === "signed";
  const hash = typeof data.content_credentials?.content_hash === "string"
    ? data.content_credentials.content_hash
    : null;
  const thumbprint = typeof data.certificate_thumbprint === "string"
    ? data.certificate_thumbprint
    : null;
  const timestamp = typeof data.content_credentials?.creation_timestamp === "string"
    ? data.content_credentials.creation_timestamp
    : null;
  const model = typeof data.tool_used?.model === "string" ? data.tool_used.model : null;

  const downloadContent = JSON.stringify(data, null, 2);
  const filename = `zapocalypse-content-credential-${platform}.json`;

  return (
    <details className="group">
      <summary className="list-none cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border select-none"
        style={{
          background: isSigned ? "color-mix(in srgb, var(--glass-accent) 8%, transparent)" : "color-mix(in srgb, var(--glass-bg-secondary) 60%, transparent)",
          borderColor: isSigned ? "color-mix(in srgb, var(--glass-accent) 30%, transparent)" : "var(--glass-border)",
          color: isSigned ? "var(--glass-accent)" : "var(--glass-text-secondary)",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0">
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3 5l1.5 1.5L7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{isSigned ? "Signed credentials" : "Content credentials"}</span>
        <span className="text-[var(--glass-text-tertiary)] group-open:hidden">▸</span>
        <span className="text-[var(--glass-text-tertiary)] hidden group-open:inline">▾</span>
      </summary>

      <div className="mt-2 p-3 rounded-xl glass text-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[var(--glass-text-tertiary)] w-28 shrink-0">Status</span>
          <span className={isSigned ? "text-[var(--glass-accent)] font-medium" : "text-[var(--glass-text-secondary)]"}>
            {isSigned ? "Cryptographically signed" : "Metadata only"}
          </span>
        </div>

        {model && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--glass-text-tertiary)] w-28 shrink-0">Model</span>
            <span className="text-[var(--glass-text-secondary)] font-mono">{model}</span>
          </div>
        )}

        {timestamp && (
          <div className="flex items-center gap-2">
            <span className="text-[var(--glass-text-tertiary)] w-28 shrink-0">Created</span>
            <span className="text-[var(--glass-text-secondary)]">
              {new Date(timestamp).toLocaleString()}
            </span>
          </div>
        )}

        {hash && (
          <div className="flex items-start gap-2">
            <span className="text-[var(--glass-text-tertiary)] w-28 shrink-0">Content hash</span>
            <span
              className="text-[var(--glass-text-secondary)] font-mono truncate max-w-[200px]"
              title={hash}
            >
              {hash.replace("sha256:", "").slice(0, 16)}…
            </span>
          </div>
        )}

        {isSigned && thumbprint && (
          <div className="flex items-start gap-2">
            <span className="text-[var(--glass-text-tertiary)] w-28 shrink-0">Cert thumbprint</span>
            <span
              className="text-[var(--glass-text-secondary)] font-mono truncate max-w-[200px]"
              title={thumbprint}
            >
              {thumbprint.slice(0, 16)}…
            </span>
          </div>
        )}

        <div className="pt-1 border-t border-[var(--glass-border-light)]">
          <DownloadButton
            content={downloadContent}
            filename={filename}
            mimeType="application/json"
            label="Download manifest"
          />
        </div>
      </div>
    </details>
  );
}
