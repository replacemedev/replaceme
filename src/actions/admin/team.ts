"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/actions/admin-actions";
import { authCallbackUrl } from "@/lib/auth/site-url";
import {
  capabilitiesForRole,
  isInvitePending,
  randomInvitePassword,
  sendAdminInviteEmail,
} from "@/lib/admin/team-invite";
import { syncAdminAppMetadata } from "@/lib/admin/sync-admin-app-metadata";
import { requireAdmin } from "@/lib/server/auth/require-admin";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/server";
import {
  adminTeamUserIdSchema,
  inviteAdminSchema,
  updateAdminCapabilitiesSchema,
  updateAdminRoleSchema,
  updateAdminStatusSchema,
} from "@/lib/validations/admin-team";
import {
  adminTeamListSchema,
  type AdminAuditLogRow,
  type AdminFetchResult,
  type AdminRole,
  type AdminTeamRow,
} from "@/types/admin.types";

const TEAM_PATH = "/admin/settings/team";

const TEAM_AUDIT_ACTIONS = [
  "create_admin",
  "invite_admin",
  "resend_admin_invite",
  "revoke_admin_invite",
  "update_admin_status",
  "update_admin_role",
  "update_admin_capabilities",
  "admin_password_reset",
  "delete_admin",
  "capability_denied",
  "view_admin_personal_details",
] as const;

type ActionResult = { success: true } | { success: false; error: string };

async function getTeamDbClient() {
  await requireSuperAdmin();
  return createAdminClient();
}

function revalidateTeamSurfaces() {
  revalidatePath(TEAM_PATH);
  revalidatePath("/admin/users");
  revalidatePath("/admin/audit-log");
}

async function assertTargetAdmin(
  userId: string
): Promise<{ id: string; email: string | null; account_status: string }> {
  const supabase = await getTeamDbClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, account_status")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data || data.role !== "admin") {
    throw new Error("Target user is not an admin account.");
  }

  return {
    id: data.id,
    email: data.email,
    account_status: data.account_status,
  };
}

async function countActiveSuperadmins(): Promise<number> {
  const supabase = await getTeamDbClient();

  const { data: superadminRows, error: roleError } = await supabase
    .from("admin_profiles")
    .select("user_id")
    .eq("admin_role", "superadmin");

  if (roleError) throw new Error(roleError.message);

  const ids = (superadminRows ?? []).map((row) => row.user_id);
  if (ids.length === 0) return 0;

  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("id", ids)
    .eq("account_status", "active");

  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function assertNotLastSuperadmin(userId: string): Promise<void> {
  const supabase = await getTeamDbClient();

  const { data: profile, error } = await supabase
    .from("admin_profiles")
    .select("admin_role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (profile?.admin_role !== "superadmin") return;

  const activeCount = await countActiveSuperadmins();
  if (activeCount <= 1) {
    throw new Error("Cannot remove or demote the last active super admin.");
  }
}

async function enrichWithLastSignIn(
  rows: AdminTeamRow[]
): Promise<AdminTeamRow[]> {
  if (rows.length === 0) return rows;

  const adminClient = await createAdminClient();

  return Promise.all(
    rows.map(async (row) => {
      const { data, error } = await adminClient.auth.admin.getUserById(row.id);
      if (error) {
        return { ...row, last_sign_in_at: null };
      }
      return {
        ...row,
        last_sign_in_at: data.user.last_sign_in_at ?? null,
      };
    })
  );
}

export async function fetchAdminTeam(): Promise<
  AdminFetchResult<AdminTeamRow[]>
> {
  try {
    await requireSuperAdmin();
    const supabase = await createAdminClient();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, email, account_status, created_at, avatar_url"
      )
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    const adminIds = (profiles ?? []).map((row) => row.id);
    const metaByUserId = new Map<
      string,
      {
        admin_role: AdminRole;
        display_name: string | null;
        department: string | null;
        avatar_url: string | null;
        capabilities: string[];
        invited_at: string | null;
        invite_accepted_at: string | null;
      }
    >();

    if (adminIds.length > 0) {
      const { data: adminProfiles, error: adminProfilesError } = await supabase
        .from("admin_profiles")
        .select(
          "user_id, admin_role, display_name, department, avatar_url, capabilities, invited_at, invite_accepted_at"
        )
        .in("user_id", adminIds);

      if (adminProfilesError) {
        return { success: false, error: adminProfilesError.message };
      }

      for (const row of adminProfiles ?? []) {
        metaByUserId.set(row.user_id, {
          admin_role: row.admin_role,
          display_name: row.display_name,
          department: row.department,
          avatar_url: row.avatar_url,
          capabilities: row.capabilities ?? [],
          invited_at: row.invited_at,
          invite_accepted_at: row.invite_accepted_at,
        });
      }
    }

    const merged = (profiles ?? []).map((profile) => {
      const meta = metaByUserId.get(profile.id);
      return {
        ...profile,
        admin_role: meta?.admin_role ?? ("moderator" as const),
        display_name: meta?.display_name ?? null,
        department: meta?.department ?? null,
        avatar_url: profile.avatar_url ?? meta?.avatar_url ?? null,
        capabilities: meta?.capabilities ?? [],
        invited_at: meta?.invited_at ?? null,
        invite_accepted_at: meta?.invite_accepted_at ?? null,
        last_sign_in_at: null,
      };
    });

    const parsed = adminTeamListSchema.safeParse(merged);
    if (!parsed.success) {
      return {
        success: false,
        error: "Admin team records failed validation.",
      };
    }

    const withSignIn = await enrichWithLastSignIn(parsed.data);
    return { success: true, data: withSignIn };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load admin team",
    };
  }
}

