"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

interface UseHookScoresReturn {
  data: DocumentData | null;
  loading: boolean;
}

export function useHookScores(projectId: string): UseHookScoresReturn {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = doc(db, "projects", projectId, "hook_scores", "current");

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? snap.data() : null);
        setLoading(false);
      },
      () => {
        setData(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { data, loading };
}
