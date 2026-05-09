"use client";

import { useEffect, useState } from "react";
import { doc, collection, onSnapshot, type DocumentData } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

interface UseC2PAManifestReturn {
  data: DocumentData | null;
  loading: boolean;
}

export function useC2PAManifest(projectId: string, platform: string): UseC2PAManifestReturn {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = doc(db, "projects", projectId, "c2pa", platform);

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
  }, [projectId, platform]);

  return { data, loading };
}

interface UseC2PAManifestsReturn {
  manifests: Record<string, DocumentData>;
  loading: boolean;
}

export function useC2PAManifests(projectId: string): UseC2PAManifestsReturn {
  const [manifests, setManifests] = useState<Record<string, DocumentData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = collection(db, "projects", projectId, "c2pa");

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        const result: Record<string, DocumentData> = {};
        snap.docs.forEach((d) => {
          result[d.id] = d.data();
        });
        setManifests(result);
        setLoading(false);
      },
      () => {
        setManifests({});
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  return { manifests, loading };
}
