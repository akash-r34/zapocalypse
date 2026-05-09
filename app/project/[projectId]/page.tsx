"use client";

import { use, useState } from "react";
import { AppShell } from "@/src/components/layout/AppShell";
import { AgentProgressPanel } from "@/src/components/pipeline/AgentProgressPanel";
import { ProgressRing } from "@/src/components/pipeline/ProgressRing";
import { OutputTabs } from "@/src/components/output/OutputTabs";
import { ScoreBadge } from "@/src/components/output/ScoreBadge";
import { ToneCheckBadge } from "@/src/components/output/ToneCheckBadge";
import { C2PAManifestViewer } from "@/src/components/output/C2PAManifestViewer";
import { useProject } from "@/src/hooks/useProject";
import { useSourceContent } from "@/src/hooks/useSourceContent";
import { CostBreakdown } from "@/src/components/budget/CostBreakdown";
import { RefundBadge } from "@/src/components/budget/RefundBadge";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

function SourcePreviewSection({ projectId, preview }: { projectId: string; preview: string }) {
  const [expanded, setExpanded] = useState(false);
  const { rawContent, loading: fullLoading } = useSourceContent(expanded ? projectId : null);

  return (
    <details className="glass rounded-xl">
      <summary className="px-4 py-3 text-xs font-medium text-[var(--glass-text-secondary)] list-none flex items-center gap-2 select-none cursor-pointer">
        <span className="text-[var(--glass-text-tertiary)]">▸</span>
        Source content
      </summary>
      <div className="px-4 pb-4 space-y-3">
        <p className="text-xs text-[var(--glass-text-secondary)] whitespace-pre-wrap leading-relaxed">
          {rawContent ?? preview}
          {!rawContent && preview.length >= 199 && "…"}
        </p>
        {!rawContent && (
          <button
            onClick={() => setExpanded(true)}
            disabled={fullLoading}
            className="text-xs text-[var(--glass-accent)] hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {fullLoading ? "Loading…" : "Show full content"}
          </button>
        )}
      </div>
    </details>
  );
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);
  const { project, loading, error } = useProject(projectId);

  const statusLabel = loading
    ? "Processing your content"
    : error
      ? "Project Error"
      : project?.status === "complete"
        ? "Content Ready"
        : ["synthesizing", "scoring", "authenticating"].includes(project?.status ?? "")
          ? "Generating outputs…"
          : "Processing your content";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <p className="text-xs font-mono mb-1 text-[var(--glass-text-tertiary)]">
            {projectId}
          </p>
          {project?.title ? (
            <>
              <h2 className="text-2xl font-bold text-[var(--glass-text)]">
                {project.title}
              </h2>
              <p className="text-sm text-[var(--glass-text-secondary)] mt-0.5">
                {statusLabel}
              </p>
            </>
          ) : (
            <h2 className="text-2xl font-bold text-[var(--glass-text)]">
              {statusLabel}
            </h2>
          )}
          {project?.refunded && project.refundStage && project.refundedAmount !== undefined && (
            <div className="mt-2">
              <RefundBadge stage={project.refundStage} amount={project.refundedAmount} />
            </div>
          )}
        </div>

        {/* Source preview — shown once available */}
        {project?.sourcePreview && (
          <SourcePreviewSection projectId={projectId} preview={project.sourcePreview} />
        )}

        {/* Partial success — SKO retained, synthesis failed */}
        {project?.skoRetained && project.status === "error" && (
          <div className="rounded-2xl p-5 glass border border-amber-500/30 bg-amber-500/5 space-y-2">
            <p className="text-sm font-semibold text-amber-400">Source material saved</p>
            <p className="text-xs text-[var(--glass-text-secondary)]">
              Your content was analysed and extracted successfully. Synthesis failed on one or more
              platforms. You can regenerate individual outputs for fewer credits.
            </p>
          </div>
        )}

        {/* Error state (non-SKO errors) */}
        {error && !project?.skoRetained && (
          <div className="rounded-2xl p-6 glass border border-[var(--glass-danger)]/20">
            <p className="text-sm font-medium text-[var(--glass-danger)]">{error}</p>
          </div>
        )}

        {/* Pipeline progress */}
        {project && project.status !== "complete" && (
          <div className="space-y-3">
            <ProgressRing status={project.status} errorMessage={project.error} />
            <details className="glass rounded-xl cursor-pointer">
              <summary className="px-4 py-3 text-xs font-medium text-[var(--glass-text-secondary)] list-none flex items-center gap-2 select-none">
                <span className="text-[var(--glass-text-tertiary)]">▸</span>
                Pipeline details
              </summary>
              <div className="px-4 pb-4">
                <AgentProgressPanel
                  status={project.status}
                  errorMessage={project.error}
                />
              </div>
            </details>
          </div>
        )}

        {/* Loading skeleton — only shown before first Firestore snapshot arrives */}
        {loading && (
          <div className="rounded-2xl p-6 glass animate-pulse">
            <div className="h-4 rounded-full bg-[var(--glass-bg-secondary)] w-1/2 mb-4" />
            <div className="h-2 rounded-full bg-[var(--glass-bg-secondary)] w-full" />
          </div>
        )}

        {/* Pipeline cost — full-width, after progress ring */}
        {project && project.status !== "idle" && (
          <CostBreakdown
            projectId={projectId}
            refundedAmount={project.refundedAmount}
            refundStage={project.refundStage}
          />
        )}

        {/* Information Gain score — appears once analysis is written */}
        {project && project.status !== "idle" && (
          <ScoreBadge projectId={projectId} />
        )}

        {/* Output tabs — show progressively during synthesis */}
        {project && ["synthesizing", "scoring", "authenticating", "complete"].includes(project.status) && (
          <div className="space-y-3">
            {project.status === "complete" && (
              <div className="flex items-center gap-2 flex-wrap">
                <ToneCheckBadge projectId={projectId} outputErrors={project?.outputErrors} />
              </div>
            )}
            {project.status === "complete" && (
              <C2PAManifestViewer projectId={projectId} />
            )}
            <OutputTabs projectId={projectId} outputErrors={project?.outputErrors} />
          </div>
        )}
      </div>
    </AppShell>
  );
}
