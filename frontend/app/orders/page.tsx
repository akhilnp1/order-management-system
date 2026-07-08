"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchOrders,
  updateOrderStatus,
  Order,
  OrderStatus,
} from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useOrdersSocket } from "@/lib/useOrdersSocket";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import OrderForm from "@/components/OrderForm";
import ConnectionIndicator from "@/components/ConnectionIndicator";

const STATUS_OPTIONS: OrderStatus[] = [
  "Pending",
  "Processing",
  "Completed",
  "Cancelled",
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [flashIds, setFlashIds] = useState<Set<number>>(new Set());

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders({
        page,
        page_size: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setOrders(data.items);
      setTotal(data.total);
      setError(null);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    loadOrders();
  }, [router, loadOrders]);

  const { connected } = useOrdersSocket((event) => {
    loadOrders();
    const id = event.order.id;
    setFlashIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1200);
  });

  async function handleStatusChange(orderId: number, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      setError("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
              Order Ledger
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
              Orders
            </h1>
          </div>
          <ConnectionIndicator connected={connected} />
        </div>

        <div className="mb-6">
          <OrderForm onCreated={loadOrders} />
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by customer name..."
            className="focus-ring w-full rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-faint/60 focus:border-signal sm:w-72"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value as OrderStatus | "");
            }}
            className="focus-ring rounded-xl border border-ink/15 bg-paper px-3.5 py-2.5 text-sm text-ink transition-colors focus:border-signal"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="mb-3 flex items-center gap-1.5 font-mono text-xs font-medium text-ink">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] text-paper">!</span>
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper">
          <table className="min-w-full divide-y divide-ink/8 text-sm">
            <thead className="bg-paper-soft">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">ID</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">Customer</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">Amount (INR)</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">Amount (USD)</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">Status</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">Created</th>
                <th className="px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-ink-faint">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-mono text-xs text-ink-faint">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center font-mono text-xs text-ink-faint">
                    No orders yet — create one above to get started.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`transition-colors duration-300 hover:bg-paper-soft ${
                      flashIds.has(order.id) ? "animate-flash-sweep" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint">#{order.id}</td>
                    <td className="px-4 py-3 font-medium text-ink">{order.customer_name}</td>
                    <td className="px-4 py-3 font-mono text-ink">
                      ₹{Number(order.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-ink-faint">
                      {order.amount_usd !== null
                        ? `$${Number(order.amount_usd).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-faint">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="focus-ring rounded-lg border border-ink/15 bg-paper-soft px-2 py-1 text-xs text-ink transition-colors focus:border-signal disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-xs text-ink-faint">
          <span>
            Page {page} of {totalPages} · {total} total orders
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="focus-ring rounded-lg border border-ink/15 px-3 py-1.5 text-ink transition-colors hover:border-signal disabled:opacity-30"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="focus-ring rounded-lg border border-ink/15 px-3 py-1.5 text-ink transition-colors hover:border-signal disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
