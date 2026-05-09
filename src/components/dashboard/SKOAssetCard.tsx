import Link from "next/link";
import type { ProjectSummary } from "@/src/hooks/useRecentProjects";

interface SKOAssetCardProps {
  project: ProjectSummary;
}

/**
 * Card for projects where extraction succeeded but synthesis failed.
 * The SKO (source knowledge object) was retained as a user asset.
 */
export function SKOAssetCard({ project }: SKOAssetCardProps) {
  return (
    <Link
      href={`/project/${project.id}`}
      className="block rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-left transition-colors hover:bg-amber-500/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              Asset saved
            </span>
            {project.refunded && (
              <span className="text-xs text-emerald-400">Credits refunded</span>
            )}
          </div>
          <p className="text-xs text-[var(--glass-text-secondary)]">
            Source material processed — regenerate for fewer credits
          </p>
        </div>
        <span className="text-xs text-[var(--glass-text-tertiary)] shrink-0">
          {project.createdAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </Link>
  );
}
