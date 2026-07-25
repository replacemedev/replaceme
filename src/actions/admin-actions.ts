"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";
import { safeWarn } from "@/utils/logger";
import type { Json } from "@/types/database";
import {
  CacheKeys,
  CACHE_TTL_SECONDS,
  getOrSet,
  invalidateAdminCache,
} from "@/lib/server/redis-cache";
import {
  EMPTY_PLATFORM_METRICS,
  moderateJobSchema,
  rejectJobSchema,
  bulkApproveJobsSchema,
  bulkRejectJobsSchema,
  platformMetricsSchema,
  reviewVerificationSchema,
  suspendUserSchema,
  deleteAccountSchema,
  adminEmployerListSchema,
  adminAdminRowSchema,
  adminWorkerRowSchema,
  type AdminAdminRow,
  type AdminAuditLogRow,
  type AdminEmployerRow,
  type AdminFetchResult,
  type AdminJobRow,
  type AdminSubscriptionRow,
  type AdminUsersPageData,
  type AdminVerificationDocument,
  type AdminVerificationQueueRow,
  type AdminWorkerRow,
  type AdminDisputeRow,
  type AdminChatThreadRow,
  type PlatformMetrics,
  disputeStatusSchema,
  adminDisputeRowSchema,
  updateDisputeStatusSchema,
  adminSubscriptionOverrideSchema,
} from "@/types/admin.types";
import { getAccountClosureBlockers } from "@/lib/server/privacy/account-blockers";
import {
  suspendAccount,
  unsuspendAccount,
} from "@/lib/server/privacy/suspend-account";
import {
  executeAccountErasure,
  scheduleAccountDeletion,
} from "@/lib/server/privacy/erase-account";
import {
  notifyEmployerJobApproved,
  notifyEmployerJobRejected,
} from "@/lib/server/privacy/job-moderation-notify";

const ADMIN_PATHS = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/jobs",
  "/admin/identity",
  "/admin/revenue",
  "/admin/disputes",
  "/admin/applications",
  "/admin/moderation",
  "/admin/billing-ops",
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

async function revalidateAdminSurfaces() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
  // Prefer the users list path explicitly so status badges refresh immediately.
  revalidatePath("/admin/users");
  await invalidateAdminCache();
}

function actionErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof z.ZodError) {
    return err.issues.map((i) => i.message).join("; ") || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function logAdminAction(
  actionType: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const { user } = await requireAdmin();
  const ip = await getClientIp();
  // Service-role insert so audit logging cannot fail the mutation due to RLS edge cases.
  const admin = await createAdminClient();

  const { error } = await admin.from("audit_logs").insert({
    admin_id: user.id,
    action_type: actionType,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata: (metadata ?? {}) as Json,
    ip_address: ip,
  });

  if (error) throw new Error(`Failed to log admin action: ${error.message}`);
  await invalidateAdminCache();
}

type ActionResult =
  | { success: true; emailSent?: boolean; emailError?: string | null }
  | { success: false; error: string };

const LAST_SIGN_IN_CONCURRENCY = 50;

async function enrichWithLastSignInAt<T>(
  rows: T[],
  getUserId: (row: T) => string
): Promise<(T & { last_sign_in_at: string | null })[]> {
  if (rows.length === 0) return [];

  const adminClient = await createAdminClient();
  const out: (T & { last_sign_in_at: string | null })[] = [];

  for (let i = 0; i < rows.length; i += LAST_SIGN_IN_CONCURRENCY) {
    const chunk = rows.slice(i, i + LAST_SIGN_IN_CONCURRENCY);
    const enriched = await Promise.all(
      chunk.map(async (row) => {
        try {
          const { data, error } = await adminClient.auth.admin.getUserById(
            getUserId(row)
          );
          if (error) {
            return { ...row, last_sign_in_at: null as string | null };
          }
          return {
            ...row,
            last_sign_in_at: data.user.last_sign_in_at ?? null,
          };
        } catch {
          return { ...row, last_sign_in_at: null as string | null };
        }
      })
    );
    out.push(...enriched);
  }

  return out;
}

function assertDeleteConfirmText(
  confirmText: string,
  email: string | null
): void {
  const trimmed = confirmText.trim();
  const emailOk =
    Boolean(email) && trimmed.toLowerCase() === email!.toLowerCase();
  if (trimmed !== "DELETE" && !emailOk) {
    throw new Error('Confirmation must be "DELETE" or the account email');
  }
}

export async function suspendUser(input: {
  userId: string;
  reason: string;
  durationDays: 7 | 14 | 30 | 90 | null;
  notifyUser?: boolean;
  reasonCategory?: string;
}): Promise<ActionResult> {
  try {
    const parsed = suspendUserSchema.parse(input);
    const { user } = await requireAdmin();

    const result = await suspendAccount({
      userId: parsed.userId,
      reason: parsed.reason,
      durationDays: parsed.durationDays,
      notifyUser: parsed.notifyUser,
      reasonCategory: parsed.reasonCategory,
      actorAdminId: user.id,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    try {
      await logAdminAction("suspend_user", "profile", parsed.userId, {
        reason: parsed.reason,
        reasonCategory: parsed.reasonCategory ?? null,
        durationDays: parsed.durationDays,
        suspensionEndsAt: result.suspensionEndsAt,
        jobsClosed: result.jobsClosed,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });
    } catch (auditErr) {
      safeWarn("suspendUser: audit log failed after successful suspend", {
        userId: parsed.userId,
        error: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }
    await revalidateAdminSurfaces();
    return {
      success: true,
      emailSent: result.emailSent,
      emailError: result.emailError,
    };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to suspend user"),
    };
  }
}

export async function unsuspendUser(
  userId: string,
  notifyUser = true
): Promise<ActionResult> {
  try {
    const id = z.string().uuid().parse(userId);
    await requireAdmin();

    const result = await unsuspendAccount({ userId: id, notifyUser });
    if (!result.success) {
      return { success: false, error: result.error };
    }

    try {
      await logAdminAction("unsuspend_user", "profile", id, {
        notifyUser,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });
    } catch (auditErr) {
      safeWarn("unsuspendUser: audit log failed after successful unsuspend", {
        userId: id,
        error: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }
    await revalidateAdminSurfaces();
    return {
      success: true,
      emailSent: result.emailSent,
      emailError: result.emailError,
    };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to unsuspend user"),
    };
  }
}

export async function getUserClosureBlockers(userId: string) {
  const id = z.string().uuid().parse(userId);
  await requireAdmin();
  const admin = await createAdminClient();
  return getAccountClosureBlockers(admin, id);
}

export async function scheduleUserAccountDeletion(input: {
  userId: string;
  reason: string;
  reasonCategory?: string;
  forceCloseEngagements?: boolean;
  notifyUser?: boolean;
  confirmText: string;
}): Promise<ActionResult> {
  try {
    const parsed = deleteAccountSchema.parse({ ...input, mode: "schedule" });
    await requireAdmin();

    const admin = await createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("id", parsed.userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return { success: false, error: "User not found" };

    assertDeleteConfirmText(parsed.confirmText, profile.email);

    const result = await scheduleAccountDeletion({
      userId: parsed.userId,
      reason: parsed.reason,
      reasonCategory: parsed.reasonCategory,
      forceCloseEngagements: parsed.forceCloseEngagements,
      notifyUser: parsed.notifyUser,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    try {
      await logAdminAction("schedule_account_deletion", "profile", parsed.userId, {
        reason: parsed.reason,
        reasonCategory: parsed.reasonCategory ?? null,
        forceCloseEngagements: parsed.forceCloseEngagements,
        deletionScheduledFor: result.deletionScheduledFor,
        notifyUser: parsed.notifyUser,
        emailSent: result.emailSent,
        emailError: result.emailError,
      });
    } catch (auditErr) {
      safeWarn("scheduleUserAccountDeletion: audit log failed after success", {
        userId: parsed.userId,
        error: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }
    await revalidateAdminSurfaces();
    return {
      success: true,
      emailSent: result.emailSent,
      emailError: result.emailError,
    };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to schedule account deletion"),
    };
  }
}

export async function deleteUserAccount(input: {
  userId: string;
  reason: string;
  reasonCategory?: string;
  forceCloseEngagements?: boolean;
  notifyUser?: boolean;
  confirmText: string;
}): Promise<ActionResult> {
  try {
    const parsed = deleteAccountSchema.parse({ ...input, mode: "immediate" });
    await requireAdmin();

    const admin = await createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("email")
      .eq("id", parsed.userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return { success: false, error: "User not found" };

    assertDeleteConfirmText(parsed.confirmText, profile.email);

    const result = await executeAccountErasure({
      userId: parsed.userId,
      reason: parsed.reason,
      reasonCategory: parsed.reasonCategory,
      forceCloseEngagements: parsed.forceCloseEngagements,
      notifyUser: parsed.notifyUser,
      immediate: true,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    try {
      await logAdminAction("delete_user_account", "profile", parsed.userId, {
        reason: parsed.reason,
        reasonCategory: parsed.reasonCategory ?? null,
        forceCloseEngagements: parsed.forceCloseEngagements,
        notifyUser: parsed.notifyUser,
        emailSent: result.emailSent,
        emailError: result.emailError,
        certificate: result.certificate,
      });
    } catch (auditErr) {
      safeWarn("deleteUserAccount: audit log failed after successful erase", {
        userId: parsed.userId,
        error: auditErr instanceof Error ? auditErr.message : String(auditErr),
      });
    }
    await revalidateAdminSurfaces();
    return {
      success: true,
      emailSent: result.emailSent,
      emailError: result.emailError,
    };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to delete user account"),
    };
  }
}

export async function approveJobPost(jobId: string): Promise<ActionResult> {
  try {
    const id = moderateJobSchema.shape.jobId.parse(jobId);
    const { supabase, user } = await requireAdmin();

    const { data: existing, error: loadError } = await supabase
      .from("jobs")
      .select("id, title, employer_id, status, deleted_at")
      .eq("id", id)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error("Job not found");
    if (existing.deleted_at || existing.status === "Deleted") {
      throw new Error("Restore this job before approving it");
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Active",
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        rejection_category: null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    if (existing.employer_id) {
      const { invalidateEmployerCache } = await import(
        "@/lib/server/entitlements"
      );
      await invalidateEmployerCache(existing.employer_id);
      await notifyEmployerJobApproved({
        employerId: existing.employer_id,
        jobId: id,
        jobTitle: existing.title,
      });
    }

    await logAdminAction("approve_job", "job", id);
    await revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to approve job"),
    };
  }
}

export async function rejectJobPost(input: {
  jobId: string;
  category: string;
  reason?: string;
}): Promise<ActionResult> {
  try {
    const parsed = rejectJobSchema.parse(input);
    const { supabase, user } = await requireAdmin();
    const trimmedReason = parsed.reason?.trim() || null;
    const now = new Date().toISOString();

    const { data: existing, error: loadError } = await supabase
      .from("jobs")
      .select("id, title, employer_id, status, deleted_at")
      .eq("id", parsed.jobId)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error("Job not found");
    if (existing.deleted_at || existing.status === "Deleted") {
      throw new Error("Cannot reject a deleted job");
    }
    if (existing.status === "Rejected") {
      throw new Error("Job is already rejected");
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Rejected",
        rejection_category: parsed.category,
        rejection_reason: trimmedReason,
        rejected_at: now,
        rejected_by: user.id,
      })
      .eq("id", parsed.jobId);

    if (error) throw new Error(error.message);

    if (existing.employer_id) {
      const { invalidateEmployerCache } = await import(
        "@/lib/server/entitlements"
      );
      await invalidateEmployerCache(existing.employer_id);
      await notifyEmployerJobRejected({
        employerId: existing.employer_id,
        jobId: parsed.jobId,
        jobTitle: existing.title,
        category: parsed.category,
        reason: trimmedReason,
      });
    }

    await logAdminAction("reject_job", "job", parsed.jobId, {
      category: parsed.category,
      reason: trimmedReason,
    });
    await revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to reject job"),
    };
  }
}

export async function bulkApproveJobPosts(
  jobIds: string[]
): Promise<ActionResult & { approved?: number }> {
  try {
    const parsed = bulkApproveJobsSchema.parse({ jobIds });
    let approved = 0;
    for (const jobId of parsed.jobIds) {
      const result = await approveJobPost(jobId);
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          approved,
        };
      }
      approved += 1;
    }
    return { success: true, approved };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to bulk approve jobs"),
    };
  }
}

export async function bulkRejectJobPosts(input: {
  jobIds: string[];
  category: string;
  reason?: string;
}): Promise<ActionResult & { rejected?: number }> {
  try {
    const parsed = bulkRejectJobsSchema.parse(input);
    let rejected = 0;
    for (const jobId of parsed.jobIds) {
      const result = await rejectJobPost({
        jobId,
        category: parsed.category,
        reason: parsed.reason,
      });
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          rejected,
        };
      }
      rejected += 1;
    }
    return { success: true, rejected };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to bulk reject jobs"),
    };
  }
}

export async function countJobsPendingReview(): Promise<number> {
  const { supabase } = await requireAdmin();
  const { count, error } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "Pending Review")
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function deleteJobPost(
  jobId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const parsed = moderateJobSchema.parse({ jobId, reason });
    const { supabase, user } = await requireAdmin();
    const now = new Date().toISOString();

    const { data: existing, error: loadError } = await supabase
      .from("jobs")
      .select("id, employer_id, status, deleted_at")
      .eq("id", parsed.jobId)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error("Job not found");
    if (existing.deleted_at || existing.status === "Deleted") {
      throw new Error("Job is already deleted");
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Deleted",
        deleted_at: now,
        deleted_by: user.id,
        deletion_reason: parsed.reason,
      })
      .eq("id", parsed.jobId);

    if (error) throw new Error(error.message);

    if (existing.employer_id) {
      const { invalidateEmployerCache } = await import(
        "@/lib/server/entitlements"
      );
      await invalidateEmployerCache(existing.employer_id);
    }

    await logAdminAction("delete_job_post", "job", parsed.jobId, {
      reason: parsed.reason,
      soft: true,
    });
    await revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete job",
    };
  }
}

