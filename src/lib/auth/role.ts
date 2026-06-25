import type { User } from "@supabase/supabase-js";

export type AppRole = "worker" | "employer" | "admin";

const VALID_ROLES: AppRole[] = ["worker", "employer", "admin"];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && VALID_ROLES.includes(value as AppRole);
}

/** JWT app_metadata → profiles.role → user_metadata (signup) → worker */
export function resolveRoleFromUser(
  user: User,
  profileRole?: string | null
): AppRole {
  const appRole = user.app_metadata?.role;
  if (isAppRole(appRole)) return appRole;

  if (isAppRole(profileRole)) return profileRole;

  const metaRole = user.user_metadata?.role;
  if (isAppRole(metaRole)) return metaRole;

  return "worker";
}

export const profileIdFilter = (userId: string) =>
  `id.eq.${userId},auth_user_id.eq.${userId}`;
