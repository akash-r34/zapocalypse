import Link from "next/link";
import { STATUS_LABEL, STATUS_COLOR } from "./projectStatus";
import { SKOAssetCard } from "./SKOAssetCard";
import { useOutputExistence } from "@/src/hooks/useOutputExistence";
import type { ProjectSummary } from "@/src/hooks/useRecentProjects";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PlatformChips({ projectId }: { projectId: string }) {
  const { ready, loading } = useOutputExistence(projectId);
  
  if (loading || ready.length === 0) return null;
  
  const labelMap: Record<string, string> = {
    twitter: "𝕏",
    linkedin: "in",
    newsletter: "✉",
    veo: "🎥",
    dark_social: "💬"
  };

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {ready.map((platform) => (
        <span key={platform} className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--glass-bg-secondary)] border border-[var(--glass-border)] text-[var(--glass-text-secondary)]" title={platform}>
          {labelMap[platform] || platform}
        </span>
      ))}
    </div>
  );
}

interface PreviewData {
  firstTweet?: string;
  linkedInHook?: string;
  newsletterSubject?: string;
}

export function ProjectCard({ project, preview }: { project: ProjectSummary; preview?: PreviewData }) {
  const isComplete = project.status === "complete";

  if (project.skoRetained) {
    return <SKOAssetCard project={project} />;
  }

  return (
    <Link
      href={`/project/${project.id}`}
      className={`flex flex-col rounded-xl glass transition-transform hover:scale-[1.01] ${isComplete && preview ? "p-4 gap-3" : "p-4"}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs px-2 py-0.5 rounded-full font-mono shrink-0 bg-[var(--glass-bg-secondary)] text-[var(--glass-text-secondary)]">
            {project.sourceType}
          </span>
          <span className="text-sm font-medium truncate text-[var(--glass-text)]">
            {project.title ?? `${project.id.slice(0, 8)}…`}
          </span>
        </div>
      </div>
      
      {/* Meta row */}
      <div className="flex items-center gap-3 shrink-0 mt-2">
        <span
          className="text-xs font-medium"
          style={{ color: STATUS_COLOR[project.status] }}
        >
          {STATUS_LABEL[project.status]}
        </span>
        {project.refunded && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--glass-bg-secondary)] text-[var(--glass-text-tertiary)]">
            refunded
          </span>
        )}
        {project.totalCost !== undefined && (
          <span className="text-xs font-mono text-[var(--glass-text-tertiary)]">
            ${project.totalCost.toFixed(4)}
          </span>
        )}
        <span className="text-xs text-[var(--glass-text-tertiary)] hidden sm:inline">
          {formatDate(project.createdAt)}
        </span>
      </div>

      <PlatformChips projectId={project.id} />

      {/* Preview snippets — only for completed projects with fetched data */}
      {isComplete && preview && (preview.firstTweet || preview.linkedInHook || preview.newsletterSubject) && (
        <div className="space-y-1.5 border-t border-[var(--glass-border)] pt-3 mt-1">
          {preview.firstTweet && (
            <p className="text-xs text-[var(--glass-text-tertiary)] truncate flex items-center gap-2">
              <span className="shrink-0 opacity-60">𝕏</span>
              {preview.firstTweet}
            </p>
          )}
          {preview.linkedInHook && (
            <p className="text-xs text-[var(--glass-text-tertiary)] truncate flex items-center gap-2">
              <span className="shrink-0 opacity-60">in</span>
              {preview.linkedInHook}
            </p>
          )}
          {preview.newsletterSubject && (
            <p className="text-xs text-[var(--glass-text-tertiary)] truncate flex items-center gap-2">
              <span className="shrink-0 opacity-60">✉</span>
              {preview.newsletterSubject}
            </p>
          )}
        </div>
      )}
    </Link>
  );
}