export async function restoreJobPost(jobId: string): Promise<ActionResult> {
  try {
    const id = moderateJobSchema.shape.jobId.parse(jobId);
    const { supabase } = await requireAdmin();

    const { data: existing, error: loadError } = await supabase
      .from("jobs")
      .select("id, employer_id, status, deleted_at")
      .eq("id", id)
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!existing) throw new Error("Job not found");
    if (!existing.deleted_at && existing.status !== "Deleted") {
      throw new Error("Job is not deleted");
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "Draft",
        deleted_at: null,
        deleted_by: null,
        deletion_reason: null,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    if (existing.employer_id) {
      const { invalidateEmployerCache } = await import(
        "@/lib/server/entitlements"
      );
      await invalidateEmployerCache(existing.employer_id);
    }

    await logAdminAction("restore_job_post", "job", id);
    await revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: actionErrorMessage(err, "Failed to restore job"),
    };
  }
}

export async function reviewWorkerVerification(
  workerId: string,
  decision: "approved" | "rejected" | "resubmission_required",
  reason?: string
): Promise<ActionResult> {
  try {
    const parsed = reviewVerificationSchema.parse({ workerId, decision, reason });
    const { supabase } = await requireAdmin();

    const nextStatus = parsed.decision;
    const trimmedReason = parsed.reason?.trim() || null;

    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: nextStatus,
        is_verified: parsed.decision === "approved",
        kyc_rejection_reason:
          parsed.decision === "approved" ? null : trimmedReason,
      })
      .eq("id", parsed.workerId)
      .eq("role", "worker");

    if (error) throw new Error(error.message);

    const actionType =
      parsed.decision === "approved"
        ? "approve_verification"
        : parsed.decision === "resubmission_required"
          ? "require_verification_resubmission"
          : "reject_verification";

    await logAdminAction(
      actionType,
      "profile",
      parsed.workerId,
      trimmedReason ? { reason: trimmedReason, decision: parsed.decision } : { decision: parsed.decision }
    );
    await revalidateAdminSurfaces();
    revalidatePath("/worker/verification");
    revalidatePath("/worker/dashboard");
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
  await requireAdmin();

  return getOrSet(
    CacheKeys.adminPlatformMetrics(),
    CACHE_TTL_SECONDS.adminMetrics,
    async () => {
      const adminClient = await createAdminClient();
      const { data, error } = await adminClient.rpc("get_platform_metrics");

      if (error) {
        throw new Error(`Failed to fetch platform metrics: ${error.message}`);
      }

      const parsed = platformMetricsSchema.safeParse(data);
      return parsed.success ? parsed.data : EMPTY_PLATFORM_METRICS;
    }
  );
}

