"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardPoller() {
  const router = useRouter();

  useEffect(() => {
    // Poll the server for fresh metrics every 15 seconds
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
