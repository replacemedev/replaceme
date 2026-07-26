import { createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";

export type AuditActorType = "admin" | "worker" | "system";

export type AuditActorSnapshot = {
  actorEmail: string | null;
  actorDisplayName: string | null;
  actorType: AuditActorType;
};

/**
 * Resolve denormalized actor fields for audit_logs inserts.
 * Snapshots survive profile / auth user deletion (SOC2 repudiation).
 */
export async function resolveAuditActorSnapshot(
  adminId: string | null | undefined,
  fallbackType: AuditActorType = "system"
): Promise<AuditActorSnapshot> {
  if (!adminId) {
    return {
      actorEmail: null,
      actorDisplayName: null,
      actorType: fallbackType,
    };
  }

  const admin = await createAdminClient();
  const [{ data: profile }, { data: adminProfile }] = await Promise.all([
    admin
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", adminId)
      .maybeSingle(),
    admin
      .from("admin_profiles")
      .select("display_name")
      .eq("user_id", adminId)
      .maybeSingle(),
  ]);

  const fullName = formatFullName(
    profile?.first_name,
    null,
    profile?.last_name
  );
  const displayName =
    (adminProfile?.display_name?.trim() || null) ??
    (fullName.trim() || null) ??
    (profile?.email ?? null);

  return {
    actorEmail: profile?.email ?? null,
    actorDisplayName: displayName,
    actorType: "admin",
  };
}