export async function fetchAdminTeamActivity(
  limit = 50
): Promise<AdminFetchResult<AdminAuditLogRow[]>> {
  try {
    await requireSuperAdmin();
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        "id, action_type, target_type, target_id, metadata, ip_address, created_at, admin_id, actor_email, actor_display_name, actor_type"
      )
      .in("action_type", [...TEAM_AUDIT_ACTIONS])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    const adminIds = [
      ...new Set(
        (data ?? [])
          .map((row) => row.admin_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      ),
    ];

    type LiveActor = {
      email: string | null;
      displayName: string | null;
      avatarUrl: string | null;
    };
    const actorById = new Map<string, LiveActor>();

    if (adminIds.length > 0) {
      const [{ data: profiles }, { data: adminProfiles }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, email, first_name, last_name, avatar_url")
          .in("id", adminIds),
        supabase
          .from("admin_profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", adminIds),
      ]);
      const metaById = new Map(
        (adminProfiles ?? []).map((m) => [m.user_id, m] as const)
      );
      for (const p of profiles ?? []) {
        const meta = metaById.get(p.id);
        const fullName = [p.first_name, p.last_name]
          .filter(Boolean)
          .join(" ");
        actorById.set(p.id, {
          email: p.email ?? null,
          displayName:
            meta?.display_name?.trim() || fullName.trim() || p.email || null,
          avatarUrl: p.avatar_url ?? meta?.avatar_url ?? null,
        });
      }
    }

    const { resolveAuditTarget } = await import("@/lib/admin/audit-target");

    const logs: AdminAuditLogRow[] = (data ?? []).map((row) => {
      const live = row.admin_id ? actorById.get(row.admin_id) : undefined;
      const actorEmail = live?.email ?? row.actor_email ?? null;
      const actorDisplayName =
        live?.displayName ?? row.actor_display_name ?? null;
      const actorType =
        row.actor_type === "admin" ||
        row.actor_type === "worker" ||
        row.actor_type === "system"
          ? row.actor_type
          : row.admin_id
            ? "admin"
            : "system";
      const resolved = resolveAuditTarget(row.target_type, row.target_id);

      return {
        id: row.id,
        action_type: row.action_type,
        target_type: row.target_type,
        target_id: row.target_id,
        metadata: row.metadata as Record<string, unknown> | null,
        ip_address:
          typeof row.ip_address === "string" ? row.ip_address : null,
        created_at: row.created_at,
        admin_id: row.admin_id,
        admin_email: actorEmail,
        actor_email: actorEmail,
        actor_display_name: actorDisplayName,
        actor_avatar_url: live?.avatarUrl ?? null,
        actor_type: actorType,
        target_label: resolved.label,
        target_href: resolved.href,
      };
    });

    return { success: true, data: logs };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load team activity",
    };
  }
}

