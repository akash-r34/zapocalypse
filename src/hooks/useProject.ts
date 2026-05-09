"use client";

import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";
import type { PipelineStatus, RegenerationEntry } from "@/src/types/project";
import type { Platform } from "@/src/types/outputs";
import type { SKO } from "@/src/lib/ai/schemas/sko";

export interface ProjectData {
  id: string;
  status: PipelineStatus;
  sourceType: "url" | "text" | "file";
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
  outputs?: Partial<Record<Platform, DocumentData>>;
  outputErrors?: Record<string, string>;
  regenerationCount?: number;
  regenerationState?: Record<string, RegenerationEntry>;
  sko?: SKO;
  refunded?: boolean;
  refundedAmount?: number;
  refundStage?: "full" | "synthesis_only";
  skoRetained?: boolean;
  title?: string;
  sourcePreview?: string;
  totalCost?: number;
}

interface UseProjectReturn {
  project: ProjectData | null;
  loading: boolean;
  error: string | null;
}

export function useProject(projectId: string): UseProjectReturn {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const projectRef = doc(db, "projects", projectId);

    const unsubscribe = onSnapshot(
      projectRef,
      async (snap) => {
        if (!snap.exists()) {
          setError("Project not found");
          setLoading(false);
          return;
        }

        const data = snap.data();

        const projectData: ProjectData = {
          id: snap.id,
          status: data.status as PipelineStatus,
          sourceType: data.sourceType as "url" | "text" | "file",
          error: data.error,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : undefined,
          outputErrors: data.outputErrors,
          regenerationCount: data.regenerationCount ?? 0,
          refunded: typeof data.refunded === "boolean" ? data.refunded : undefined,
          refundedAmount: typeof data.refundedAmount === "number" ? data.refundedAmount : undefined,
          refundStage: data.refundStage === "full" || data.refundStage === "synthesis_only"
            ? data.refundStage
            : undefined,
          skoRetained: typeof data.skoRetained === "boolean" ? data.skoRetained : undefined,
          title: typeof data.title === "string" ? data.title : undefined,
          sourcePreview: typeof data.sourcePreview === "string" ? data.sourcePreview : undefined,
          totalCost: typeof data.totalCost === "number" ? data.totalCost : undefined,
          regenerationState: data.regenerationState
            ? Object.fromEntries(
                Object.entries(data.regenerationState as Record<string, Record<string, unknown>>).map(
                  ([platform, entry]) => [
                    platform,
                    {
                      status: entry.status as RegenerationEntry["status"],
                      intent: entry.intent === "retry" || entry.intent === "refine"
                        ? entry.intent
                        : undefined,
                      startedAt: entry.startedAt && typeof (entry.startedAt as { toDate?: () => Date }).toDate === "function"
                        ? (entry.startedAt as { toDate: () => Date }).toDate()
                        : undefined,
                      completedAt: entry.completedAt && typeof (entry.completedAt as { toDate?: () => Date }).toDate === "function"
                        ? (entry.completedAt as { toDate: () => Date }).toDate()
                        : undefined,
                      error: entry.error as string | undefined,
                      refundedAmount: typeof entry.refundedAmount === "number" ? entry.refundedAmount : undefined,
                    } satisfies RegenerationEntry,
                  ]
                )
              )
            : undefined,
        };

        // When in a post-extraction status, fetch outputs and sko subcollections
        const statusesWithData = ["synthesizing", "scoring", "authenticating", "complete"];
        if (statusesWithData.includes(data.status)) {
          try {
            const [outputsSnap, skoSnap] = await Promise.all([
              getDocs(collection(db, "projects", projectId, "outputs")),
              getDocs(collection(db, "projects", projectId, "sko")),
            ]);

            const outputs: Partial<Record<Platform, DocumentData>> = {};
            outputsSnap.forEach((outputDoc) => {
              outputs[outputDoc.id as Platform] = outputDoc.data();
            });
            projectData.outputs = outputs;

            // SKO is in sko/current doc
            const skoDoc = skoSnap.docs.find(d => d.id === "current");
            if (skoDoc) {
              projectData.sko = skoDoc.data() as SKO;
            }
          } catch (err) {
            console.warn("Failed to fetch subcollections:", err);
            // May not exist yet — not a fatal error
          }
        }

        setProject(projectData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { project, loading, error };
}
