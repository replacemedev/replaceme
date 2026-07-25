import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  addCalendarDays,
} from "@/lib/data/legal";
import { DELETED_COMPANY_LABEL } from "@/lib/format/tombstone";
import { getAccountClosureBlockers } from "@/lib/server/privacy/account-blockers";
import {
  sendDeletionCompleteEmail,
  sendDeletionScheduledEmail,
} from "@/lib/server/privacy/lifecycle-emails";
import { closeEmployerOpenJobs } from "@/lib/server/privacy/suspend-account";
import { getStripe } from "@/lib/server/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeWarn } from "@/utils/logger";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

export type ScheduleDeletionInput = {
  userId: string;
  reason: string;
  reasonCategory?: string;
  forceCloseEngagements?: boolean;
  notifyUser?: boolean;
};

export type ExecuteErasureInput = {
  userId: string;
  reason: string;
  reasonCategory?: string;
  forceCloseEngagements?: boolean;
  notifyUser?: boolean;
  /** When true, skip grace — used by immediate admin delete and cron. */
  immediate?: boolean;
};

function sentinelEmail(userId: string): string {
  return `deleted-${userId}@anonymized.invalid`;
}

async function suppressResendContact(
  email: string | null,
  resendContactId: string | null
): Promise<{ ok: boolean; detail?: string }> {
  if (!email && !resendContactId) return { ok: true, detail: "no_contact" };
  try {
    const { createResendClient } = await import("@/lib/server/resend/client");
    const resend = createResendClient();
    if (email) {
      const { error } = await resend.contacts.update({
        email,
        unsubscribed: true,
      });
      if (error) {
        safeWarn("suppressResendContact update:", error);
        return { ok: false, detail: error.message };
      }
    }
    return { ok: true };
  } catch (err) {
    safeWarn("suppressResendContact:", err);
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "suppress_failed",
    };
  }
}

async function wipeWorkerMedia(userId: string): Promise<void> {
  const admin = await createAdminClient();

  const { data: docs } = await admin
    .from("verification_documents")
    .select("storage_path")
    .eq("worker_id", userId);

  const paths = (docs ?? []).map((d) => d.storage_path).filter(Boolean);
  if (paths.length > 0) {
    await admin.storage.from("verification-documents").remove(paths);
  }
  await admin.from("verification_documents").delete().eq("worker_id", userId);

  const { data: profile } = await admin
    .from("profiles")
    .select("avatar_url, resume_storage_path, resume_url, cv_url")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.resume_storage_path) {
    await admin.storage.from("resumes").remove([profile.resume_storage_path]);
  }

  // Best-effort avatar wipe when path is under profile-avatars
  if (profile?.avatar_url?.includes("profile-avatars")) {
    try {
      const marker = "/profile-avatars/";
      const idx = profile.avatar_url.indexOf(marker);
      if (idx >= 0) {
        const storagePath = profile.avatar_url.slice(idx + marker.length).split("?")[0];
        if (storagePath) {
          await admin.storage.from("profile-avatars").remove([storagePath]);
        }
      }
    } catch (err) {
      safeWarn("wipeWorkerMedia avatar:", err);
    }
  }
}

async function forceCloseEngagementsForUser(
  userId: string,
  role: UserRole
): Promise<void> {
  const admin = await createAdminClient();

  if (role === "worker") {
    await admin
      .from("applications")
      .update({ status: "WITHDRAWN" })
      .eq("candidate_id", userId)
      .in("status", ["PENDING", "UNDER_REVIEW", "INTERVIEW_SCHEDULED"]);

    await admin
      .from("contracts")
      .update({ status: "terminated", show_hired_badge: false })
      .eq("worker_id", userId)
      .in("status", ["active", "paused", "offered"]);
  }

  if (role === "employer") {
    await closeEmployerOpenJobs(userId);
    await admin
      .from("contracts")
      .update({ status: "terminated" })
      .eq("employer_id", userId)
      .in("status", ["active", "paused", "offered"]);
  }
}

