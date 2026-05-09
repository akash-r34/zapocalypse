"use client";

import { useC2PAManifests } from "@/src/hooks/useC2PAManifests";
import { DownloadButton } from "./DownloadButton";

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  veo: "Veo Script",
  dark_social: "Dark Social",
};

interface C2PAManifestViewerProps {
  projectId: string;
}

export function C2PAManifestViewer({ projectId }: C2PAManifestViewerProps) {
  const { manifests, loading } = useC2PAManifests(projectId);

  if (loading) return null;

  const platformKeys = Object.keys(manifests);
  if (platformKeys.length === 0) return null;

  const signedCount = platformKeys.filter((p) => manifests[p].signing_status === "signed").length;
  const allContent = JSON.stringify(manifests, null, 2);

  return (
    <details className="glass rounded-xl">
      <summary className="px-4 py-3 text-xs font-medium text-[var(--glass-text-secondary)] list-none flex items-center gap-2 select-none cursor-pointer">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-[var(--glass-accent)]">
          <path d="M6 1L1 4v4l5 3 5-3V4L6 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 7V5m0 0L4 4m2 1 2-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>Content provenance</span>
        <span className="ml-auto text-[var(--glass-text-tertiary)]">
          {signedCount}/{platformKeys.length} signed
        </span>
        <span className="text-[var(--glass-text-tertiary)]">▸</span>
      </summary>

      <div className="px-4 pb-4 space-y-3">
        {platformKeys.map((platform) => {
          const manifest = manifests[platform];
          const isSigned = manifest.signing_status === "signed";
          const hash = typeof manifest.content_credentials?.content_hash === "string"
            ? manifest.content_credentials.content_hash
            : null;
          const timestamp = typeof manifest.content_credentials?.creation_timestamp === "string"
            ? manifest.content_credentials.creation_timestamp
            : null;
          const platformContent = JSON.stringify(manifest, null, 2);

          return (
            <div
              key={platform}
              className="rounded-lg p-3 flex items-start gap-3"
              style={{ background: "color-mix(in srgb, var(--glass-bg-secondary) 50%, transparent)" }}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--glass-text)]">
                    {PLATFORM_LABELS[platform] ?? platform}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border"
                    style={{
                      background: isSigned
                        ? "color-mix(in srgb, var(--glass-accent) 10%, transparent)"
                        : "color-mix(in srgb, var(--glass-bg-secondary) 80%, transparent)",
                      borderColor: isSigned
                        ? "color-mix(in srgb, var(--glass-accent) 30%, transparent)"
                        : "var(--glass-border)",
                      color: isSigned ? "var(--glass-accent)" : "var(--glass-text-tertiary)",
                    }}
                  >
                    {isSigned ? "Signed" : "Metadata only"}
                  </span>
                </div>

                {hash && (
                  <p
                    className="text-[10px] font-mono text-[var(--glass-text-tertiary)] truncate"
                    title={hash}
                  >
                    {hash.replace("sha256:", "sha256:").slice(0, 24)}…
                  </p>
                )}

                {timestamp && (
                  <p className="text-[10px] text-[var(--glass-text-tertiary)]">
                    {new Date(timestamp).toLocaleString()}
                  </p>
                )}
              </div>

              <DownloadButton
                content={platformContent}
                filename={`zapocalypse-credential-${platform}.json`}
                mimeType="application/json"
                label="Download"
              />
            </div>
          );
        })}

        <div className="pt-1 flex justify-end">
          <DownloadButton
            content={allContent}
            filename={`zapocalypse-credentials-all.json`}
            mimeType="application/json"
            label="Download all"
          />
        </div>
      </div>
    </details>
  );
}
