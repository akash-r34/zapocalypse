"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getClientFirestore } from "@/src/lib/firebase/client";
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis } from "recharts";

interface DaySpend {
  day: string;
  cost: number;
}

interface SpendChartProps {
  projectIds: string[];
}

export function SpendChart({ projectIds }: SpendChartProps) {
  const [data, setData] = useState<DaySpend[]>([]);
  const [loading, setLoading] = useState(projectIds.length > 0);

  useEffect(() => {
    if (projectIds.length === 0) return;

    const db = getClientFirestore();
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Query each project's cost_log subcollection individually — no collection group index needed
    const queries = projectIds.map((id) =>
      getDocs(
        query(
          collection(db, "projects", id, "cost_log"),
          where("timestamp", ">=", startOfMonth)
        )
      )
    );

    Promise.allSettled(queries)
      .then((results) => {
        const byDay: Record<string, number> = {};

        results.forEach((result) => {
          if (result.status !== "fulfilled") return;
          result.value.docs.forEach((d) => {
            const raw = d.data();
            const ts = raw.timestamp;
            if (!ts?.toDate) return;
            const date = ts.toDate() as Date;
            const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            byDay[key] = (byDay[key] ?? 0) + ((raw.costUsd as number) ?? 0);
          });
        });

        const today = new Date();
        const days: DaySpend[] = [];
        for (let d = 1; d <= today.getDate(); d++) {
          const key = new Date(today.getFullYear(), today.getMonth(), d).toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          );
          days.push({ day: key, cost: byDay[key] ?? 0 });
        }

        setData(days);
        setLoading(false);
      });
  }, [projectIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return null;

  const hasData = data.some((d) => d.cost > 0);
  if (!hasData) return null;

  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs text-[var(--glass-text-secondary)]">Daily spend this month</p>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" hide />
            <Tooltip
              contentStyle={{
                background: "var(--glass-bg-secondary)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                fontSize: "11px",
                color: "var(--glass-text)",
              }}
              formatter={(value) => [`$${(Number(value) || 0).toFixed(4)}`, "Cost"]}
              labelStyle={{ color: "var(--glass-text-secondary)" }}
            />
            <Bar dataKey="cost" fill="var(--glass-accent-muted)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
