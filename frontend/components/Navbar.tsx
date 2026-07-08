"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (href: string) =>
    `relative rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors duration-200 ${
      pathname === href
        ? "bg-signal text-ink"
        : "text-paper/70 hover:text-paper"
    }`;

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-paper/10 bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-signal" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-signal" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-paper">
            Order<span className="text-signal">Signal</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link href="/orders" className={linkClass("/orders")}>
            Orders
          </Link>
          <button
            onClick={handleLogout}
            className="focus-ring ml-2 rounded-full px-4 py-1.5 font-body text-sm font-medium text-paper/50 transition-colors duration-200 hover:text-paper"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
