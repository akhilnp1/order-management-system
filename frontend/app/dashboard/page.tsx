"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchOrderSummary, OrderSummary } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useOrdersSocket } from "@/lib/useOrdersSocket";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import ConnectionIndicator from "@/components/ConnectionIndicator";

export default function DashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchOrderSummary();
      setSummary(data);
      setError(null);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    loadSummary();
  }, [router, loadSummary]);

  const { connected } = useOrdersSocket(() => {
    loadSummary();
  });

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Overview
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
              Dashboard
            </h1>
          </div>
          <ConnectionIndicator connected={connected} />
        </div>

        {loading && (
          <p className="font-mono text-sm text-ink-faint">Loading dashboard...</p>
        )}
        {error && <p className="font-mono text-sm text-ink">{error}</p>}

        {summary && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Orders" value={summary.total_orders} variant="dark" />
            <StatCard label="Pending" value={summary.status_summary.Pending ?? 0} />
            <StatCard label="Processing" value={summary.status_summary.Processing ?? 0} />
            <StatCard label="Completed" value={summary.status_summary.Completed ?? 0} />
            <StatCard label="Cancelled" value={summary.status_summary.Cancelled ?? 0} />
          </div>
        )}
      </main>
    </div>
  );
}
