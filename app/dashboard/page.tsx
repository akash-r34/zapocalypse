"use client";

import Link from "next/link";
import { AppShell } from "@/src/components/layout/AppShell";
import { BudgetMeter } from "@/src/components/budget/BudgetMeter";
import { SpendChart } from "@/src/components/budget/SpendChart";
import { useBudget } from "@/src/hooks/useBudget";
import { useRecentProjects } from "@/src/hooks/useRecentProjects";
import { useArtifactPreviews } from "@/src/hooks/useArtifactPreviews";
import { useMonthlyRefunds } from "@/src/hooks/useMonthlyRefunds";
import { ProjectCard } from "@/src/components/dashboard/ProjectCard";

export default function DashboardPage() {
  const { budget } = useBudget();
  const { projects, loading } = useRecentProjects(10);
  const { refundedTotal } = useMonthlyRefunds();
  const completedIds = projects.filter((p) => p.status === "complete").map((p) => p.id);
  const previews = useArtifactPreviews(completedIds);
  
  const completedCount = projects.filter(p => p.status === "complete").length;
  const spentCount = budget?.spent ?? 0;

  return (
    <AppShell>
      <div className="space-y-6">
        
        {/* OpusClip-style "quick start" bar */}
        <div className="glass-elevated rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--glass-text)]">Create something new</h1>
            <p className="text-[var(--glass-text-secondary)] mt-1">Transform any content into 5 platforms instantly.</p>
          </div>
          <Link
            href="/create"
            className="px-6 py-3 rounded-full font-bold bg-[var(--glass-accent)] text-[var(--glass-bg)] shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            New Project
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Recent projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--glass-text)]">
                Recent Projects
              </h2>
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl p-4 glass animate-pulse min-h-[140px]">
                    <div className="h-3 rounded-full bg-[var(--glass-bg-secondary)] w-1/3 mb-4" />
                    <div className="h-2.5 rounded-full bg-[var(--glass-bg-secondary)] w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!loading && projects.length === 0 && (
              <div className="rounded-2xl p-10 text-center glass">
                <p className="text-[var(--glass-text-secondary)]">
                  No projects yet — create your first one above
                </p>
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {projects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    preview={previews[project.id]} 
                  />
                ))}
              </div>
            )}

            {!loading && projects.length > 0 && (
              <div className="pt-2">
                <Link
                  href="/projects"
                  className="text-sm font-medium text-[var(--glass-accent)] hover:underline"
                >
                  See all projects →
                </Link>
              </div>
            )}
          </div>

          {/* Budget sidebar */}
          <div className="space-y-4">
            {/* Stats Block */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[var(--glass-text-secondary)] flex items-center justify-between">
                <span>This Month</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--glass-bg-secondary)] rounded-xl p-3">
                  <div className="text-[20px] font-bold text-[var(--glass-text)]">{completedCount}</div>
                  <div className="text-xs text-[var(--glass-text-tertiary)] uppercase mt-1">Completed</div>
                </div>
                <div className="bg-[var(--glass-bg-secondary)] rounded-xl p-3">
                  <div className="text-[20px] font-bold text-[var(--glass-text)]">${spentCount.toFixed(2)}</div>
                  <div className="text-xs text-[var(--glass-text-tertiary)] uppercase mt-1">Spent</div>
                </div>
              </div>
            </div>

            {/* Existing Budget Data */}
            {budget && (
              <div className="rounded-2xl p-5 glass">
                <h3 className="text-sm font-semibold text-[var(--glass-text-secondary)] mb-4">
                  Budget Tracking
                </h3>
                <BudgetMeter spent={budget.spent} limit={budget.limit} refundedTotal={refundedTotal} />
                <div className="mt-4">
                  <SpendChart projectIds={projects.map((p) => p.id)} />
                </div>
                {budget.killSwitch && (
                  <div className="mt-4 rounded-xl p-3 text-xs font-medium bg-[var(--glass-danger)]/10 text-[var(--glass-danger)]">
                    Kill-switch active — all pipelines paused.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
