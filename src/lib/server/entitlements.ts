import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";
import { safeError } from "@/utils/logger";

export type EntitlementDenialType =
  Database["public"]["Enums"]["entitlement_denial_type"];

export type BillingIdentityMode =
  Database["public"]["Enums"]["billing_identity_mode"];

export type BillingApprovalMode =
  Database["public"]["Enums"]["billing_approval_mode"];

export type EmployerEntitlements = {
  planSlug: string;
  displayName: string;
  price: number;
  activeJobsLimit: number | null;
  applicantsPerJobLimit: number | null;
  messagingEnabled: boolean;
  resumeDownloadEnabled: boolean;
  identityMode: BillingIdentityMode;
  approvalMode: BillingApprovalMode;
  priorityListing: boolean;
  prioritySupport: boolean;
  earlyAccess: boolean;
};

export type EmployerPlanUsage = {
  planSlug: string;
  displayName: string;
  activeJobsCount: number;
  activeJobsLimit: number | null;
  applicantsPerJobLimit: number | null;
  messagingEnabled: boolean;
  resumeDownloadEnabled: boolean;
  identityMode: BillingIdentityMode;
};

export type EntitlementCheckResult =
  | { allowed: true }
  | {
      allowed: false;
      error: string;
      denialType: EntitlementDenialType;
      suggestedPlan: string;
    };

const UPGRADE_PATH: Record<string, string> = {
  discovery: "starter",
  starter: "growth",
  growth: "scale",
  scale: "scale",
};

function parseEntitlementsJson(raw: Json | null): EmployerEntitlements | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }

  const row = raw as Record<string, unknown>;
  const planSlug = String(row.plan_slug ?? "discovery");

  return {
    planSlug,
    displayName: String(row.display_name ?? planSlug),
    price: Number(row.price ?? 0),
    activeJobsLimit:
      row.active_jobs_limit === null || row.active_jobs_limit === undefined
        ? null
        : Number(row.active_jobs_limit),
    applicantsPerJobLimit:
      row.applicants_per_job_limit === null ||
      row.applicants_per_job_limit === undefined
        ? null
        : Number(row.applicants_per_job_limit),
    messagingEnabled: Boolean(row.messaging_enabled),
    resumeDownloadEnabled: Boolean(row.resume_download_enabled),
    identityMode: (row.identity_mode as BillingIdentityMode) ?? "anonymous_preview",
    approvalMode: (row.approval_mode as BillingApprovalMode) ?? "queued_2d",
    priorityListing: Boolean(row.priority_listing),
    prioritySupport: Boolean(row.priority_support),
    earlyAccess: Boolean(row.early_access),
  };
}

export function suggestedUpgradeSlug(
  currentSlug: string,
  denialType?: EntitlementDenialType
): string {
  if (denialType === "messaging" || denialType === "resume" || denialType === "identity") {
    return currentSlug === "discovery" ? "starter" : UPGRADE_PATH[currentSlug] ?? "starter";
  }
  return UPGRADE_PATH[currentSlug] ?? "starter";
}

export function formatLimit(value: number | null): string {
  return value === null ? "Unlimited" : String(value);
}

export async function fetchEmployerEntitlements(
  employerId: string,
  supabase?: SupabaseClient<Database>
): Promise<EmployerEntitlements | null> {
  const client = supabase ?? (await createClient());

  const { data, error } = await client.rpc("get_employer_entitlements", {
    p_employer_id: employerId,
  });

  if (error) {
    safeError("fetchEmployerEntitlements:", error);
    return null;
  }

  return parseEntitlementsJson(data);
}

export async function employerHasFullIdentity(
  employerId: string,
  supabase?: SupabaseClient<Database>
): Promise<boolean> {
  const client = supabase ?? (await createClient());
  const { data, error } = await client.rpc("employer_has_full_identity", {
    p_employer_id: employerId,
  });

  if (error) {
    safeError("employerHasFullIdentity:", error);
    return false;
  }

  return Boolean(data);
}

export async function employerMessagingEnabled(
  employerId: string,
  supabase?: SupabaseClient<Database>
): Promise<boolean> {
  const client = supabase ?? (await createClient());
  const { data, error } = await client.rpc("employer_messaging_enabled", {
    p_employer_id: employerId,
  });

  if (error) {
    safeError("employerMessagingEnabled:", error);
    return false;
  }

  return Boolean(data);
}

