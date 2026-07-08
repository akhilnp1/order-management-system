"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-signal" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-signal" />
      </span>
    </div>
  );
}