export async function inviteAdminUser(
  input: z.infer<typeof inviteAdminSchema>
): Promise<ActionResult & { userId?: string }> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = inviteAdminSchema.parse(input);

    const nameParts = parsed.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "Admin";
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const normalizedEmail = parsed.email.trim().toLowerCase();
    const adminClient = await createAdminClient();
    const capabilities = capabilitiesForRole(
      parsed.admin_role,
      parsed.capabilities
    );
    const now = new Date().toISOString();

    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: randomInvitePassword(),
        email_confirm: true,
        app_metadata: {
          role: "admin",
          admin_role: parsed.admin_role,
          capabilities:
            parsed.admin_role === "superadmin" ? [] : capabilities,
        },
        user_metadata: {
          role: "admin",
          first_name: firstName,
          last_name: lastName,
          full_name: parsed.fullName.trim(),
        },
      });

    if (createError || !created.user) {
      const message = createError?.message ?? "Failed to create admin user.";
      if (
        message.includes("already registered") ||
        message.includes("already exists")
      ) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }
      return { success: false, error: message };
    }

    const newUserId = created.user.id;

    const { error: profileError } = await adminClient
      .from("admin_profiles")
      .upsert(
        {
          user_id: newUserId,
          admin_role: parsed.admin_role,
          display_name: parsed.fullName.trim(),
          capabilities,
          invited_at: now,
          invite_accepted_at: null,
        },
        { onConflict: "user_id" }
      );

    if (profileError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return { success: false, error: profileError.message };
    }

    const emailed = await sendAdminInviteEmail({
      email: normalizedEmail,
      fullName: parsed.fullName.trim(),
      userId: newUserId,
    });

    if (!emailed.success) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return {
        success: false,
        error: emailed.error || "Invite created but email failed to send.",
      };
    }

    await logAdminAction("invite_admin", "admin_profile", newUserId, {
      email: normalizedEmail,
      admin_role: parsed.admin_role,
      capabilities,
      created_by: user.id,
    });

    revalidateTeamSurfaces();
    return { success: true, userId: newUserId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to invite admin",
    };
  }
}

/** @deprecated Prefer inviteAdminUser */
export async function createAdminUser(
  input: z.infer<typeof inviteAdminSchema>
): Promise<ActionResult & { userId?: string }> {
  return inviteAdminUser(input);
}

export async function resendAdminInvite(
  input: z.infer<typeof adminTeamUserIdSchema>
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const parsed = adminTeamUserIdSchema.parse(input);
    const target = await assertTargetAdmin(parsed.userId);

    if (!target.email) {
      return { success: false, error: "Admin account has no email on file." };
    }

    const db = await getTeamDbClient();
    const { data: profile, error } = await db
      .from("admin_profiles")
      .select("display_name, invited_at, invite_accepted_at")
      .eq("user_id", parsed.userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (profile?.invite_accepted_at) {
      return {
        success: false,
        error: "This admin already accepted their invite. Use password reset instead.",
      };
    }

    const emailed = await sendAdminInviteEmail({
      email: target.email,
      fullName: profile?.display_name || target.email,
      userId: parsed.userId,
    });

    if (!emailed.success) {
      return { success: false, error: emailed.error };
    }

    const now = new Date().toISOString();
    await db
      .from("admin_profiles")
      .update({ invited_at: now })
      .eq("user_id", parsed.userId);

    await logAdminAction("resend_admin_invite", "admin_profile", parsed.userId, {
      email: target.email,
    });

    revalidateTeamSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to resend admin invite",
    };
  }
}

export async function updateAdminCapabilities(
  input: z.infer<typeof updateAdminCapabilitiesSchema>
): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = updateAdminCapabilitiesSchema.parse(input);

    if (parsed.userId === user.id) {
      return {
        success: false,
        error: "You cannot change your own role or capabilities here.",
      };
    }

    await assertTargetAdmin(parsed.userId);

    const db = await getTeamDbClient();
    const { data: current, error: currentError } = await db
      .from("admin_profiles")
      .select("admin_role")
      .eq("user_id", parsed.userId)
      .maybeSingle();

    if (currentError) throw new Error(currentError.message);

    if (
      current?.admin_role === "superadmin" &&
      parsed.admin_role !== "superadmin"
    ) {
      await assertNotLastSuperadmin(parsed.userId);
    }

    const capabilities = capabilitiesForRole(
      parsed.admin_role,
      parsed.capabilities
    );

    const { error } = await db.from("admin_profiles").upsert(
      {
        user_id: parsed.userId,
        admin_role: parsed.admin_role,
        capabilities,
      },
      { onConflict: "user_id" }
    );

    if (error) throw new Error(error.message);

    await syncAdminAppMetadata(parsed.userId, {
      adminRole: parsed.admin_role,
      capabilities,
    });

    await logAdminAction(
      "update_admin_capabilities",
      "admin_profile",
      parsed.userId,
      {
        admin_role: parsed.admin_role,
        capabilities,
      }
    );

    revalidateTeamSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to update admin access",
    };
  }
}