export async function countActiveJobsForEmployer(
  supabase: SupabaseClient<Database>,
  employerId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", employerId)
    .in("status", ["Active", "Pending Review"]);

  if (error) {
    safeError("countActiveJobsForEmployer:", error);
    return 0;
  }

  return count ?? 0;
}

export async function countVisibleApplicantsForJob(
  supabase: SupabaseClient<Database>,
  jobId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .eq("is_within_plan_cap", true);

  if (error) {
    safeError("countVisibleApplicantsForJob:", error);
    return 0;
  }

  return count ?? 0;
}

export async function logEntitlementDenial(input: {
  employerId: string;
  denialType: EntitlementDenialType;
  resourceId?: string | null;
  planSlug?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = await createAdminClient();
    await admin.from("entitlement_denials").insert({
      employer_id: input.employerId,
      denial_type: input.denialType,
      resource_id: input.resourceId ?? null,
      plan_slug: input.planSlug ?? null,
      metadata: (input.metadata ?? {}) as Json,
    });
  } catch (err) {
    safeError("logEntitlementDenial:", err);
  }
}

export async function getEmployerPlanUsage(
  employerId: string
): Promise<EmployerPlanUsage | null> {
  const supabase = await createClient();
  const entitlements = await fetchEmployerEntitlements(employerId, supabase);

  if (!entitlements) {
    return null;
  }

  const activeJobsCount = await countActiveJobsForEmployer(supabase, employerId);

  return {
    planSlug: entitlements.planSlug,
    displayName: entitlements.displayName,
    activeJobsCount,
    activeJobsLimit: entitlements.activeJobsLimit,
    applicantsPerJobLimit: entitlements.applicantsPerJobLimit,
    messagingEnabled: entitlements.messagingEnabled,
    resumeDownloadEnabled: entitlements.resumeDownloadEnabled,
    identityMode: entitlements.identityMode,
  };
}

export async function assertEmployerCanPostJob(
  employerId: string,
  supabase: SupabaseClient<Database>
): Promise<EntitlementCheckResult> {
  const entitlements = await fetchEmployerEntitlements(employerId, supabase);

  if (!entitlements) {
    return { allowed: false, error: "Unable to load plan.", denialType: "job_limit", suggestedPlan: "starter" };
  }

  if (entitlements.activeJobsLimit === null) {
    return { allowed: true };
  }

  const activeJobs = await countActiveJobsForEmployer(supabase, employerId);

  if (activeJobs >= entitlements.activeJobsLimit) {
    const suggestedPlan = suggestedUpgradeSlug(entitlements.planSlug, "job_limit");
    await logEntitlementDenial({
      employerId,
      denialType: "job_limit",
      planSlug: entitlements.planSlug,
      metadata: {
        active_jobs: activeJobs,
        limit: entitlements.activeJobsLimit,
      },
    });

    return {
      allowed: false,
      error: `Active job limit reached (${entitlements.activeJobsLimit}). Upgrade to ${suggestedPlan} to post more jobs.`,
      denialType: "job_limit",
      suggestedPlan,
    };
  }

  return { allowed: true };
}

export async function resolveApplicantCapForJob(
  employerId: string,
  jobId: string,
  supabase: SupabaseClient<Database>
): Promise<{ withinCap: boolean; limit: number | null }> {
  const entitlements = await fetchEmployerEntitlements(employerId, supabase);

  if (!entitlements) {
    return { withinCap: true, limit: null };
  }

  if (entitlements.applicantsPerJobLimit === null) {
    return { withinCap: true, limit: null };
  }

  const count = await countVisibleApplicantsForJob(supabase, jobId);

  return {
    withinCap: count < entitlements.applicantsPerJobLimit,
    limit: entitlements.applicantsPerJobLimit,
  };
}

export async function assertEmployerMessaging(
  employerId: string
): Promise<EntitlementCheckResult> {
  const entitlements = await fetchEmployerEntitlements(employerId);

  if (!entitlements?.messagingEnabled) {
    const planSlug = entitlements?.planSlug ?? "discovery";
    const suggestedPlan = suggestedUpgradeSlug(planSlug, "messaging");
    await logEntitlementDenial({
      employerId,
      denialType: "messaging",
      planSlug,
    });

    return {
      allowed: false,
      error: `Messaging requires the ${suggestedPlan} plan or higher.`,
      denialType: "messaging",
      suggestedPlan,
    };
  }

  return { allowed: true };
}

