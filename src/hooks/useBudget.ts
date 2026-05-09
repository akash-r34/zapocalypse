"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";

export interface BudgetState {
  spent: number;
  limit: number;
  killSwitch: boolean;
  budgetMonth: string;
}

interface UseBudgetReturn {
  budget: BudgetState | null;
  loading: boolean;
}

const FALLBACK: BudgetState = { spent: 0, limit: 100, killSwitch: false, budgetMonth: "" };

export function useBudget(): UseBudgetReturn {
  const [budget, setBudget] = useState<BudgetState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = doc(db, "budget", "current");

    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setBudget(FALLBACK);
        } else {
          const d = snap.data();
          setBudget({
            spent: (d.spent as number) ?? 0,
            limit: (d.limit as number) ?? 100,
            killSwitch: (d.killSwitch as boolean) ?? false,
            budgetMonth: (d.budgetMonth as string) ?? "",
          });
        }
        setLoading(false);
      },
      () => {
        // Firestore not configured yet — show placeholder
        setBudget(FALLBACK);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { budget, loading };
}
