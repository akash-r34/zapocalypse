"use client";

import { use } from "react";
import Link from "next/link";
import { AppShell } from "@/src/components/layout/AppShell";
import { useOutput } from "@/src/hooks/useOutput";
import { TweetCarousel } from "@/src/components/output/TweetCarousel";
import { LinkedInPreview } from "@/src/components/output/LinkedInPreview";
import { NewsletterPreview } from "@/src/components/output/NewsletterPreview";
import { VeoPreview } from "@/src/components/output/VeoPreview";
import type { Platform } from "@/src/types/outputs";

interface OutputPageProps {
  params: Promise<{ projectId: string; platform: string }>;
}

const platformLabels: Record<Platform, string> = {
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  newsletter: "Newsletter",
  veo: "Veo Script",
  dark_social: "Dark Social",
};

export default function OutputPage({ params }: OutputPageProps) {
  const { projectId, platform } = use(params);
  const platformKey = platform as Platform;
  const label = platformLabels[platformKey] ?? platform;
  const { data, loading, error } = useOutput(projectId, platformKey);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${projectId}`}
            className="text-sm text-[var(--glass-text-secondary)] hover:text-[var(--glass-text)] transition-colors"
          >
            &larr; Back to project
          </Link>
        </div>
        <h2 className="text-2xl font-bold text-[var(--glass-text)]">{label}</h2>

        {loading && (
          <div className="rounded-2xl p-8 glass animate-pulse">
            <div className="h-4 rounded-full bg-[var(--glass-bg-secondary)] w-3/4 mb-3" />
            <div className="h-3 rounded-full bg-[var(--glass-bg-secondary)] w-1/2" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl p-6 glass border border-[var(--glass-danger)]/20">
            <p className="text-sm font-medium text-[var(--glass-danger)]">{error}</p>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="rounded-2xl p-8 text-center glass">
            <p className="text-sm text-[var(--glass-text-secondary)]">
              No output yet — pipeline may still be running.
            </p>
          </div>
        )}

        {data && <OutputView platform={platformKey} data={data} />}
      </div>
    </AppShell>
  );
}

function OutputView({
  platform,
  data,
}: {
  platform: Platform;
  data: Record<string, unknown>;
}) {
  switch (platform) {
    case "twitter":
      return (
        <TweetCarousel
          tweets={
            (data.tweets ?? []) as Array<{
              text: string;
              hook: string;
              type: string;
            }>
          }
          threadNarrative={data.thread_narrative as string | undefined}
        />
      );

    case "linkedin":
      return (
        <LinkedInPreview
          posts={
            (data.posts ?? []) as Array<{
              hook: string;
              body: string;
              cta: string;
              angle: string;
              estimated_read_time_seconds?: number;
            }>
          }
        />
      );

    case "newsletter":
      return (
        <NewsletterPreview
          subjectLine={(data.subject_line as string) ?? "Untitled"}
          previewText={data.preview_text as string | undefined}
          sections={
            (data.sections ?? []) as Array<{
              heading: string;
              content: string;
            }>
          }
          cta={data.cta as { text: string; context: string } | undefined}
          estimatedReadTimeMinutes={
            data.estimated_read_time_minutes as number | undefined
          }
        />
      );

    case "veo": {
      const script = data.script as Record<string, unknown> | undefined;
      if (!script) return null;
      return (
        <VeoPreview
          title={(script.title as string) ?? "Untitled"}
          hookSeconds={script.hook_seconds as number | undefined}
          scenes={
            (script.scenes ?? []) as Array<{
              scene_number: number;
              duration_seconds: number;
              visual_description: string;
              voiceover: string;
              on_screen_text?: string;
            }>
          }
          totalDurationSeconds={(script.total_duration_seconds as number) ?? 60}
          aspectRatio={(script.aspect_ratio as string) ?? "9:16"}
          styleNotes={script.style_notes as string | undefined}
        />
      );
    }

    default:
      return null;
  }
}
