"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";

export function AnalyticsPage() {
  const data = useQuery(api.huntAnalytics.getHuntCountsByState);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-30 base-pattern"
        aria-hidden
      />

      <LynxHeader subtitle="Analytics" activePage="analytics" />

      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold text-foreground uppercase tracking-tight mb-4">
          Hunt analytics
        </h2>

        {data === undefined ? (
          <p className="text-primary">Loading…</p>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Total hunts started: <strong className="text-foreground">{data.total}</strong>
            </p>

            {data.byState.length === 0 ? (
              <p className="text-muted-foreground">No hunt starts recorded yet.</p>
            ) : (
              <div className="border-2 border-accent rounded-md overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b-2 border-accent">
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-foreground">
                        State
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wide text-foreground">
                        Hunts started
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byState.map(({ state, count }) => (
                      <tr
                        key={state}
                        className="border-b border-accent/40 last:border-b-0 hover:bg-accent/10"
                      >
                        <td className="px-4 py-3 text-foreground">{state}</td>
                        <td className="px-4 py-3 text-foreground">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
