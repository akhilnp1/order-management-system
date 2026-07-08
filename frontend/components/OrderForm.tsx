"use client";

import { useState } from "react";
import { createOrder } from "@/lib/api";

export default function OrderForm({ onCreated }: { onCreated: () => void }) {
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({ customer_name: customerName.trim(), amount: parsedAmount });
      setCustomerName("");
      setAmount("");
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper p-5 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Customer Name
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. John Doe"
          className="focus-ring w-full rounded-xl border border-ink/15 bg-paper-soft px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-faint/60 focus:border-signal"
        />
      </div>
      <div className="sm:w-40">
        <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Amount (INR)
        </label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="500"
          type="number"
          min="0"
          step="0.01"
          className="focus-ring w-full rounded-xl border border-ink/15 bg-paper-soft px-3.5 py-2.5 font-mono text-sm text-ink transition-colors placeholder:text-ink-faint/60 focus:border-signal"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="focus-ring group relative overflow-hidden rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-all duration-200 hover:bg-signal-deep disabled:opacity-50"
      >
        <span className="relative">{submitting ? "Creating..." : "Create Order"}</span>
      </button>
      {error && (
        <p className="flex items-center gap-1.5 font-mono text-xs font-medium text-ink sm:ml-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] text-paper">!</span>
          {error}
        </p>
      )}
    </form>
  );
}