export async function updateAdminStatus(
  input: z.infer<typeof updateAdminStatusSchema>
): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = updateAdminStatusSchema.parse(input);

    if (parsed.userId === user.id) {
      return { success: false, error: "You cannot change your own account status." };
    }

    const target = await assertTargetAdmin(parsed.userId);

    if (parsed.status === "suspended") {
      await assertNotLastSuperadmin(parsed.userId);
    }

    const db = await getTeamDbClient();
    const { error } = await db
      .from("profiles")
      .update({ account_status: parsed.status })
      .eq("id", parsed.userId);

    if (error) throw new Error(error.message);

    const { error: banError } = await db.auth.admin.updateUserById(
      parsed.userId,
      {
        ban_duration: parsed.status === "suspended" ? "876000h" : "none",
      }
    );
    if (banError) {
      throw new Error(`Auth ban update failed: ${banError.message}`);
    }

    await logAdminAction("update_admin_status", "admin_profile", parsed.userId, {
      status: parsed.status,
      reason: parsed.reason ?? null,
      email: target.email,
    });

    revalidateTeamSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update admin status",
    };
  }
}

export async function updateAdminRole(
  input: z.infer<typeof updateAdminRoleSchema>
): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = updateAdminRoleSchema.parse(input);

    if (parsed.userId === user.id) {
      return { success: false, error: "You cannot change your own admin role." };
    }

    await assertTargetAdmin(parsed.userId);

    const db = await getTeamDbClient();
    const { data: current, error: currentError } = await db
      .from("admin_profiles")
      .select("admin_role, capabilities")
      .eq("user_id", parsed.userId)
      .maybeSingle();

    if (currentError) throw new Error(currentError.message);

    if (
      current?.admin_role === "superadmin" &&
      parsed.admin_role !== "superadmin"
    ) {
      await assertNotLastSuperadmin(parsed.userId);
    }

    const capabilities =
      parsed.admin_role === "superadmin"
        ? []
        : capabilitiesForRole(
            "moderator",
            current?.capabilities ?? undefined
          );

    const { error } = await db.from("admin_profiles").upsert(
      {
        user_id: parsed.userId,
        admin_role: parsed.admin_role,
        capabilities,
      },
      { onConflict: "user_id" }
    );

    if (error) throw new Error(error.message);

    await syncAdminAppMetadata(parsed.userId, {
      adminRole: parsed.admin_role,
      capabilities,
    });

    await logAdminAction("update_admin_role", "admin_profile", parsed.userId, {
      admin_role: parsed.admin_role,
      capabilities,
    });

    revalidateTeamSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update admin role",
    };
  }
}

