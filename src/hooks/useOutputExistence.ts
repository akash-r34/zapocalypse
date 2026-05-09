"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";
import type { Platform } from "@/src/types/outputs";

interface UseOutputExistenceReturn {
  ready: Platform[];
  loading: boolean;
}

export function useOutputExistence(projectId: string): UseOutputExistenceReturn {
  const [ready, setReady] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const outputsCol = collection(db, "projects", projectId, "outputs");

    const unsubscribe = onSnapshot(
      outputsCol,
      (snap) => {
        const platforms = snap.docs.map((d) => d.id as Platform);
        setReady(platforms);
        setLoading(false);
      },
      () => {
        // Not configured or permission error — show empty
        setReady([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { ready, loading };
}
