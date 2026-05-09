"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, type DocumentData } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";
import type { Platform } from "@/src/types/outputs";

interface UseOutputReturn {
  data: DocumentData | null;
  loading: boolean;
  error: string | null;
}

export function useOutput(projectId: string, platform: Platform): UseOutputReturn {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const outputRef = doc(db, "projects", projectId, "outputs", platform);

    const unsubscribe = onSnapshot(
      outputRef,
      (snap) => {
        if (!snap.exists()) {
          setData(null);
          setLoading(false);
          return;
        }
        setData(snap.data());
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, platform]);

  return { data, loading, error };
}