export async function triggerOwnPasswordReset(): Promise<ActionResult> {
  try {
    const { user } = await requireAdmin();

    if (!user.email) {
      return { success: false, error: "Admin account has no email on file." };
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.auth.resetPasswordForEmail(user.email, {
      redirectTo: authCallbackUrl("recovery", "/update-password"),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction("admin_password_reset", "admin_profile", user.id, {
      email: user.email,
      initiated_by: "self",
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to send password reset",
    };
  }
}

export async function triggerAdminPasswordReset(
  input: z.infer<typeof adminTeamUserIdSchema>
): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const parsed = adminTeamUserIdSchema.parse(input);
    const target = await assertTargetAdmin(parsed.userId);

    if (!target.email) {
      return { success: false, error: "Admin account has no email on file." };
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.auth.resetPasswordForEmail(
      target.email,
      { redirectTo: authCallbackUrl("recovery", "/update-password") }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction(
      "admin_password_reset",
      "admin_profile",
      parsed.userId,
      { email: target.email }
    );

    revalidateTeamSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to send password reset",
    };
  }
}

export async function deleteAdminUser(
  input: z.infer<typeof adminTeamUserIdSchema>
): Promise<ActionResult> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = adminTeamUserIdSchema.parse(input);

    if (parsed.userId === user.id) {
      return { success: false, error: "You cannot delete your own admin account." };
    }

    const target = await assertTargetAdmin(parsed.userId);
    await assertNotLastSuperadmin(parsed.userId);

    const db = await getTeamDbClient();
    const { data: profile } = await db
      .from("admin_profiles")
      .select("invited_at, invite_accepted_at")
      .eq("user_id", parsed.userId)
      .maybeSingle();

    // Hard delete only for never-accepted invites; use Suspend for soft offboard.
    if (!isInvitePending(profile ?? {})) {
      return {
        success: false,
        error:
          "Suspend this admin instead of deleting. Hard delete is only for pending invites.",
      };
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(parsed.userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction("revoke_admin_invite", "admin_profile", parsed.userId, {
      email: target.email,
      pending_invite: true,
    });

    revalidateTeamSurfaces();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete admin",
    };
  }
}

/** Pending-invite revocation (same hard-delete path; clearer audit/API name). */
export async function revokeAdminInvite(
  input: z.infer<typeof adminTeamUserIdSchema>
): Promise<ActionResult> {
  return deleteAdminUser(input);
}

export type AdminTeamMemberDeepDive = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  avatarUrl: string | null;
  displayName: string | null;
  department: string | null;
  adminRole: AdminRole;
  capabilities: string[];
  accountStatus: string;
  mfaEnrolled: boolean;
  mfaFactorCount: number;
  lastSignInAt: string | null;
  lastSignInIp: string | null;
  createdAt: string;
  invitedAt: string | null;
  inviteAcceptedAt: string | null;
};

/** Super-admin only: extended PII + security posture for an internal team member. */
export async function getAdminTeamMemberDeepDive(
  userId: string
): Promise<AdminFetchResult<AdminTeamMemberDeepDive>> {
  try {
    await requireSuperAdmin();
    const id = z.string().uuid().parse(userId);
    const supabase = await createAdminClient();

    const [profileResult, adminProfileResult, authResult, auditResult] =
      await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, first_name, last_name, email, avatar_url, account_status, created_at"
          )
          .eq("id", id)
          .eq("role", "admin")
          .maybeSingle(),
        supabase
          .from("admin_profiles")
          .select(
            "admin_role, display_name, department, avatar_url, capabilities, invited_at, invite_accepted_at"
          )
          .eq("user_id", id)
          .maybeSingle(),
        supabase.auth.admin.getUserById(id),
        supabase
          .from("audit_logs")
          .select("ip_address")
          .eq("admin_id", id)
          .not("ip_address", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    if (profileResult.error) {
      return { success: false, error: profileResult.error.message };
    }
    if (!profileResult.data) {
      return { success: false, error: "Admin account not found." };
    }

    const profile = profileResult.data;
    const meta = adminProfileResult.data;
    let mfaEnrolled = false;
    let mfaFactorCount = 0;

    try {
      const { data: factorsData, error: factorsError } =
        await supabase.auth.admin.mfa.listFactors({ userId: id });
      if (!factorsError && factorsData?.factors) {
        const verified = factorsData.factors.filter(
          (f) => f.factor_type === "totp" && f.status === "verified"
        );
        mfaFactorCount = verified.length;
        mfaEnrolled = verified.length > 0;
      }
    } catch {
      // leave MFA defaults
    }

    const lastSignInIp =
      typeof auditResult.data?.ip_address === "string"
        ? auditResult.data.ip_address
        : null;

    await logAdminAction("view_admin_personal_details", "admin_profile", id, {
      email: profile.email,
    });

    return {
      success: true,
      data: {
        id: profile.id,
        firstName: profile.first_name ?? null,
        lastName: profile.last_name ?? null,
        email: profile.email ?? null,
        avatarUrl: profile.avatar_url ?? meta?.avatar_url ?? null,
        displayName: meta?.display_name ?? null,
        department: meta?.department ?? null,
        adminRole:
          meta?.admin_role === "superadmin" ? "superadmin" : "moderator",
        capabilities: meta?.capabilities ?? [],
        accountStatus: profile.account_status ?? "active",
        mfaEnrolled,
        mfaFactorCount,
        lastSignInAt: authResult.data.user?.last_sign_in_at ?? null,
        lastSignInIp,
        createdAt: profile.created_at,
        invitedAt: meta?.invited_at ?? null,
        inviteAcceptedAt: meta?.invite_accepted_at ?? null,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to load admin personal details",
    };
  }
}
