"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

export interface CostLogEntry {
  agentName: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  costUsd: number;
  timestamp: Date | null;
  /** Set when this cost entry belongs to a selective regen cascade for a specific platform. */
  regenPlatform?: string;
}

interface UseProjectCostReturn {
  costLog: CostLogEntry[];
  totalCost: number;
  loading: boolean;
  error: string | null;
}

export function useProjectCost(projectId: string): UseProjectCostReturn {
  const [costLog, setCostLog] = useState<CostLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(
      collection(db, "projects", projectId, "cost_log"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const entries: CostLogEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            agentName: (data.agentName as string) ?? "unknown",
            model: (data.model as string) ?? "unknown",
            promptTokens: (data.promptTokens as number) ?? 0,
            outputTokens: (data.outputTokens as number) ?? 0,
            costUsd: (data.costUsd as number) ?? 0,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : null,
            regenPlatform: typeof data.regenPlatform === "string" ? data.regenPlatform : undefined,
          };
        });
        setCostLog(entries);
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

  const totalCost = costLog.reduce((sum, entry) => sum + entry.costUsd, 0);

  return { costLog, totalCost, loading, error };
}
