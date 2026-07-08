import AnimatedNumber from "@/components/AnimatedNumber";

export default function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: number;
  variant?: "default" | "dark";
}) {
  const isDark = variant === "dark";
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
        isDark
          ? "border-ink bg-ink text-paper hover:shadow-[0_8px_30px_rgba(11,15,13,0.25)]"
          : "border-ink/10 bg-paper text-ink hover:border-signal/30 hover:shadow-[0_8px_30px_rgba(22,163,74,0.12)]"
      }`}
    >
      <div
        className={`absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl transition-opacity duration-300 ${
          isDark ? "bg-signal/30 opacity-60" : "bg-signal/20 opacity-0 group-hover:opacity-100"
        }`}
      />
      <p
        className={`font-mono text-[11px] uppercase tracking-wider ${
          isDark ? "text-paper/60" : "text-ink-faint"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
        <AnimatedNumber value={value} />
      </p>
    </div>
  );
}