export async function fetchRecentAuditLogs(limit = 10) {
  await requireAdmin();

  return getOrSet(
    CacheKeys.adminRecentAuditLogs(limit),
    CACHE_TTL_SECONDS.adminAuditLogs,
    async () => {
      const { supabase } = await requireAdmin();

      const { data } = await supabase
        .from("audit_logs")
        .select("id, action_type, target_type, target_id, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      return data ?? [];
    }
  );
}

export async function fetchAdminWorkers(): Promise<AdminWorkerRow[]> {
  const result = await fetchAdminWorkersSafe();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function fetchAdminWorkersSafe(): Promise<
  AdminFetchResult<AdminWorkerRow[]>
> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        middle_name,
        last_name,
        email,
        professional_title,
        account_status,
        verification_status,
        is_verified,
        created_at,
        deleted_at,
        suspension_ends_at,
        deletion_scheduled_for,
        legal_hold,
        contracts!contracts_worker_id_fkey (
          id,
          employment_status,
          show_hired_badge,
          status
        )
        `
      )
      .eq("role", "worker")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const rows = data ?? [];
    const valid: AdminWorkerRow[] = [];
    const failedFields = new Set<string>();

    for (const row of rows) {
      const parsed = adminWorkerRowSchema.safeParse(row);
      if (parsed.success) {
        valid.push(parsed.data);
        continue;
      }
      for (const issue of parsed.error.issues) {
        failedFields.add(issue.path.join(".") || "(root)");
      }
      safeWarn("fetchAdminWorkersSafe: skipped invalid worker row", {
        id: (row as { id?: string }).id,
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    if (valid.length === 0 && rows.length > 0) {
      const fields = [...failedFields].slice(0, 8).join(", ");
      return {
        success: false,
        error: `Worker records failed validation (${fields}). Check database schema alignment.`,
      };
    }

    const enriched = await enrichWithLastSignInAt(valid, (row) => row.id);
    return { success: true, data: enriched };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load workers",
    };
  }
}

export async function fetchAdminEmployers(): Promise<AdminEmployerRow[]> {
  const result = await fetchAdminEmployersSafe();
  if (!result.success) throw new Error(result.error);
  return result.data;
}

export async function fetchAdminEmployersSafe(): Promise<
  AdminFetchResult<AdminEmployerRow[]>
> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("company_profiles")
      .select(
        `
        id,
        employer_id,
        company_name,
        industry,
        created_at,
        profiles!company_profiles_employer_id_fkey (
          email,
          account_status,
          deleted_at,
          suspension_ends_at,
          deletion_scheduled_for,
          legal_hold,
          employer_subscriptions (
            status
          )
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const mapped = (data ?? []).map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const subscriptions = profile?.employer_subscriptions;
      const subscription = Array.isArray(subscriptions)
        ? subscriptions[0]
        : subscriptions;

      return {
        id: row.id,
        employer_id: row.employer_id,
        company_name: row.company_name,
        email: profile?.email ?? null,
        industry: row.industry,
        account_status: profile?.account_status ?? "active",
        subscription_status: subscription?.status ?? null,
        created_at: row.created_at,
        deleted_at: profile?.deleted_at ?? null,
        suspension_ends_at: profile?.suspension_ends_at ?? null,
        deletion_scheduled_for: profile?.deletion_scheduled_for ?? null,
        legal_hold: profile?.legal_hold ?? false,
        last_sign_in_at: null,
      };
    });

    const parsed = adminEmployerListSchema.safeParse(mapped);
    if (!parsed.success) {
      return {
        success: false,
        error:
          "Employer records failed validation. Check database schema alignment.",
      };
    }

    const enriched = await enrichWithLastSignInAt(
      parsed.data,
      (row) => row.employer_id
    );
    return { success: true, data: enriched };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load employers",
    };
  }
}

