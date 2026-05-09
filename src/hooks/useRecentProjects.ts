"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";
import type { PipelineStatus } from "@/src/types/project";

export interface ProjectSummary {
  id: string;
  status: PipelineStatus;
  sourceType: "url" | "text" | "file";
  createdAt: Date | null;
  refunded?: boolean;
  refundedAmount?: number;
  skoRetained?: boolean;
  title?: string;
  totalCost?: number;
}

interface UseRecentProjectsReturn {
  projects: ProjectSummary[];
  loading: boolean;
}

export function useRecentProjects(count = 10): UseRecentProjectsReturn {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc"),
      limit(count)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setProjects(
          snap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              status: d.status as PipelineStatus,
              sourceType: d.sourceType as "url" | "text" | "file",
              createdAt: d.createdAt?.toDate() ?? null,
              refunded: typeof d.refunded === "boolean" ? d.refunded : undefined,
              refundedAmount: typeof d.refundedAmount === "number" ? d.refundedAmount : undefined,
              skoRetained: typeof d.skoRetained === "boolean" ? d.skoRetained : undefined,
              title: typeof d.title === "string" ? d.title : undefined,
              totalCost: typeof d.totalCost === "number" ? d.totalCost : undefined,
            };
          })
        );
        setLoading(false);
      },
      () => {
        // Firestore not configured yet — show empty state
        setProjects([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [count]);

  return { projects, loading };
}
