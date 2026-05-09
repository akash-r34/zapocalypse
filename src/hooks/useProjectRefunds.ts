"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

export interface RefundLogEntry {
  id: string;
  platform: string;
  amount: number;
  reason: "synthesis_failed" | "regen_failed";
  attempt: number;
  agentNames: string[];
  createdAt: Date | null;
}

interface UseProjectRefundsReturn {
  refunds: RefundLogEntry[];
  totalRefunded: number;
  loading: boolean;
}

export function useProjectRefunds(projectId: string): UseProjectRefundsReturn {
  const [refunds, setRefunds] = useState<RefundLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(
      collection(db, "projects", projectId, "refund_log"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const entries: RefundLogEntry[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            platform: (data.platform as string) ?? "unknown",
            amount: (data.amount as number) ?? 0,
            reason: (data.reason as RefundLogEntry["reason"]) ?? "synthesis_failed",
            attempt: (data.attempt as number) ?? 0,
            agentNames: Array.isArray(data.agentNames) ? (data.agentNames as string[]) : [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        });
        setRefunds(entries);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId]);

  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);

  return { refunds, totalRefunded, loading };
}
