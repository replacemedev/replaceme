import { addCalendarDays } from "@/lib/data/legal";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError, safeWarn } from "@/utils/logger";
import {
  sendAccountSuspendedEmail,
  sendAccountUnsuspendedEmail,
} from "@/lib/server/privacy/lifecycle-emails";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

export type SuspendAccountInput = {
  userId: string;
  reason: string;
  /** Null = indefinite. */
  durationDays: 7 | 14 | 30 | 90 | null;
  notifyUser?: boolean;
  reasonCategory?: string;
  actorAdminId?: string;
};

export type SuspendAccountResult =
  | {
      success: true;
      suspensionEndsAt: string | null;
      jobsClosed: number;
      emailSent: boolean;
      emailError: string | null;
    }
  | { success: false; error: string };

function banDurationHours(durationDays: number | null): string {
  if (durationDays == null) return "876000h"; // ~100y stand-in for indefinite
  return `${durationDays * 24}h`;
}

/** Close Active / Pending Review jobs so suspended employers leave the public board. */
export async function closeEmployerOpenJobs(employerId: string): Promise<number> {
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("jobs")
    .update({ status: "Closed" })
    .eq("employer_id", employerId)
    .in("status", ["Active", "Pending Review"])
    .select("id");

  if (error) {
    safeError("closeEmployerOpenJobs:", error);
    throw new Error(error.message);
  }
  return data?.length ?? 0;
}

export async function suspendAccount(
  input: SuspendAccountInput
): Promise<SuspendAccountResult> {
  try {
    const admin = await createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, email, role, deleted_at, account_status")
      .eq("id", input.userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return { success: false, error: "User not found" };
    if (profile.deleted_at) {
      return { success: false, error: "Account is already deleted" };
    }
    if (profile.role === "admin") {
      return {
        success: false,
        error: "Use admin team tools to suspend admin accounts",
      };
    }

    const endsAt =
      input.durationDays == null
        ? null
        : addCalendarDays(new Date(), input.durationDays);
    const suspensionEndsAt = endsAt?.toISOString() ?? null;

    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update({
        account_status: "suspended",
        suspension_ends_at: suspensionEndsAt,
      })
      .eq("id", input.userId)
      .select("id")
      .maybeSingle();

    if (updateError) throw new Error(updateError.message);
    if (!updated) {
      throw new Error("Profile status update did not apply (0 rows)");
    }

    // Auth Admin API — requires service role. Official ban pattern: ban_duration.
    const { error: banError } = await admin.auth.admin.updateUserById(
      input.userId,
      { ban_duration: banDurationHours(input.durationDays) }
    );
    if (banError) {
      // Roll back profile standing if Auth ban fails so UI/auth stay consistent.
      await admin
        .from("profiles")
        .update({
          account_status: profile.account_status ?? "active",
          suspension_ends_at: null,
        })
        .eq("id", input.userId);
      throw new Error(`Auth ban failed: ${banError.message}`);
    }

    let jobsClosed = 0;
    if (profile.role === "employer") {
      jobsClosed = await closeEmployerOpenJobs(input.userId);
    }

    let emailSent = false;
    let emailError: string | null = null;
    if (input.notifyUser !== false) {
      if (!profile.email) {
        emailError = "User has no email on file";
      } else {
        const mailed = await sendAccountSuspendedEmail({
          to: profile.email,
          userId: input.userId,
          role: profile.role as UserRole,
          reasonCategory: input.reasonCategory,
          endsAt,
          notify: true,
        });
        emailSent = mailed.sent;
        if (!mailed.sent) emailError = mailed.skipped;
      }
    }

    return {
      success: true,
      suspensionEndsAt,
      jobsClosed,
      emailSent,
      emailError,
    };
  } catch (err) {
    safeError("suspendAccount:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to suspend account",
    };
  }
}

export async function unsuspendAccount(input: {
  userId: string;
  notifyUser?: boolean;
}): Promise<
  | { success: true; emailSent: boolean; emailError: string | null }
  | { success: false; error: string }
> {
  try {
    const admin = await createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id, email, role, deleted_at")
      .eq("id", input.userId)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);
    if (!profile) return { success: false, error: "User not found" };
    if (profile.deleted_at) {
      return { success: false, error: "Cannot unsuspend a deleted account" };
    }

    const { data: updated, error: updateError } = await admin
      .from("profiles")
      .update({
        account_status: "active",
        suspension_ends_at: null,
      })
      .eq("id", input.userId)
      .select("id")
      .maybeSingle();

    if (updateError) throw new Error(updateError.message);
    if (!updated) {
      throw new Error("Profile status update did not apply (0 rows)");
    }

    const { error: unbanError } = await admin.auth.admin.updateUserById(
      input.userId,
      { ban_duration: "none" }
    );
    if (unbanError) {
      throw new Error(`Auth unban failed: ${unbanError.message}`);
    }

    let emailSent = false;
    let emailError: string | null = null;
    if (input.notifyUser !== false && profile.role !== "admin") {
      if (!profile.email) {
        emailError = "User has no email on file";
      } else {
        const mailed = await sendAccountUnsuspendedEmail({
          to: profile.email,
          userId: input.userId,
          role: profile.role as UserRole,
          notify: true,
        });
        emailSent = mailed.sent;
        if (!mailed.sent) emailError = mailed.skipped;
      }
    }

    return { success: true, emailSent, emailError };
  } catch (err) {
    safeError("unsuspendAccount:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unsuspend account",
    };
  }
}

/** Cron helper: lift suspensions whose end date has passed. */
export async function autoUnsuspendDueAccounts(): Promise<{
  processed: number;
  errors: number;
}> {
  const admin = await createAdminClient();
  const now = new Date().toISOString();

  const { data: due, error } = await admin
    .from("profiles")
    .select("id")
    .eq("account_status", "suspended")
    .is("deleted_at", null)
    .not("suspension_ends_at", "is", null)
    .lte("suspension_ends_at", now)
    .limit(100);

  if (error) {
    safeError("autoUnsuspendDueAccounts list:", error);
    return { processed: 0, errors: 1 };
  }

  let processed = 0;
  let errors = 0;
  for (const row of due ?? []) {
    const result = await unsuspendAccount({ userId: row.id, notifyUser: true });
    if (result.success) processed += 1;
    else {
      errors += 1;
      safeWarn("autoUnsuspendDueAccounts failed", { id: row.id, error: result.error });
    }
  }
  return { processed, errors };
}
