"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/src/components/layout/AppShell";
import { InputForm } from "@/src/components/pipeline/InputForm";
import { authedFetch } from "@/src/lib/auth/authedFetch";

export default function CreatePage() {
  const router = useRouter();

  async function handleSubmit({
    mode,
    value,
  }: {
    mode: "url" | "text" | "file";
    value: string | File;
  }) {
    let textValue: string;
    let fileType: string | undefined;
    let fileSize: number | undefined;
    let fileName: string | undefined;

    if (value instanceof File) {
      textValue = await value.text();
      fileType = value.type;
      fileSize = value.size;
      fileName = value.name;
    } else {
      textValue = value;
    }

    const res = await authedFetch("/api/pipeline/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, value: textValue, fileType, fileSize, fileName }),
    });

    const data = await res.json().catch(() => ({})) as { error?: string; projectId?: string };

    if (!res.ok) {
      throw new Error(data.error ?? `Pipeline failed (${res.status})`);
    }

    const { projectId } = data as { projectId: string };
    router.push(`/project/${projectId}`);
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 glass-elevated p-6 sm:p-12 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--glass-text)]/[0.03] to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-[var(--glass-text)] tracking-tight">
            New Project
          </h2>
          <p className="mt-2 text-sm text-[var(--glass-text-secondary)]">
            Paste a URL, drop a file, or type your content — Zapocalypse auto-detects.
          </p>
        </div>

        <div className="relative z-10 glass rounded-2xl p-1 shadow-inner border border-[var(--glass-border)]">
          <InputForm onSubmit={handleSubmit} />
        </div>
      </div>
    </AppShell>
  );
}
