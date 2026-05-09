"use client";

import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";
import { OverflowMenu } from "@/src/components/ui/OverflowMenu";

interface SceneData {
  scene_number: number;
  duration_seconds: number;
  visual_description: string;
  voiceover: string;
  on_screen_text?: string;
}

interface VeoPreviewProps {
  title: string;
  hookSeconds?: number;
  scenes: SceneData[];
  totalDurationSeconds: number;
  aspectRatio: string;
  styleNotes?: string;
}

export function VeoPreview({
  title,
  hookSeconds,
  scenes,
  totalDurationSeconds,
  aspectRatio,
  styleNotes,
}: VeoPreviewProps) {
  const { copy, isCopied } = useCopyToClipboard();

  const jsonContent = JSON.stringify(
    { title, hookSeconds, scenes, totalDurationSeconds, aspectRatio, styleNotes },
    null,
    2
  );

  const voiceoverScript = scenes
    .map((s) => `[Scene ${s.scene_number} — ${s.duration_seconds}s]\n${s.voiceover}`)
    .join("\n\n");

  return (
    <div className="space-y-4">
      {/* Script header */}
      <div className="rounded-xl p-6 glass">
        <p className="text-sm font-bold mb-1 text-[var(--glass-text)]">{title}</p>
        <div className="flex items-center gap-3 text-xs text-[var(--glass-text-tertiary)]">
          <span>{totalDurationSeconds}s</span>
          <span>{aspectRatio}</span>
          {hookSeconds && <span>Hook: {hookSeconds}s</span>}
        </div>
        {styleNotes && (
          <p className="text-xs mt-2 italic text-[var(--glass-text-secondary)]">
            {styleNotes}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl p-4 glass">
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {scenes.map((scene, idx) => (
            <div
              key={scene.scene_number}
              className="h-full first:rounded-l-full last:rounded-r-full bg-[var(--glass-accent)]"
              style={{
                width: `${(scene.duration_seconds / totalDurationSeconds) * 100}%`,
                opacity: 0.3 + (idx / scenes.length) * 0.7,
              }}
              title={`Scene ${scene.scene_number} — ${scene.duration_seconds}s`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs mt-1.5 text-[var(--glass-text-tertiary)]">
          <span>0s</span>
          <span>{totalDurationSeconds}s</span>
        </div>
      </div>

      {/* Scene cards */}
      {scenes.map((scene) => (
        <div key={scene.scene_number} className="rounded-xl p-5 glass">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--glass-accent)]/10 text-[var(--glass-text-secondary)]">
              Scene {scene.scene_number}
            </span>
            <span className="text-xs text-[var(--glass-text-tertiary)]">
              {scene.duration_seconds}s
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs font-medium block mb-0.5 text-[var(--glass-text-tertiary)]">
                Visual
              </span>
              <p className="text-[var(--glass-text)]">{scene.visual_description}</p>
            </div>
            <div>
              <span className="text-xs font-medium block mb-0.5 text-[var(--glass-text-tertiary)]">
                Voiceover
              </span>
              <p className="text-[var(--glass-text)]">{scene.voiceover}</p>
            </div>
            {scene.on_screen_text && (
              <div>
                <span className="text-xs font-medium block mb-0.5 text-[var(--glass-text-tertiary)]">
                  Text overlay
                </span>
                <p className="text-[var(--glass-accent-muted)]">{scene.on_screen_text}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <CopyButton
          copied={isCopied("veo-json")}
          onClick={() => copy(jsonContent, "veo-json")}
          label="Copy JSON"
        />
        <OverflowMenu>
          <CopyButton
            copied={isCopied("veo-voiceover")}
            onClick={() => copy(voiceoverScript, "veo-voiceover")}
            label="Copy voiceover"
          />
          <DownloadButton
            content={jsonContent}
            filename="veo-script.json"
            mimeType="application/json"
            label="Download .json"
          />
        </OverflowMenu>
      </div>
    </div>
  );
}
