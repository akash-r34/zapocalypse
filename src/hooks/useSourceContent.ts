"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

interface UseSourceContentReturn {
  rawContent: string | null;
  loading: boolean;
}

/**
 * On-demand hook — only fetches when projectId is non-null.
 * Pass null to skip the fetch (before the user requests full content).
 */
export function useSourceContent(projectId: string | null): UseSourceContentReturn {
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (!projectId) return;
    const db = getClientFirestore();
    getDoc(doc(db, "projects", projectId, "source", "current"))
      .then((snap) => {
        if (snap.exists()) {
          setRawContent((snap.data().rawContent as string) ?? null);
        }
      })
      .catch(() => {
        // Non-fatal — user just won't see full content
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return { rawContent, loading };
}
