"use server";

import { createClient } from "@/lib/supabase/server";
import { safeError, safeLog } from "@/utils/logger";
import { HiredWorker, HiredStats, EmploymentType, ContractStatus } from "@/types/employer/hired";

/**
 * Fetches hired workers list joined with worker profile attributes
 * and dynamically aggregates hiring metrics (active count, payroll, tenure)
 * on the server side.
 */
export async function getHiredData(): Promise<{
  workers: HiredWorker[];
  stats: HiredStats;
}> {
  const fallbackResult = {
    workers: [],
    stats: { totalActive: 0, monthlyPayroll: 0, averageTenure: 0 },
  };

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return fallbackResult;
    }

    // Verify role is employer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "employer") {
      return fallbackResult;
    }

    // Fetch contracts matching employer id joined with profile details
    const { data: contracts, error } = await supabase
      .from("contracts")
      .select(`
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
          last_name,
          avatar_url,
          professional_title
        )
      `)
      .eq("employer_id", profile.id);

    if (error) {
      safeError("Error fetching hired workers: [REDACTED_DB_ERROR]");
      return fallbackResult;
    }

    const workerList: HiredWorker[] = [];
    let totalActive = 0;
    let totalMonthlyPayroll = 0;
    let totalTenureMonths = 0;

    const now = new Date();

    for (const contract of contracts || []) {
      const worker = contract.profiles as any;
      if (!worker) continue;

      const name = `${worker.first_name || ""} ${worker.last_name || ""}`.trim() || "Worker";

      // Online status simulation matching same visual logic as pinning system
      const nameLower = name.toLowerCase();
      let online = true;
      if (nameLower.includes("marcus") || nameLower.includes("chen")) {
        online = false;
      }

      workerList.push({
        id: contract.id, // using contract id for key/actions
        name,
        avatarUrl: worker.avatar_url,
        role: worker.professional_title || "Developer",
        employmentType: contract.employment_type as EmploymentType,
        startDate: contract.start_date,
        hourlyRate: Number(contract.hourly_rate) || 0,
        weeklyHours: Number(contract.weekly_hours) || 0,
        status: contract.status as ContractStatus,
        online,
      });

      // Aggregate calculations for active contracts
      if (contract.status === "active") {
        totalActive++;
        // Monthly payroll = hourly_rate * weekly_hours * 4.3333 (weeks in month)
        const weeklyWage = (Number(contract.hourly_rate) || 0) * (Number(contract.weekly_hours) || 0);
        totalMonthlyPayroll += weeklyWage * 4.3333;

        // Calculate tenure in months
        const start = new Date(contract.start_date);
        const diffYears = now.getFullYear() - start.getFullYear();
        const diffMonths = now.getMonth() - start.getMonth();
        const ageInMonths = diffYears * 12 + diffMonths;
        totalTenureMonths += Math.max(0, ageInMonths);
      }
    }

    const averageTenure = totalActive > 0 ? Math.round(totalTenureMonths / totalActive) : 0;
    const monthlyPayroll = Math.round(totalMonthlyPayroll);

    safeLog(`[Hired] Fetched ${workerList.length} hired workers for employer ${profile.id}`);

    return {
      workers: workerList,
      stats: {
        totalActive,
        monthlyPayroll,
        averageTenure,
      },
    };
  } catch (err) {
    safeError("getHiredData exception: [REDACTED_DB_ERROR]");
    return fallbackResult;
  }
}
