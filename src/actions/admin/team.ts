"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { logAdminAction } from "@/actions/admin-actions";
import { authCallbackUrl } from "@/lib/auth/site-url";
import { requireSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/server";
import {
  adminTeamUserIdSchema,
  createAdminSchema,
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
  "update_admin_status",
  "update_admin_role",
  "admin_password_reset",
  "delete_admin",
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

  const enriched = await Promise.all(
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

  return enriched;
}

export async function fetchAdminTeam(): Promise<
  AdminFetchResult<AdminTeamRow[]>
> {
  try {
    await requireSuperAdmin();
    const supabase = await createAdminClient();

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, account_status, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

    if (profilesError) {
      return { success: false, error: profilesError.message };
    }

    const adminIds = (profiles ?? []).map((row) => row.id);
    const roleByUserId = new Map<
      string,
      { admin_role: AdminRole; display_name: string | null }
    >();

    if (adminIds.length > 0) {
      const { data: adminProfiles, error: adminProfilesError } = await supabase
        .from("admin_profiles")
        .select("user_id, admin_role, display_name")
        .in("user_id", adminIds);

      if (adminProfilesError) {
        return { success: false, error: adminProfilesError.message };
      }

      for (const row of adminProfiles ?? []) {
        roleByUserId.set(row.user_id, {
          admin_role: row.admin_role,
          display_name: row.display_name,
        });
      }
    }

    const merged = (profiles ?? []).map((profile) => {
      const adminProfile = roleByUserId.get(profile.id);
      return {
        ...profile,
        admin_role: adminProfile?.admin_role ?? ("moderator" as const),
        display_name: adminProfile?.display_name ?? null,
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
        "id, action_type, target_type, target_id, metadata, ip_address, created_at, admin_id"
      )
      .in("action_type", [...TEAM_AUDIT_ACTIONS])
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    const adminIds = [...new Set((data ?? []).map((row) => row.admin_id))];
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

    const logs: AdminAuditLogRow[] = (data ?? []).map((row) => ({
      id: row.id,
      action_type: row.action_type,
      target_type: row.target_type,
      target_id: row.target_id,
      metadata: row.metadata as Record<string, unknown> | null,
      ip_address: row.ip_address,
      created_at: row.created_at,
      admin_email: emailById.get(row.admin_id) ?? null,
    }));

    return { success: true, data: logs };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to load team activity",
    };
  }
}

export async function createAdminUser(
  input: z.infer<typeof createAdminSchema>
): Promise<ActionResult & { userId?: string }> {
  try {
    const { user } = await requireSuperAdmin();
    const parsed = createAdminSchema.parse(input);

    const nameParts = parsed.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "Admin";
    const lastName =
      nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const normalizedEmail = parsed.email.trim().toLowerCase();
    const adminClient = await createAdminClient();

    const { data: created, error: createError } =
      await adminClient.auth.admin.createUser({
        email: normalizedEmail,
        password: parsed.password,
        email_confirm: true,
        app_metadata: { role: "admin" },
        user_metadata: {
          role: "admin",
          username: parsed.username,
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
        return { success: false, error: "An account with this email already exists." };
      }
      if (message.includes("Username") || message.includes("username")) {
        return { success: false, error: "This username is already taken." };
      }
      return { success: false, error: message };
    }

    const newUserId = created.user.id;

    const { error: profileError } = await adminClient.from("admin_profiles").upsert(
      {
        user_id: newUserId,
        admin_role: parsed.admin_role,
        display_name: parsed.fullName.trim(),
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      await adminClient.auth.admin.deleteUser(newUserId);
      return { success: false, error: profileError.message };
    }

    await logAdminAction("create_admin", "admin_profile", newUserId, {
      email: normalizedEmail,
      admin_role: parsed.admin_role,
      created_by: user.id,
    });

    revalidateTeamSurfaces();
    return { success: true, userId: newUserId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create admin",
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

    await db.auth.admin.updateUserById(parsed.userId, {
      ban_duration: parsed.status === "suspended" ? "876000h" : "none",
    });

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

    const { error } = await db
      .from("admin_profiles")
      .upsert(
        {
          user_id: parsed.userId,
          admin_role: parsed.admin_role,
        },
        { onConflict: "user_id" }
      );

    if (error) throw new Error(error.message);

    await logAdminAction("update_admin_role", "admin_profile", parsed.userId, {
      admin_role: parsed.admin_role,
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

    const adminClient = await createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(parsed.userId);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminAction("delete_admin", "admin_profile", parsed.userId, {
      email: target.email,
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
