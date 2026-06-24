"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin/verify-admin";
import { createAdminClient } from "@/lib/supabase/server";
import {
  EMPTY_PLATFORM_METRICS,
  moderateJobSchema,
  platformMetricsSchema,
  reviewVerificationSchema,
  suspendUserSchema,
  type AdminAuditLogRow,
  type AdminEmployerRow,
  type AdminJobRow,
  type AdminSubscriptionRow,
  type AdminVerificationDocument,
  type AdminVerificationQueueRow,
  type AdminWorkerRow,
  type PlatformMetrics,
} from "@/types/admin.types";

const ADMIN_PATHS = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/jobs",
  "/admin/identity",
  "/admin/revenue",
  "/admin/audit-log",
] as const;

async function getClientIp(): Promise<string | null> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null
  );
}

function revalidateAdminSurfaces() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
}

export async function logAdminAction(
  actionType: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const { supabase, user } = await verifyAdmin();
  const ip = await getClientIp();

  const { error } = await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action_type: actionType,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata: metadata ?? {},
    ip_address: ip,
  });

  if (error) throw new Error(`Failed to log admin action: ${error.message}`);
}

type ActionResult = { success: true } | { success: false; error: string };

export async function suspendUser(
  userId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const parsed = suspendUserSchema.parse({ userId, reason });
    const { supabase } = await verifyAdmin();

    const { error } = await supabase
      .from("profiles")
      .update({ account_status: "suspended" })
      .eq("id", parsed.userId);

    if (error) throw new Error(error.message);

    const adminClient = await createAdminClient();
    await adminClient.auth.admin.updateUserById(parsed.userId, {
      ban_duration: "876000h",
    });

    await logAdminAction("suspend_user", "profile", parsed.userId, {
      reason: parsed.reason,
    });
    revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to suspend user",
    };
  }
}

export async function unsuspendUser(userId: string): Promise<ActionResult> {
  try {
    const id = z.string().uuid().parse(userId);
    const { supabase } = await verifyAdmin();

    const { error } = await supabase
      .from("profiles")
      .update({ account_status: "active" })
      .eq("id", id);

    if (error) throw new Error(error.message);

    const adminClient = await createAdminClient();
    await adminClient.auth.admin.updateUserById(id, { ban_duration: "none" });

    await logAdminAction("unsuspend_user", "profile", id);
    revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unsuspend user",
    };
  }
}

export async function approveJobPost(jobId: string): Promise<ActionResult> {
  try {
    const id = moderateJobSchema.shape.jobId.parse(jobId);
    const { supabase } = await verifyAdmin();

    const { error } = await supabase
      .from("jobs")
      .update({ status: "Active" })
      .eq("id", id);

    if (error) throw new Error(error.message);

    await logAdminAction("approve_job", "job", id);
    revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to approve job",
    };
  }
}

export async function rejectJobPost(
  jobId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const parsed = moderateJobSchema.parse({ jobId, reason });
    const { supabase } = await verifyAdmin();

    const { error } = await supabase
      .from("jobs")
      .update({ status: "Closed" })
      .eq("id", parsed.jobId);

    if (error) throw new Error(error.message);

    await logAdminAction("reject_job", "job", parsed.jobId, {
      reason: parsed.reason,
    });
    revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reject job",
    };
  }
}

export async function deleteJobPost(
  jobId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const parsed = moderateJobSchema.parse({ jobId, reason });
    const { supabase } = await verifyAdmin();

    const { error } = await supabase.from("jobs").delete().eq("id", parsed.jobId);

    if (error) throw new Error(error.message);

    await logAdminAction("delete_job_post", "job", parsed.jobId, {
      reason: parsed.reason,
    });
    revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete job",
    };
  }
}

export async function reviewWorkerVerification(
  workerId: string,
  decision: "approved" | "rejected",
  reason?: string
): Promise<ActionResult> {
  try {
    const parsed = reviewVerificationSchema.parse({ workerId, decision, reason });
    const { supabase } = await verifyAdmin();

    const nextStatus =
      parsed.decision === "approved" ? "approved" : "rejected";

    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: nextStatus })
      .eq("id", parsed.workerId)
      .eq("role", "worker");

    if (error) throw new Error(error.message);

    await logAdminAction(
      parsed.decision === "approved"
        ? "approve_verification"
        : "reject_verification",
      "profile",
      parsed.workerId,
      parsed.reason ? { reason: parsed.reason } : {}
    );
    revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update verification",
    };
  }
}

export async function fetchDashboardMetrics(): Promise<PlatformMetrics> {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase.rpc("get_platform_metrics");

  if (error) {
    throw new Error(`Failed to fetch platform metrics: ${error.message}`);
  }

  const parsed = platformMetricsSchema.safeParse(data);
  return parsed.success ? parsed.data : EMPTY_PLATFORM_METRICS;
}

export async function fetchRecentAuditLogs(limit = 10) {
  const { supabase } = await verifyAdmin();

  const { data } = await supabase
    .from("audit_logs")
    .select("id, action_type, target_type, target_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function fetchAdminWorkers(): Promise<AdminWorkerRow[]> {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, professional_title, account_status, verification_status, is_verified, created_at"
    )
    .eq("role", "worker")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminWorkerRow[];
}

