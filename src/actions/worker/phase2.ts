"use server";

import { requireWorker } from "@/lib/server/auth/worker";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
} from "@/lib/server/redis-cache";

export async function getWorkerEarnings() {
  const ctx = await requireWorker();
  if (!ctx) return [];

  return getOrSet(
    CacheKeys.workerEarnings(ctx.profile.id),
    CACHE_TTL_SECONDS.workerEarnings,
    async () => {
      const { data } = await ctx.supabase
        .from("earnings_overview")
        .select("id, month_name, amount, is_highlighted")
        .eq("worker_id", ctx.profile.id)
        .order("created_at", { ascending: true });

      return data ?? [];
    }
  );
}
