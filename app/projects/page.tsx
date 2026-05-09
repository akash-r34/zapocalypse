"use client";

import { useState } from "react";
import { AppShell } from "@/src/components/layout/AppShell";
import { useAllProjects } from "@/src/hooks/useAllProjects";
import { useArtifactPreviews } from "@/src/hooks/useArtifactPreviews";
import { ProjectCard } from "@/src/components/dashboard/ProjectCard";

export default function ProjectsPage() {
  const { projects, loading, loadMore } = useAllProjects(50);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Only fetch previews for completed elements currently on screen
  const completedIds = projects.filter((p) => p.status === "complete").map((p) => p.id);
  const previews = useArtifactPreviews(completedIds);

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (sourceFilter !== "all" && p.sourceType !== sourceFilter) return false;
    if (search) {
      if (p.title && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (!p.title && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--glass-text)]">All Projects</h1>
        </div>

        {/* Filter bar */}
        <div className="glass p-4 rounded-xl flex flex-wrap gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search titles or IDs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:flex-1 sm:min-w-[200px] bg-[var(--glass-bg-secondary)] border border-[var(--glass-border)] rounded-md px-3 py-2 text-sm text-[var(--glass-text)] focus:outline-none focus:border-[var(--glass-accent)]"
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--glass-bg-secondary)] border border-[var(--glass-border)] rounded-md px-3 py-2 text-sm text-[var(--glass-text)] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="complete">Complete</option>
            <option value="error">Error</option>
            <option value="budget_exceeded">Budget Exceeded</option>
            <option value="idle">Idle / Processing</option>
          </select>

          <select 
            value={sourceFilter} 
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full sm:w-auto bg-[var(--glass-bg-secondary)] border border-[var(--glass-border)] rounded-md px-3 py-2 text-sm text-[var(--glass-text)] focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="url">URL</option>
            <option value="text">Text</option>
            <option value="file">File</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && projects.length === 0 && (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl p-4 glass animate-pulse min-h-[140px]">
                <div className="h-3 rounded-full bg-[var(--glass-bg-secondary)] w-1/3 mb-4" />
                <div className="h-2.5 rounded-full bg-[var(--glass-bg-secondary)] w-1/2" />
              </div>
            ))
          )}

          {!loading && filteredProjects.length === 0 && (
            <div className="col-span-full rounded-2xl p-10 text-center glass">
              <p className="text-[var(--glass-text-secondary)]">
                No projects matched your filters.
              </p>
            </div>
          )}

          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              preview={previews[project.id]} 
            />
          ))}
        </div>

        {filteredProjects.length > 0 && projects.length >= 50 && (
          <div className="text-center pt-8">
            <button
              onClick={loadMore}
              className="px-6 py-2 rounded-full font-medium bg-[var(--glass-bg-secondary)] border border-[var(--glass-border)] text-[var(--glass-text)] hover:bg-[var(--glass-bg-tertiary)] transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
