"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(username, password);
      saveToken(data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
      {/* ambient signal glow */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-signal/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-signal/10 blur-[100px]" />

      <div className="relative w-full max-w-sm animate-rise-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-signal" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-signal" />
            </span>
            <span className="font-display text-2xl font-semibold tracking-tight text-paper">
              Order<span className="text-signal">Signal</span>
            </span>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-paper/40">
            Real-time order management
          </p>
        </div>

        <div className="rounded-2xl border border-paper/10 bg-ink-soft p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-paper/50">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus-ring w-full rounded-xl border border-paper/15 bg-ink px-3.5 py-2.5 text-sm text-paper transition-colors focus:border-signal"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-paper/50">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-xl border border-paper/15 bg-ink px-3.5 py-2.5 text-sm text-paper transition-colors focus:border-signal"
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 font-mono text-xs font-medium text-paper">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-paper text-[10px] text-ink">!</span>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="focus-ring mt-2 rounded-xl bg-signal py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-signal-bright disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <p className="mt-5 text-center font-mono text-[11px] text-paper/30">
          demo — admin / admin123
        </p>
      </div>
    </div>
  );
}