export async function fetchAdminEmployers(): Promise<AdminEmployerRow[]> {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("company_profiles")
    .select(
      `
      id,
      employer_id,
      company_name,
      industry,
      created_at,
      profiles:employer_id (
        email,
        account_status
      ),
      employer_subscriptions (
        status
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const subscription = Array.isArray(row.employer_subscriptions)
      ? row.employer_subscriptions[0]
      : row.employer_subscriptions;

    return {
      id: row.id,
      employer_id: row.employer_id,
      company_name: row.company_name,
      email: profile?.email ?? null,
      industry: row.industry,
      account_status: (profile?.account_status ?? "active") as AdminEmployerRow["account_status"],
      subscription_status: subscription?.status ?? null,
      created_at: row.created_at,
    };
  });
}

export async function fetchAdminJobs(
  status?: string
): Promise<AdminJobRow[]> {
  const { supabase } = await verifyAdmin();

  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      status,
      employment_type,
      monthly_salary,
      employer_id,
      created_at,
      profiles:employer_id (
        company_profiles (
          company_name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const companyProfiles = profile?.company_profiles;
    const company = Array.isArray(companyProfiles)
      ? companyProfiles[0]
      : companyProfiles;

    return {
      id: row.id,
      title: row.title,
      status: row.status,
      employment_type: row.employment_type,
      monthly_salary: row.monthly_salary,
      employer_id: row.employer_id,
      company_name: company?.company_name ?? null,
      created_at: row.created_at,
    };
  });
}

export async function fetchVerificationQueue(): Promise<
  AdminVerificationQueueRow[]
> {
  const { supabase } = await verifyAdmin();

  const { data: workers, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, verification_status, created_at")
    .eq("role", "worker")
    .in("verification_status", ["documents_submitted", "under_review"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const workerIds = (workers ?? []).map((w) => w.id);
  if (workerIds.length === 0) return [];

  const { data: docs } = await supabase
    .from("verification_documents")
    .select("worker_id")
    .in("worker_id", workerIds);

  const counts = new Map<string, number>();
  for (const doc of docs ?? []) {
    counts.set(doc.worker_id, (counts.get(doc.worker_id) ?? 0) + 1);
  }

  return (workers ?? []).map((w) => ({
    ...w,
    document_count: counts.get(w.id) ?? 0,
  })) as AdminVerificationQueueRow[];
}

export async function fetchWorkerVerificationDocuments(
  workerId: string
): Promise<AdminVerificationDocument[]> {
  const id = z.string().uuid().parse(workerId);
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("verification_documents")
    .select("id, document_type, file_name, mime_type, storage_path, created_at")
    .eq("worker_id", id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const results: AdminVerificationDocument[] = [];
  for (const doc of data ?? []) {
    const { data: signed } = await supabase.storage
      .from("verification-documents")
      .createSignedUrl(doc.storage_path, 300);

    results.push({
      id: doc.id,
      document_type: doc.document_type,
      file_name: doc.file_name,
      mime_type: doc.mime_type,
      signed_url: signed?.signedUrl ?? null,
      created_at: doc.created_at,
    });
  }

  return results;
}

export async function fetchAdminSubscriptions(): Promise<
  AdminSubscriptionRow[]
> {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("employer_subscriptions")
    .select(
      `
      id,
      employer_id,
      status,
      stripe_customer_id,
      stripe_subscription_id,
      current_period_end,
      job_posts_used,
      unlocks_used,
      created_at,
      billing_plans (
        name,
        price
      ),
      profiles:employer_id (
        email,
        company_profiles (
          company_name
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const plan = Array.isArray(row.billing_plans)
      ? row.billing_plans[0]
      : row.billing_plans;
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const companyProfiles = profile?.company_profiles;
    const company = Array.isArray(companyProfiles)
      ? companyProfiles[0]
      : companyProfiles;

    return {
      id: row.id,
      employer_id: row.employer_id,
      company_name: company?.company_name ?? null,
      employer_email: profile?.email ?? null,
      plan_name: plan?.name ?? null,
      plan_price: plan?.price ?? null,
      status: row.status,
      stripe_customer_id: row.stripe_customer_id,
      stripe_subscription_id: row.stripe_subscription_id,
      current_period_end: row.current_period_end,
      job_posts_used: row.job_posts_used,
      unlocks_used: row.unlocks_used,
      created_at: row.created_at,
    };
  });
}

export async function fetchAuditLogs(limit = 100): Promise<AdminAuditLogRow[]> {
  const { supabase } = await verifyAdmin();

  const { data, error } = await supabase
    .from("audit_logs")
    .select(
      "id, action_type, target_type, target_id, metadata, ip_address, created_at, admin_id"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const adminIds = [...new Set((data ?? []).map((r) => r.admin_id))];
  const emailById = new Map<string, string>();

  if (adminIds.length > 0) {
    const { data: admins } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", adminIds);

    for (const admin of admins ?? []) {
      if (admin.email) emailById.set(admin.id, admin.email);
    }
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    action_type: row.action_type,
    target_type: row.target_type,
    target_id: row.target_id,
    metadata: row.metadata as Record<string, unknown> | null,
    ip_address: row.ip_address,
    created_at: row.created_at,
    admin_email: emailById.get(row.admin_id) ?? null,
  }));
}