export async function fetchAdminAdminsSafe(): Promise<
  AdminFetchResult<AdminAdminRow[]>
> {
  try {
    const { supabase } = await requireAdmin();

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, first_name, middle_name, last_name, email, account_status, created_at"
      )
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    const rows = data ?? [];
    const valid: AdminAdminRow[] = [];
    const failedFields = new Set<string>();

    for (const row of rows) {
      const parsed = adminAdminRowSchema.safeParse(row);
      if (parsed.success) {
        valid.push(parsed.data);
        continue;
      }
      for (const issue of parsed.error.issues) {
        failedFields.add(issue.path.join(".") || "(root)");
      }
      safeWarn("fetchAdminAdminsSafe: skipped invalid admin row", {
        id: (row as { id?: string }).id,
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      });
    }

    if (valid.length === 0 && rows.length > 0) {
      const fields = [...failedFields].slice(0, 8).join(", ");
      return {
        success: false,
        error: `Admin records failed validation (${fields}). Check database schema alignment.`,
      };
    }

    return { success: true, data: valid };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load admins",
    };
  }
}

export async function fetchAdminUsersPageData(): Promise<
  AdminFetchResult<AdminUsersPageData>
> {
  const [workersResult, employersResult, adminsResult] = await Promise.all([
    fetchAdminWorkersSafe(),
    fetchAdminEmployersSafe(),
    fetchAdminAdminsSafe(),
  ]);

  if (!workersResult.success) {
    return workersResult;
  }

  if (!employersResult.success) {
    return employersResult;
  }

  if (!adminsResult.success) {
    return adminsResult;
  }

  return {
    success: true,
    data: {
      workers: workersResult.data,
      employers: employersResult.data,
      admins: adminsResult.data,
    },
  };
}

