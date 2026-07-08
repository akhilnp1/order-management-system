import { OrderStatus } from "@/lib/api";

const CONFIG: Record<OrderStatus, { classes: string; dot: string; pulse: boolean }> = {
  Pending: {
    classes: "border-ink/25 bg-transparent text-ink",
    dot: "bg-ink",
    pulse: false,
  },
  Processing: {
    classes: "border-signal/30 bg-signal-soft text-signal-deep",
    dot: "bg-signal",
    pulse: true,
  },
  Completed: {
    classes: "border-ink bg-ink text-signal-bright",
    dot: "bg-signal-bright",
    pulse: false,
  },
  Cancelled: {
    classes: "border-ink/10 bg-ink/5 text-ink-faint line-through decoration-1",
    dot: "bg-ink-faint",
    pulse: false,
  },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${cfg.classes}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {cfg.pulse && (
          <span className={`absolute inline-flex h-full w-full animate-pulse-ring rounded-full ${cfg.dot}`} />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      </span>
      {status}
    </span>
  );
}
