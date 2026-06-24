import type { UserRole } from "@/types/nav";

export const ROLE_HOME_PATH: Record<UserRole, string> = {
  worker: "/worker/job-search",
  employer: "/employer/dashboard",
  admin: "/admin/dashboard",
};

export const PUBLIC_HOME_PATH = "/";

export function getHomeHrefForRole(role: UserRole | null | undefined): string {
  if (!role) return PUBLIC_HOME_PATH;
  return ROLE_HOME_PATH[role] ?? PUBLIC_HOME_PATH;
}
