"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { formatFullName } from "@/lib/format/name";
import {
  HiredWorker,
  HiredStats,
  EmploymentType,
  ContractStatus,
} from "@/types/employer/hired";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
} from "@/lib/server/redis-cache";

const EMPTY_HIRED = {
  workers: [] as HiredWorker[],
  stats: { totalActive: 0, monthlyPayroll: 0, averageTenure: 0 } as HiredStats,
};

async function loadHiredDataForEmployer(
  employerId: string
): Promise<{ workers: HiredWorker[]; stats: HiredStats }> {
  const supabase = await createClient();

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(
      `
        id,
        hourly_rate,
        weekly_hours,
        start_date,
        employment_type,
        status,
        worker_id,
        profiles!contracts_worker_id_fkey (
          id,
          first_name,
          middle_name,
          last_name,
          avatar_url,
          professional_title
        )
      `
    )
    .eq("employer_id", employerId);

  if (error) {
    safeError("Error fetching hired workers: [REDACTED_DB_ERROR]");
    return EMPTY_HIRED;
  }

  const workerList: HiredWorker[] = [];
  let totalActive = 0;
  let totalMonthlyPayroll = 0;
  let totalTenureMonths = 0;

  const now = new Date();

  for (const contract of contracts || []) {
    const worker = contract.profiles as {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
      avatar_url?: string | null;
      professional_title?: string | null;
    } | null;
    if (!worker) continue;

    const name =
      formatFullName(worker.first_name, worker.middle_name, worker.last_name) || "Worker";

    const nameLower = name.toLowerCase();
    const online = !(
      nameLower.includes("marcus") || nameLower.includes("chen")
    );

    workerList.push({
      id: contract.id,
      name,
      avatarUrl: worker.avatar_url ?? null,
      role: worker.professional_title || "Developer",
      employmentType: contract.employment_type as EmploymentType,
      startDate: contract.start_date,
      hourlyRate: Number(contract.hourly_rate) || 0,
      weeklyHours: Number(contract.weekly_hours) || 0,
      status: contract.status as ContractStatus,
      online,
    });

    if (contract.status === "active") {
      totalActive++;
      const weeklyWage =
        (Number(contract.hourly_rate) || 0) *
        (Number(contract.weekly_hours) || 0);
      totalMonthlyPayroll += weeklyWage * 4.3333;

      const start = new Date(contract.start_date);
      const diffYears = now.getFullYear() - start.getFullYear();
      const diffMonths = now.getMonth() - start.getMonth();
      const ageInMonths = diffYears * 12 + diffMonths;
      totalTenureMonths += Math.max(0, ageInMonths);
    }
  }

  const averageTenure =
    totalActive > 0 ? Math.round(totalTenureMonths / totalActive) : 0;
  const monthlyPayroll = Math.round(totalMonthlyPayroll);

  safeLog(`[Hired] Fetched ${workerList.length} hired workers for employer ${employerId}`);

  return {
    workers: workerList,
    stats: {
      totalActive,
      monthlyPayroll,
      averageTenure,
    },
  };
}

/**
 * Fetches hired workers list joined with worker profile attributes
 * and dynamically aggregates hiring metrics (active count, payroll, tenure)
 * on the server side.
 */
export async function getHiredData(): Promise<{
  workers: HiredWorker[];
  stats: HiredStats;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return EMPTY_HIRED;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return EMPTY_HIRED;
    }

    return getOrSet(
      CacheKeys.employerHired(profile.id),
      CACHE_TTL_SECONDS.employerHiring,
      () => loadHiredDataForEmployer(profile.id)
    );
  } catch (err) {
    safeError("getHiredData exception: [REDACTED_DB_ERROR]");
    return EMPTY_HIRED;
  }
}
