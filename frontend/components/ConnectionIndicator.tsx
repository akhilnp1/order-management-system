export default function ConnectionIndicator({ connected }: { connected: boolean }) {
  if (!connected) {
    return (
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-faint">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
        Reconnecting
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider text-signal-deep">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-signal" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
      </span>
      <span className="flex items-end gap-[2px] h-3">
        <span className="w-[2px] animate-bar-1 rounded-full bg-signal" style={{ minHeight: "2px" }} />
        <span className="w-[2px] animate-bar-2 rounded-full bg-signal" style={{ minHeight: "2px" }} />
        <span className="w-[2px] animate-bar-3 rounded-full bg-signal" style={{ minHeight: "2px" }} />
      </span>
      Live
    </div>
  );
}
