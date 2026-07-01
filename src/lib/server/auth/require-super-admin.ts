import { cache } from "react";
import type { Database } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminAuthError, requireAdmin } from "@/lib/server/auth/require-admin";

export class SuperAdminAuthError extends AdminAuthError {
  constructor(message = "Unauthorized: Super admin access required") {
    super(message);
    this.name = "SuperAdminAuthError";
  }
}

type AdminProfileRow = Database["public"]["Tables"]["admin_profiles"]["Row"];

export const getCurrentAdminProfile = cache(
  async (): Promise<AdminProfileRow | null> => {
    const { user } = await requireAdmin();
    const adminClient = await createAdminClient();

    const { data, error } = await adminClient
      .from("admin_profiles")
      .select(
        "user_id, admin_role, display_name, avatar_url, department, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  }
);

export const isCurrentUserSuperAdmin = cache(async (): Promise<boolean> => {
  const profile = await getCurrentAdminProfile();
  return profile?.admin_role === "superadmin";
});

export const requireSuperAdmin = cache(async () => {
  const ctx = await requireAdmin();
  const adminProfile = await getCurrentAdminProfile();

  if (adminProfile?.admin_role !== "superadmin") {
    throw new SuperAdminAuthError();
  }

  return { ...ctx, adminProfile };
});