export async function fetchAdminJobs(
  filters?: {
    status?: string | null;
    search?: string;
  }
): Promise<AdminJobRow[]> {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      status,
      employment_type,
      monthly_salary,
      salary_currency,
      employer_id,
      created_at,
      submitted_for_review_at,
      rejection_category,
      rejection_reason,
      rejected_at,
      deleted_at,
      deletion_reason,
      profiles!jobs_employer_id_fkey (
        company_profiles (
          company_name
        ),
        employer_subscriptions (
          plan_slug
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  const statusFilter = filters?.status;
  if (statusFilter === "Deleted") {
    query = query.or("deleted_at.not.is.null,status.eq.Deleted");
  } else if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter).is("deleted_at", null);
  } else {
    query = query.is("deleted_at", null);
  }

  const search = filters?.search?.trim();
  if (search) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        search
      );
    query = isUuid
      ? query.or(`title.ilike.%${search}%,id.eq.${search}`)
      : query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const companyProfiles = profile?.company_profiles;
    const company = Array.isArray(companyProfiles)
      ? companyProfiles[0]
      : companyProfiles;
    const subscriptions = profile?.employer_subscriptions;
    const subscription = Array.isArray(subscriptions)
      ? subscriptions[0]
      : subscriptions;
    const planSlug = subscription?.plan_slug ?? "discovery";

    return {
      id: row.id,
      title: row.title,
      status: row.deleted_at ? "Deleted" : row.status,
      employment_type: row.employment_type,
      monthly_salary: row.monthly_salary,
      salary_currency: row.salary_currency ?? null,
      employer_id: row.employer_id,
      company_name: company?.company_name ?? null,
      created_at: row.created_at,
      plan_slug: planSlug,
      submitted_for_review_at: row.submitted_for_review_at,
      requires_manual_approval: planSlug === "discovery",
      rejection_category: row.rejection_category ?? null,
      rejection_reason: row.rejection_reason ?? null,
      rejected_at: row.rejected_at ?? null,
      deleted_at: row.deleted_at ?? null,
      deletion_reason: row.deletion_reason ?? null,
    };
  });
}

export async function fetchVerificationQueue(): Promise<
  AdminVerificationQueueRow[]
> {
  const { supabase } = await requireAdmin();

  const { data: workers, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, middle_name, last_name, email, username, phone_number, tin_number, birth_date, region, city, location, address_line_1, id_type, id_number, id_expiration_date, id_issuing_country, verification_status, is_verified, created_at"
    )
    .eq("role", "worker")
    .in("verification_status", [
      "documents_submitted",
      "under_review",
      "approved",
      "rejected",
      "resubmission_required",
    ])
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
    id: w.id,
    first_name: w.first_name,
    middle_name: w.middle_name,
    last_name: w.last_name,
    email: w.email,
    username: w.username ?? null,
    phone_number: w.phone_number ?? null,
    tin_number: w.tin_number ?? null,
    birth_date: w.birth_date ?? null,
    region: w.region ?? null,
    city: w.city ?? null,
    location: w.location ?? null,
    address_line_1: w.address_line_1 ?? null,
    id_type: w.id_type ?? null,
    id_number: w.id_number ?? null,
    id_expiration_date: w.id_expiration_date ?? null,
    id_issuing_country: w.id_issuing_country ?? null,
    verification_status: w.verification_status,
    is_verified: Boolean(w.is_verified),
    document_count: counts.get(w.id) ?? 0,
    created_at: w.created_at,
  }));
}

