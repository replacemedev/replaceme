import { cache } from "react";
import type { Database } from "@/types/database";
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
    const { supabase, user } = await requireAdmin();

    const { data, error } = await supabase
      .from("admin_profiles")
      .select(
        "user_id, admin_role, display_name, avatar_url, department, created_at, updated_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new SuperAdminAuthError(
        `Failed to load admin profile: ${error.message}`
      );
    }

    return data;
  }
);

export const isCurrentUserSuperAdmin = cache(async (): Promise<boolean> => {
  try {
    const profile = await getCurrentAdminProfile();
    return profile?.admin_role === "superadmin";
  } catch {
    return false;
  }
});

export const requireSuperAdmin = cache(async () => {
  const ctx = await requireAdmin();
  const adminProfile = await getCurrentAdminProfile();

  if (adminProfile?.admin_role !== "superadmin") {
    throw new SuperAdminAuthError();
  }

  return { ...ctx, adminProfile };
});
