"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/server/auth/session";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { requireAdminCapability } from "@/lib/server/auth/require-capability";
import { emitAuditLog } from "@/lib/server/audit/emit-audit-log";
import type { AdminAuditLogRow } from "@/types/admin.types";

export const SECURITY_EVENT_ACTIONS = [
  "suspend_user",
  "unsuspend_user",
  "delete_user_account",
  "schedule_account_deletion",
  "delete_job_post",
  "capability_denied",
  "auth.revoke_other_sessions",
  "auth.revoke_all_sessions",
  "auth.mfa_enrolled",
  "auth.mfa_unenrolled",
  "invite_admin",
  "resend_admin_invite",
  "update_admin_capabilities",
  "update_admin_status",
  "update_admin_role",
  "admin_password_reset",
  "delete_admin",
] as const;

/**
 * Audit MFA enroll/unenroll without requireAdmin (AAL2), so enrollment
 * itself can be logged before the session is stepped up.
 */
export async function auditAdminMfaEvent(
  action: "auth.mfa_enrolled" | "auth.mfa_unenrolled",
  metadata?: Record<string, unknown>
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { user } = await requireAuth();
    if (user.app_metadata?.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }
    await emitAuditLog({
      actionType: action,
      targetType: "user",
      targetId: user.id,
      adminId: user.id,
      actorType: "admin",
      metadata: metadata ?? {},
    });
    return { success: true };
  } catch {
    return { success: false, error: "Could not record MFA audit event" };
  }
}

/** Security-capability feed — does not require audit_log. */
export async function fetchSecurityEvents(
  limit = 25
): Promise<AdminAuditLogRow[]> {
  await requireAdminCapability("security");
  const admin = await createAdminClient();
  const capped = Math.min(Math.max(limit, 1), 50);

  const { data, error } = await admin
    .from("audit_logs")
    .select(
      "id, action_type, target_type, target_id, metadata, ip_address, created_at, admin_id, actor_email, actor_display_name, actor_type"
    )
    .in("action_type", [...SECURITY_EVENT_ACTIONS])
    .order("created_at", { ascending: false })
    .limit(capped);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const actorType =
      row.actor_type === "worker" || row.actor_type === "system"
        ? row.actor_type
        : "admin";
    return {
      id: row.id,
      action_type: row.action_type,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata:
        row.metadata &&
        typeof row.metadata === "object" &&
        !Array.isArray(row.metadata)
          ? (row.metadata as Record<string, unknown>)
          : null,
      ip_address: typeof row.ip_address === "string" ? row.ip_address : null,
      created_at: row.created_at,
      admin_id: row.admin_id,
      admin_email: row.actor_email ?? null,
      actor_email: row.actor_email ?? null,
      actor_display_name: row.actor_display_name ?? null,
      actor_avatar_url: null,
      actor_type: actorType,
      target_label: null,
      target_href: null,
    };
  });
}

export type AdminMfaPostureRow = {
  userId: string;
  email: string | null;
  displayName: string;
  adminRole: "moderator" | "superadmin";
  status: string;
  mfaEnrolled: boolean;
  factorCount: number;
};

/** Superadmin-only: which staff have verified TOTP. */
export async function fetchAdminMfaPosture(): Promise<
  | { success: true; rows: AdminMfaPostureRow[] }
  | { success: false; error: string }
> {
  try {
    await requireSuperAdmin();
    const admin = await createAdminClient();

    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("id, email, first_name, last_name, account_status")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    const ids = (profiles ?? []).map((p) => p.id);
    const metaById = new Map<
      string,
      { admin_role: string; display_name: string | null }
    >();

    if (ids.length > 0) {
      const { data: adminProfiles } = await admin
        .from("admin_profiles")
        .select("user_id, admin_role, display_name")
        .in("user_id", ids);
      for (const row of adminProfiles ?? []) {
        metaById.set(row.user_id, {
          admin_role: row.admin_role ?? "moderator",
          display_name: row.display_name,
        });
      }
    }

    const rows: AdminMfaPostureRow[] = await Promise.all(
      (profiles ?? []).map(async (p) => {
        const meta = metaById.get(p.id);
        let mfaEnrolled = false;
        let factorCount = 0;
        try {
          const { data, error } = await admin.auth.admin.mfa.listFactors({
            userId: p.id,
          });
          if (!error && data?.factors) {
            const verified = data.factors.filter(
              (f) => f.factor_type === "totp" && f.status === "verified"
            );
            factorCount = verified.length;
            mfaEnrolled = verified.length > 0;
          }
        } catch {
          // leave defaults
        }

        const nameFromProfile = [p.first_name, p.last_name]
          .filter(Boolean)
          .join(" ")
          .trim();
        const displayName =
          meta?.display_name?.trim() ||
          nameFromProfile ||
          p.email?.split("@")[0] ||
          "Admin";

        return {
          userId: p.id,
          email: p.email ?? null,
          displayName,
          adminRole:
            meta?.admin_role === "superadmin" ? "superadmin" : "moderator",
          status: p.account_status ?? "active",
          mfaEnrolled,
          factorCount,
        };
      })
    );

    return { success: true, rows };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load MFA posture",
    };
  }
}