export async function fetchWorkerVerificationDocuments(
  workerId: string
): Promise<AdminVerificationDocument[]> {
  const id = z.string().uuid().parse(workerId);
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("verification_documents")
    .select("id, document_type, file_name, mime_type, storage_path, created_at")
    .eq("worker_id", id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const results: AdminVerificationDocument[] = [];
  for (const doc of data ?? []) {
    const isImage = doc.mime_type?.startsWith("image/");
    // Reuse signed URLs so Smart CDN can serve HITs (unique tokens = miss).
    // Preview: edge-resized with contain (Safari-safe, readable ID edges).
    // Full: untransformed for lightbox / download KYC text checks.
    const [signedUrl, fullSignedUrl] = await Promise.all([
      getOrSet<string | null>(
        CacheKeys.storageSignedUrl(
          "verification-documents",
          isImage ? `${doc.storage_path}:preview-contain-720` : doc.storage_path
        ),
        CACHE_TTL_SECONDS.storageSignedUrl,
        async () => {
          const { data: signed } = await supabase.storage
            .from("verification-documents")
            .createSignedUrl(
              doc.storage_path,
              300,
              isImage
                ? {
                    transform: {
                      width: 720,
                      height: 540,
                      resize: "contain",
                      quality: 80,
                    },
                  }
                : undefined
            );
          return signed?.signedUrl ?? null;
        }
      ),
      isImage
        ? getOrSet<string | null>(
            CacheKeys.storageSignedUrl(
              "verification-documents",
              `${doc.storage_path}:full`
            ),
            CACHE_TTL_SECONDS.storageSignedUrl,
            async () => {
              const { data: signed } = await supabase.storage
                .from("verification-documents")
                .createSignedUrl(doc.storage_path, 300);
              return signed?.signedUrl ?? null;
            }
          )
        : Promise.resolve(null),
    ]);

    results.push({
      id: doc.id,
      document_type: doc.document_type,
      file_name: doc.file_name,
      mime_type: doc.mime_type,
      signed_url: signedUrl,
      full_signed_url: fullSignedUrl ?? signedUrl,
      created_at: doc.created_at,
    });
  }

  return results;
}

export async function fetchAdminSubscriptions(): Promise<
  AdminSubscriptionRow[]
> {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("employer_subscriptions")
    .select(
      `
      id,
      employer_id,
      status,
      plan_slug,
      unit_amount_cents,
      billing_interval,
      stripe_customer_id,
      stripe_subscription_id,
      current_period_end,
      last_payment_status,
      last_payment_at,
      last_payment_error,
      failed_payment_count,
      job_posts_used,
      unlocks_used,
      created_at,
      scheduled_plan_slug,
      scheduled_effective_at,
      cancel_at_period_end,
      stripe_dispute_status,
      override_plan_id,
      override_expires_at,
      override_reason,
      billing_plans!employer_subscriptions_plan_id_fkey (
        name,
        price,
        slug
      ),
      profiles!employer_subscriptions_employer_id_fkey (
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
      plan_slug: row.plan_slug ?? plan?.slug ?? null,
      plan_price: plan?.price ?? null,
      unit_amount_cents: row.unit_amount_cents ?? null,
      billing_interval:
        row.billing_interval === "year" || row.billing_interval === "month"
          ? row.billing_interval
          : null,
      status: row.status,
      stripe_customer_id: row.stripe_customer_id,
      stripe_subscription_id: row.stripe_subscription_id,
      current_period_end: row.current_period_end,
      last_payment_status: row.last_payment_status ?? null,
      last_payment_at: row.last_payment_at ?? null,
      last_payment_error: row.last_payment_error ?? null,
      failed_payment_count: row.failed_payment_count ?? 0,
      job_posts_used: row.job_posts_used,
      unlocks_used: row.unlocks_used,
      created_at: row.created_at,
      scheduled_plan_slug: row.scheduled_plan_slug ?? null,
      scheduled_effective_at: row.scheduled_effective_at ?? null,
      cancel_at_period_end: Boolean(row.cancel_at_period_end),
      stripe_dispute_status: row.stripe_dispute_status ?? null,
      override_plan_id: row.override_plan_id ?? null,
      override_expires_at: row.override_expires_at ?? null,
      override_reason: row.override_reason ?? null,
    };
  });
}

export async function fetchAuditLogs(limit = 100): Promise<AdminAuditLogRow[]> {
  const { supabase } = await requireAdmin();

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

export async function fetchAdminDisputes(
  status?: string
): Promise<AdminDisputeRow[]> {
  await requireAdmin();
  const adminClient = await createAdminClient();

  let query = adminClient
    .from("disputes")
    .select(
      "id, title, description, status, worker_id, employer_id, job_id, admin_notes, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (status) {
    const parsedStatus = disputeStatusSchema.safeParse(status);
    if (parsedStatus.success) {
      query = query.eq("status", parsedStatus.data);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const workerIds = [
    ...new Set((data ?? []).map((d) => d.worker_id).filter(Boolean)),
  ] as string[];

  const workerById = new Map<
    string,
    { name: string; email: string | null; isVerified: boolean }
  >();
  if (workerIds.length > 0) {
    const { data: workers } = await adminClient
      .from("profiles")
      .select("id, first_name, middle_name, last_name, email, is_verified")
      .in("id", workerIds);

    for (const w of workers ?? []) {
      const name = formatFullName(w.first_name, w.middle_name, w.last_name) || "Worker";
      workerById.set(w.id, {
        name,
        email: w.email,
        isVerified: Boolean(w.is_verified),
      });
    }
  }

  const rows = (data ?? []).map((row) => {
    const worker = row.worker_id ? workerById.get(row.worker_id) : null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      worker_id: row.worker_id,
      employer_id: row.employer_id,
      job_id: row.job_id,
      worker_name: worker?.name ?? null,
      worker_email: worker?.email ?? null,
      worker_is_verified: worker?.isVerified ?? false,
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  });

  const parsed = z.array(adminDisputeRowSchema).safeParse(rows);
  return parsed.success ? parsed.data : [];
}

export async function updateDisputeStatus(
  disputeId: string,
  status: string,
  adminNotes?: string
): Promise<ActionResult> {
  try {
    const parsed = updateDisputeStatusSchema.parse({
      disputeId,
      status,
      adminNotes,
    });
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from("disputes")
      .update({
        status: parsed.status,
        admin_notes: parsed.adminNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.disputeId);

    if (error) throw new Error(error.message);

    await logAdminAction("update_dispute", "dispute", parsed.disputeId, {
      status: parsed.status,
      adminNotes: parsed.adminNotes,
    });
    await revalidateAdminSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update dispute",
    };
  }
}

export async function fetchAdminChatThreads(): Promise<AdminChatThreadRow[]> {
  await requireAdmin();
  const adminClient = await createAdminClient();

  const { data: threads, error } = await adminClient
    .from("chat_threads")
    .select(
      `
      id,
      worker_id,
      updated_at,
      jobs ( title ),
      company_profiles ( company_name ),
      profiles!chat_threads_worker_id_fkey ( first_name, middle_name, last_name, is_verified )
    `
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  if (!threads?.length) return [];

  const threadIds = threads.map((t) => t.id);
  const { data: messages } = await adminClient
    .from("chat_messages")
    .select("thread_id, created_at")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: false });

  const stats = new Map<string, { count: number; last: string | null }>();
  for (const msg of messages ?? []) {
    const current = stats.get(msg.thread_id) ?? { count: 0, last: null };
    current.count += 1;
    if (!current.last) current.last = msg.created_at;
    stats.set(msg.thread_id, current);
  }

  return threads.map((thread) => {
    const worker = Array.isArray(thread.profiles)
      ? thread.profiles[0]
      : thread.profiles;
    const company = Array.isArray(thread.company_profiles)
      ? thread.company_profiles[0]
      : thread.company_profiles;
    const job = Array.isArray(thread.jobs) ? thread.jobs[0] : thread.jobs;
    const meta = stats.get(thread.id);

    return {
      id: thread.id,
      worker_id: thread.worker_id,
      worker_name:
        formatFullName(worker?.first_name, worker?.middle_name, worker?.last_name) ||
        null,
      worker_is_verified: Boolean(worker?.is_verified),
      company_name: company?.company_name ?? null,
      job_title: job?.title ?? null,
      message_count: meta?.count ?? 0,
      last_message_at: meta?.last ?? null,
      updated_at: thread.updated_at,
    };
  });
}

export async function adminOverrideSubscriptionUsage(
  subscriptionId: string,
  jobPostsUsed: number,
  unlocksUsed: number,
  note: string
): Promise<ActionResult> {
  try {
    const parsed = adminSubscriptionOverrideSchema.parse({
      subscriptionId,
      jobPostsUsed,
      unlocksUsed,
      note,
    });
    await requireAdmin();
    const adminClient = await createAdminClient();

    const { error } = await adminClient
      .from("employer_subscriptions")
      .update({
        job_posts_used: parsed.jobPostsUsed,
        unlocks_used: parsed.unlocksUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.subscriptionId);

    if (error) throw new Error(error.message);

    await logAdminAction(
      "override_subscription_usage",
      "employer_subscription",
      parsed.subscriptionId,
      {
        jobPostsUsed: parsed.jobPostsUsed,
        unlocksUsed: parsed.unlocksUsed,
        note: parsed.note,
      }
    );
    revalidatePath("/admin/billing-ops");
    revalidatePath("/admin/revenue");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to override subscription",
    };
  }
}