async function cancelEmployerStripe(employerId: string): Promise<{
  canceled: boolean;
  detail?: string;
}> {
  const admin = await createAdminClient();
  const { data: sub } = await admin
    .from("employer_subscriptions")
    .select("stripe_subscription_id, status")
    .eq("employer_id", employerId)
    .maybeSingle();

  const subscriptionId = sub?.stripe_subscription_id?.trim();
  if (!subscriptionId) {
    await admin
      .from("employer_subscriptions")
      .update({
        status: "canceled",
        job_posts_used: 0,
        unlocks_used: 0,
      })
      .eq("employer_id", employerId);
    return { canceled: false, detail: "no_stripe_subscription" };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { canceled: false, detail: "stripe_not_configured" };
  }

  try {
    await stripe.subscriptions.cancel(subscriptionId, { prorate: false });
  } catch (err) {
    safeWarn("cancelEmployerStripe:", err);
    return {
      canceled: false,
      detail: err instanceof Error ? err.message : "stripe_cancel_failed",
    };
  }

  await admin
    .from("employer_subscriptions")
    .update({
      status: "canceled",
      job_posts_used: 0,
      unlocks_used: 0,
      cancel_at_period_end: false,
    })
    .eq("employer_id", employerId);

  return { canceled: true };
}

export async function scheduleAccountDeletion(
  input: ScheduleDeletionInput
): Promise<
  | { success: true; deletionScheduledFor: string }
  | { success: false; error: string }
> {
  try {
    const admin = await createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("id, email, role, deleted_at, legal_hold")
      .eq("id", input.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!profile) return { success: false, error: "User not found" };
    if (profile.deleted_at) {
      return { success: false, error: "Account is already deleted" };
    }
    if (profile.role === "admin") {
      return { success: false, error: "Cannot schedule deletion for admin accounts here" };
    }

    const blockers = await getAccountClosureBlockers(admin, input.userId);
    if (blockers.legalHold) {
      return {
        success: false,
        error: "Legal hold is active. Clear the hold or suspend instead.",
      };
    }
    if (!blockers.canProceedWithoutForce && !input.forceCloseEngagements) {
      return {
        success: false,
        error: blockers.messages.join(" ") || "Resolve open engagements first.",
      };
    }

    if (input.forceCloseEngagements) {
      await forceCloseEngagementsForUser(input.userId, profile.role as UserRole);
    }

    const scheduled = addCalendarDays(
      new Date(),
      ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays
    );
    const deletionScheduledFor = scheduled.toISOString();

    const { error: updateError } = await admin
      .from("profiles")
      .update({ deletion_scheduled_for: deletionScheduledFor })
      .eq("id", input.userId);

    if (updateError) throw new Error(updateError.message);

    {
      const { data: existing } = await admin
        .from("data_deletion_requests")
        .select("id")
        .eq("user_id", input.userId)
        .eq("status", "pending")
        .maybeSingle();
      if (!existing) {
        await admin.from("data_deletion_requests").insert({
          user_id: input.userId,
          role: profile.role,
          reason: input.reason,
          status: "pending",
        });
      }
    }

    if (profile.email) {
      await sendDeletionScheduledEmail({
        to: profile.email,
        userId: input.userId,
        role: profile.role as UserRole,
        scheduledFor: scheduled,
        notify: input.notifyUser !== false,
      });
    }

    return { success: true, deletionScheduledFor };
  } catch (err) {
    safeError("scheduleAccountDeletion:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to schedule deletion",
    };
  }
}

export async function executeAccountErasure(
  input: ExecuteErasureInput
): Promise<
  | { success: true; certificate: Record<string, unknown> }
  | { success: false; error: string }
