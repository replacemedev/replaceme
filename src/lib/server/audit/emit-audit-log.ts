import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { safeError } from "@/utils/logger";

/**
 * Security / product audit helper using the service role so worker and auth
 * actors can write without violating admin-only RLS on audit_logs.
 * Failures are logged but never thrown — audit must not break user flows.
 */
export async function emitAuditLog(params: {
  actionType: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  /** Admin user id when the actor is an admin; otherwise null. */
  adminId?: string | null;
}): Promise<void> {
  try {
    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      null;

    const admin = await createAdminClient();
    const { error } = await admin.from("audit_logs").insert({
      admin_id: params.adminId ?? null,
      action_type: params.actionType,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      metadata: params.metadata ?? {},
      ip_address: ip,
    });

    if (error) {
      safeError("emitAuditLog insert failed:", error);
    }
  } catch (err) {
    safeError("emitAuditLog unexpected:", err);
  }
}
