"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

interface UseMonthlyRefundsReturn {
  refundedTotal: number;
  loading: boolean;
}

export function useMonthlyRefunds(): UseMonthlyRefundsReturn {
  const [refundedTotal, setRefundedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "projects"),
      where("refunded", "==", true),
      where("updatedAt", ">=", startOfMonth)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const total = snap.docs.reduce((sum, d) => {
          const amount = d.data().refundedAmount;
          return sum + (typeof amount === "number" ? amount : 0);
        }, 0);
        setRefundedTotal(total);
        setLoading(false);
      },
      () => {
        // Index may not exist yet — show zero
        setRefundedTotal(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { refundedTotal, loading };
}
