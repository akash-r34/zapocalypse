"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit as limitOpt,
  onSnapshot,
} from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";
import type { ProjectSummary } from "./useRecentProjects";

interface UseAllProjectsReturn {
  projects: ProjectSummary[];
  loading: boolean;
  loadMore: () => void;
}

export function useAllProjects(initialCount = 50): UseAllProjectsReturn {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(initialCount);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(
      collection(db, "projects"),
      orderBy("createdAt", "desc"),
      limitOpt(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setProjects(
          snap.docs.map((doc) => {
            const d = doc.data();
            return {
              id: doc.id,
              status: d.status,
              sourceType: d.sourceType,
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
        setProjects([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  function loadMore() {
    setLimitCount((prev) => prev + 50);
  }

  return { projects, loading, loadMore };
}
