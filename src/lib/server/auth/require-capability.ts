import { cache } from "react";
import { headers } from "next/headers";
import {
  effectiveCapabilities,
  type AdminCapability,
} from "@/lib/admin/capabilities";
import {
  AdminAuthError,
  requireAdmin,
} from "@/lib/server/auth/require-admin";
import { getCurrentAdminProfile } from "@/lib/server/auth/require-super-admin";
import { createAdminClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import { safeError } from "@/utils/logger";

export class AdminCapabilityError extends AdminAuthError {
  readonly capability: AdminCapability;

  constructor(capability: AdminCapability) {
    super(`Unauthorized: missing admin capability "${capability}"`);
    this.name = "AdminCapabilityError";
    this.capability = capability;
  }
}

export const getCurrentAdminCapabilities = cache(
  async (): Promise<{
    adminRole: "moderator" | "superadmin";
    capabilities: AdminCapability[];
    isSuperAdmin: boolean;
  }> => {
    const profile = await getCurrentAdminProfile();
    const adminRole =
      profile?.admin_role === "superadmin" ? "superadmin" : "moderator";
    const capabilities = effectiveCapabilities({
      adminRole,
      capabilities: profile?.capabilities ?? [],
    });
    return {
      adminRole,
      capabilities,
      isSuperAdmin: adminRole === "superadmin",
    };
  }
);

export const currentAdminHasCapability = cache(
  async (capability: AdminCapability): Promise<boolean> => {
    const { capabilities } = await getCurrentAdminCapabilities();
    return capabilities.includes(capability);
  }
);

async function clientIp(): Promise<string | null> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    null
  );
}

async function logDeniedCapability(
  capability: AdminCapability,
  userId: string
): Promise<void> {
  try {
    const ip = await clientIp();
    const admin = await createAdminClient();
    const { resolveAuditActorSnapshot } = await import(
      "@/lib/server/audit/resolve-actor"
    );
    const actor = await resolveAuditActorSnapshot(userId, "admin");
    await admin.from("audit_logs").insert({
      prev_hash: "pending",
      entry_hash: "pending",
      admin_id: userId,
      action_type: "capability_denied",
      target_type: "admin_capability",
      target_id: userId,
      metadata: { capability } as Json,
      ip_address: ip,
      actor_email: actor.actorEmail,
      actor_display_name: actor.actorDisplayName,
      actor_type: actor.actorType,
    });
  } catch (err) {
    safeError("[Auth] capability_denied audit failed:", err);
  }
}

/**
 * Require a module capability. Superadmins always pass.
 * Denied attempts are audit-logged (best-effort).
 */
export const requireAdminCapability = cache(
  async (capability: AdminCapability) => {
    const ctx = await requireAdmin();
    const { capabilities, isSuperAdmin, adminRole } =
      await getCurrentAdminCapabilities();

    if (isSuperAdmin || capabilities.includes(capability)) {
      return { ...ctx, capabilities, isSuperAdmin, adminRole };
    }

    await logDeniedCapability(capability, ctx.user.id);
    throw new AdminCapabilityError(capability);
  }
);