export async function assertEmployerFullIdentity(
  employerId: string
): Promise<EntitlementCheckResult> {
  const entitlements = await fetchEmployerEntitlements(employerId);

  if (entitlements?.identityMode !== "full") {
    const planSlug = entitlements?.planSlug ?? "discovery";
    const suggestedPlan = suggestedUpgradeSlug(planSlug, "identity");
    await logEntitlementDenial({
      employerId,
      denialType: "identity",
      planSlug,
    });

    return {
      allowed: false,
      error: `Full candidate profiles require the ${suggestedPlan} plan or higher.`,
      denialType: "identity",
      suggestedPlan,
    };
  }

  return { allowed: true };
}

export async function assertEmployerResumeDownload(
  employerId: string
): Promise<EntitlementCheckResult> {
  const entitlements = await fetchEmployerEntitlements(employerId);

  if (!entitlements?.resumeDownloadEnabled) {
    const planSlug = entitlements?.planSlug ?? "discovery";
    const suggestedPlan = suggestedUpgradeSlug(planSlug, "resume");
    await logEntitlementDenial({
      employerId,
      denialType: "resume",
      planSlug,
    });

    return {
      allowed: false,
      error: `Resume downloads require the ${suggestedPlan} plan or higher.`,
      denialType: "resume",
      suggestedPlan,
    };
  }

  return { allowed: true };
}

export async function assertEmployerCanReview(
  employerId: string
): Promise<EntitlementCheckResult> {
  const entitlements = await fetchEmployerEntitlements(employerId);

  if (entitlements?.planSlug === "discovery") {
    await logEntitlementDenial({
      employerId,
      denialType: "identity",
      planSlug: "discovery",
      metadata: { feature: "employer_review" },
    });

    return {
      allowed: false,
      error: "Upgrade to Starter or above to post employer reviews.",
      denialType: "identity",
      suggestedPlan: "starter",
    };
  }

  return { allowed: true };
}

export async function assertEmployerCanPinWorker(
  employerId: string
): Promise<EntitlementCheckResult> {
  const entitlements = await fetchEmployerEntitlements(employerId);

  if (entitlements?.planSlug === "discovery") {
    return {
      allowed: false,
      error: "Pinning workers is limited on Discovery. Upgrade to Starter to bookmark talent.",
      denialType: "identity",
      suggestedPlan: "starter",
    };
  }

  return { allowed: true };
}

export type ApplicantPreviewPayload = {
  application_id: string;
  job_id: string;
  status: string;
  match_score: number | null;
  identity_mode: BillingIdentityMode;
  candidate: Record<string, unknown>;
  snapshot?: unknown;
};

export async function fetchApplicantPreview(
  supabase: SupabaseClient<Database>,
  applicationId: string,
  employerId: string
): Promise<ApplicantPreviewPayload | null> {
  const { data, error } = await supabase.rpc("get_applicant_preview", {
    p_application_id: applicationId,
    p_employer_id: employerId,
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    if (error) safeError("fetchApplicantPreview:", error);
    return null;
  }

  const row = data as Record<string, unknown>;
  const candidate =
    row.candidate && typeof row.candidate === "object" && !Array.isArray(row.candidate)
      ? (row.candidate as Record<string, unknown>)
      : {};

  return {
    application_id: String(row.application_id),
    job_id: String(row.job_id),
    status: String(row.status ?? "PENDING"),
    match_score:
      row.match_score === null || row.match_score === undefined
        ? null
        : Number(row.match_score),
    identity_mode:
      row.identity_mode === "full" ? "full" : "anonymous_preview",
    candidate,
    snapshot: row.snapshot,
  };
}

export function jobStatusForApprovalMode(
  approvalMode: BillingApprovalMode,
  intent?: "standard" | "premium"
): "Active" | "Pending Review" {
  if (approvalMode === "instant" || intent === "premium") {
    return "Active";
  }
  return "Pending Review";
}

export function priorityScoreForPlan(entitlements: EmployerEntitlements): number {
  return entitlements.priorityListing ? 100 : 0;
}