> {
  try {
    const admin = await createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select(
        "id, email, role, deleted_at, legal_hold, first_name, last_name, resend_contact_id, deletion_scheduled_for"
      )
      .eq("id", input.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!profile) return { success: false, error: "User not found" };
    if (profile.deleted_at) {
      return { success: false, error: "Account is already deleted" };
    }
    if (profile.role === "admin") {
      return { success: false, error: "Cannot erase admin accounts via this path" };
    }
    if (profile.legal_hold) {
      return {
        success: false,
        error: "Legal hold is active. Clear the hold before erasure.",
      };
    }

    const blockers = await getAccountClosureBlockers(admin, input.userId);
    if (!blockers.canProceedWithoutForce && !input.forceCloseEngagements) {
      return {
        success: false,
        error: blockers.messages.join(" ") || "Resolve open engagements first.",
      };
    }

    if (input.forceCloseEngagements) {
      await forceCloseEngagementsForUser(input.userId, profile.role as UserRole);
    }

    const originalEmail = profile.email;

    if (originalEmail) {
      await sendDeletionCompleteEmail({
        to: originalEmail,
        userId: input.userId,
        role: profile.role as UserRole,
        notify: input.notifyUser !== false,
      });
    }

    if (profile.role === "worker") {
      await wipeWorkerMedia(input.userId);
      await admin
        .from("applications")
        .update({ status: "WITHDRAWN" })
        .eq("candidate_id", input.userId)
        .in("status", ["PENDING", "UNDER_REVIEW", "INTERVIEW_SCHEDULED"]);
      await admin
        .from("contracts")
        .update({ show_hired_badge: false })
        .eq("worker_id", input.userId);
    }

    let stripeMeta: Record<string, unknown> = {};
    if (profile.role === "employer") {
      await closeEmployerOpenJobs(input.userId);
      stripeMeta = await cancelEmployerStripe(input.userId);
      await admin
        .from("company_profiles")
        .update({
          company_name: DELETED_COMPANY_LABEL,
          logo_url: null,
          website_url: null,
          company_bio: null,
          industry: null,
          username: null,
        })
        .eq("employer_id", input.userId);
    }

    const now = new Date().toISOString();
    const anonEmail = sentinelEmail(input.userId);

    const { error: anonError } = await admin
      .from("profiles")
      .update({
        deleted_at: now,
        deletion_scheduled_for: null,
        suspension_ends_at: null,
        account_status: "suspended",
        email: anonEmail,
        first_name: null,
        middle_name: null,
        last_name: null,
        suffix: null,
        full_name: null,
        phone_number: null,
        avatar_url: null,
        bio: null,
        professional_title: null,
        portfolio_url: null,
        resume_url: null,
        resume_storage_path: null,
        cv_url: null,
        address_line_1: null,
        city: null,
        province: null,
        region: null,
        location: null,
        skills: null,
        id_type: null,
        id_number: null,
        id_expiration_date: null,
        id_issuing_country: null,
        tin_number: null,
        birth_date: null,
        gender: null,
        civil_status: null,
        username: null,
        is_verified: false,
        verification_status: "unverified",
        kyc_rejection_reason: null,
        profile_visibility: "private",
        resend_contact_id: null,
      })
      .eq("id", input.userId);

    if (anonError) throw new Error(anonError.message);

    await admin.auth.admin.updateUserById(input.userId, {
      ban_duration: "876000h",
      email: anonEmail,
      user_metadata: {
        anonymized: true,
        deleted_at: now,
      },
      app_metadata: {
        anonymized: true,
      },
    });

    const resendMeta = await suppressResendContact(
      originalEmail,
      profile.resend_contact_id
    );

    await admin
      .from("data_deletion_requests")
      .update({
        status: "completed",
        updated_at: now,
      })
      .eq("user_id", input.userId)
      .in("status", ["pending", "in_progress"]);

    const certificate = {
      systems: ["auth", "profiles", "storage", "resend", "stripe"],
      wiped: [
        "profile_pii",
        "kyc_documents",
        "avatar",
        "resume",
        profile.role === "employer" ? "company_public_fields" : null,
      ].filter(Boolean),
      retained: ["billing_ledger", "contracts", "applications_history", "chat", "audit_logs"],
      stripe: stripeMeta,
      resend: resendMeta,
      reason: input.reason,
      reasonCategory: input.reasonCategory ?? null,
      erasedAt: now,
    };

    return { success: true, certificate };
  } catch (err) {
    safeError("executeAccountErasure:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to erase account",
    };
  }
}

/** Cron: erase accounts whose grace window ended. */
export async function autoEraseDueAccounts(): Promise<{
  processed: number;
  errors: number;
}> {
  const admin = await createAdminClient();
  const now = new Date().toISOString();

  const { data: due, error } = await admin
    .from("profiles")
    .select("id")
    .is("deleted_at", null)
    .not("deletion_scheduled_for", "is", null)
    .lte("deletion_scheduled_for", now)
    .eq("legal_hold", false)
    .limit(50);

  if (error) {
    safeError("autoEraseDueAccounts list:", error);
    return { processed: 0, errors: 1 };
  }

  let processed = 0;
  let errors = 0;
  for (const row of due ?? []) {
    const result = await executeAccountErasure({
      userId: row.id,
      reason: "Scheduled deletion grace period elapsed",
      reasonCategory: "user_request",
      forceCloseEngagements: true,
      notifyUser: true,
      immediate: true,
    });
    if (result.success) processed += 1;
    else {
      errors += 1;
      safeWarn("autoEraseDueAccounts failed", { id: row.id, error: result.error });
    }
  }
  return { processed, errors };
}
