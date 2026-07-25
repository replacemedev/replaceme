import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type AccountClosureBlockers = {
  hasActiveContracts: boolean;
  hasOpenApplications: boolean;
  hasOpenJobs: boolean;
  hasUnpaidBilling: boolean;
  legalHold: boolean;
  activeContractCount: number;
  openApplicationCount: number;
  openJobCount: number;
  canProceedWithoutForce: boolean;
  messages: string[];
};

const OPEN_APPLICATION_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
] as const;

type AdminClient = SupabaseClient<Database>;

/**
 * Upwork-style pre-closure checklist for worker/employer accounts.
 */
export async function getAccountClosureBlockers(
  admin: AdminClient,
  userId: string
): Promise<AccountClosureBlockers> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, legal_hold")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    return {
      hasActiveContracts: false,
      hasOpenApplications: false,
      hasOpenJobs: false,
      hasUnpaidBilling: false,
      legalHold: false,
      activeContractCount: 0,
      openApplicationCount: 0,
      openJobCount: 0,
      canProceedWithoutForce: false,
      messages: ["Account not found."],
    };
  }

  const legalHold = Boolean(profile.legal_hold);
  const messages: string[] = [];

  const contractFilter =
    profile.role === "worker"
      ? { column: "worker_id" as const, value: userId }
      : { column: "employer_id" as const, value: userId };

  const { count: activeContractCount } = await admin
    .from("contracts")
    .select("id", { count: "exact", head: true })
    .eq(contractFilter.column, contractFilter.value)
    .in("status", ["active", "paused", "offered"]);

  const contractCount = activeContractCount ?? 0;
  const hasActiveContracts = contractCount > 0;
  if (hasActiveContracts) {
    messages.push(
      `${contractCount} active or open contract(s) must be ended before deletion.`
    );
  }

  let openApplicationCount = 0;
  let hasOpenApplications = false;
  if (profile.role === "worker") {
    const { count } = await admin
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("candidate_id", userId)
      .in("status", [...OPEN_APPLICATION_STATUSES]);
    openApplicationCount = count ?? 0;
    hasOpenApplications = openApplicationCount > 0;
    if (hasOpenApplications) {
      messages.push(
        `${openApplicationCount} open application(s) should be withdrawn.`
      );
    }
  }

  let openJobCount = 0;
  let hasOpenJobs = false;
  let hasUnpaidBilling = false;

  if (profile.role === "employer") {
    const { count } = await admin
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", userId)
      .in("status", ["Active", "Pending Review"]);
    openJobCount = count ?? 0;
    hasOpenJobs = openJobCount > 0;
    if (hasOpenJobs) {
      messages.push(
        `${openJobCount} Active or Pending job post(s) must be closed.`
      );
    }

    const { data: sub } = await admin
      .from("employer_subscriptions")
      .select("status, last_payment_status, failed_payment_count")
      .eq("employer_id", userId)
      .maybeSingle();

    const unpaidStatuses = new Set(["past_due", "unpaid"]);
    hasUnpaidBilling = Boolean(
      (sub?.status && unpaidStatuses.has(sub.status)) ||
        sub?.last_payment_status === "failed" ||
        (sub?.failed_payment_count ?? 0) > 0
    );
    if (hasUnpaidBilling) {
      messages.push("Outstanding or failed billing must be settled.");
    }
  }

  if (legalHold) {
    messages.push(
      "Legal hold is active — deletion is blocked until the hold is cleared."
    );
  }

  const canProceedWithoutForce =
    !legalHold &&
    !hasActiveContracts &&
    !hasOpenApplications &&
    !hasOpenJobs &&
    !hasUnpaidBilling;

  return {
    hasActiveContracts,
    hasOpenApplications,
    hasOpenJobs,
    hasUnpaidBilling,
    legalHold,
    activeContractCount: contractCount,
    openApplicationCount,
    openJobCount,
    canProceedWithoutForce,
    messages,
  };
}
