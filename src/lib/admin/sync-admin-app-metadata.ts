import type { User } from "@supabase/supabase-js";
import {
  effectiveCapabilities,
  type AdminCapability,
} from "@/lib/admin/capabilities";
import { createAdminClient } from "@/lib/supabase/server";
import { safeError } from "@/utils/logger";

export type AdminAppMetadataPayload = {
  adminRole: "moderator" | "superadmin";
  capabilities: readonly AdminCapability[];
};

function capsEqual(
  a: readonly string[] | undefined,
  b: readonly string[]
): boolean {
  const left = [...(a ?? [])].sort();
  const right = [...b].sort();
  if (left.length !== right.length) return false;
  return left.every((v, i) => v === right[i]);
}

/** Persist admin_role + capabilities into Auth app_metadata for middleware JWT checks. */
export async function syncAdminAppMetadata(
  userId: string,
  payload: AdminAppMetadataPayload
): Promise<void> {
  const admin = await createAdminClient();
  const { data, error: getError } = await admin.auth.admin.getUserById(userId);
  if (getError || !data.user) {
    throw new Error(getError?.message ?? "Admin user not found for metadata sync");
  }

  const existing = (data.user.app_metadata ?? {}) as Record<string, unknown>;
  const capabilities =
    payload.adminRole === "superadmin" ? [] : [...payload.capabilities];

  const { error } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...existing,
      role: "admin",
      admin_role: payload.adminRole,
      capabilities,
    },
  });

  if (error) throw new Error(error.message);
}

/**
 * If JWT admin_role/capabilities drift from admin_profiles, push DB → Auth.
 * Safe to call from the admin shell on every load (no-op when already synced).
 * Returns true when Auth was updated (caller should refresh the session cookie).
 */
export async function ensureAdminAppMetadataSynced(
  user: User,
  fromDb: AdminAppMetadataPayload
): Promise<boolean> {
  const meta = user.app_metadata ?? {};
  const jwtRole =
    meta.admin_role === "superadmin" ? "superadmin" : "moderator";
  const jwtCaps = Array.isArray(meta.capabilities)
    ? (meta.capabilities as string[])
    : [];

  const dbCaps =
    fromDb.adminRole === "superadmin"
      ? []
      : effectiveCapabilities({
          adminRole: fromDb.adminRole,
          capabilities: fromDb.capabilities,
        });

  if (
    meta.role === "admin" &&
    jwtRole === fromDb.adminRole &&
    (fromDb.adminRole === "superadmin" || capsEqual(jwtCaps, dbCaps))
  ) {
    return false;
  }

  try {
    await syncAdminAppMetadata(user.id, {
      adminRole: fromDb.adminRole,
      capabilities: dbCaps,
    });
    return true;
  } catch (err) {
    safeError("[admin] ensureAdminAppMetadataSynced failed:", err);
    return false;
  }
}

export function adminCapabilitiesFromJwt(user: User): {
  adminRole: "moderator" | "superadmin";
  capabilities: AdminCapability[];
  /** False when legacy JWT has no admin_role — middleware should skip cap check. */
  hasJwtCaps: boolean;
} {
  const meta = user.app_metadata ?? {};
  const hasJwtCaps = typeof meta.admin_role === "string";
  const adminRole =
    meta.admin_role === "superadmin" ? "superadmin" : "moderator";
  const raw = Array.isArray(meta.capabilities)
    ? (meta.capabilities as string[])
    : [];
  return {
    adminRole,
    capabilities: effectiveCapabilities({
      adminRole,
      capabilities: raw,
    }),
    hasJwtCaps,
  };
}
