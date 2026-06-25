import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUnreadMessagingCount } from "@/actions/messaging";
import { getHomeHrefForRole } from "@/config/navigation";
import {
  GUEST_NAV_SESSION,
  type NavProfile,
  type NavSession,
  type UserRole,
} from "@/types/nav";

const VALID_ROLES: UserRole[] = ["worker", "employer", "admin"];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && VALID_ROLES.includes(value as UserRole);
}

function resolveRoleFromUser(user: User, profileRole?: string | null): UserRole {
  const appRole = user.app_metadata?.role;
  if (isUserRole(appRole)) return appRole;

  if (isUserRole(profileRole)) return profileRole;

  const metaRole = user.user_metadata?.role;
  if (isUserRole(metaRole)) return metaRole;

  return "worker";
}

function buildInitials(profile: NavProfile, role: UserRole): string {
  if (profile.first_name) return profile.first_name[0].toUpperCase();
  if (role === "employer" && profile.company_name) {
    return profile.company_name[0].toUpperCase();
  }
  if (profile.username) return profile.username[0].toUpperCase();
  return role === "employer" ? "E" : role === "admin" ? "A" : "W";
}

function buildDisplayName(
  profile: NavProfile,
  role: UserRole,
  email?: string | null
): string {
  if (role === "employer") {
    return (
      profile.company_name ||
      profile.first_name ||
      profile.username ||
      email?.split("@")[0] ||
      "Employer"
    );
  }
  if (role === "admin") {
    const fullName = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return fullName || profile.username || email?.split("@")[0] || "Admin";
  }
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || profile.username || email?.split("@")[0] || "Worker";
}

function buildFallbackProfile(user: User): NavProfile {
  const meta = user.user_metadata ?? {};
  const fullName = typeof meta.full_name === "string" ? meta.full_name : "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    id: user.id,
    first_name:
      (typeof meta.first_name === "string" ? meta.first_name : null) ??
      nameParts[0] ??
      null,
    last_name:
      (typeof meta.last_name === "string" ? meta.last_name : null) ??
      (nameParts.length > 1 ? nameParts.slice(1).join(" ") : null),
    username: typeof meta.username === "string" ? meta.username : null,
    avatar_url: null,
    is_verified: false,
    company_name:
      typeof meta.company_name === "string" ? meta.company_name : null,
  };
}

function buildAuthenticatedSession(
  user: User,
  role: UserRole,
  profile: NavProfile,
  unreadMessageCount: number
): NavSession {
  return {
    isAuthenticated: true,
    role,
    userId: user.id,
    homeHref: getHomeHrefForRole(role),
    displayName: buildDisplayName(profile, role, user.email),
    initials: buildInitials(profile, role),
    avatarUrl: profile.avatar_url,
    isVerified: profile.is_verified,
    unreadMessageCount,
    profile,
  };
}

async function loadUnreadCount(role: UserRole): Promise<number> {
  if (role !== "worker" && role !== "employer") return 0;
  try {
    return await getUnreadMessagingCount(role);
  } catch {
    return 0;
  }
}

type ProfileRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  is_verified: boolean | null;
  company_profiles:
    | { company_name: string | null }
    | { company_name: string | null }[]
    | null;
};

function mapProfileRow(row: ProfileRow): NavProfile {
  const companyProfiles = row.company_profiles;
  const companyName = Array.isArray(companyProfiles)
    ? companyProfiles[0]?.company_name ?? null
    : companyProfiles?.company_name ?? null;

  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    username: row.username,
    avatar_url: row.avatar_url,
    is_verified: Boolean(row.is_verified),
    company_name: companyName,
  };
}

export const getNavSession = cache(async (): Promise<NavSession> => {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return GUEST_NAV_SESSION;

  const { data: row } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      username,
      avatar_url,
      role,
      is_verified,
      company_profiles (
        company_name
      )
    `
    )
    .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
    .maybeSingle();

  const role = resolveRoleFromUser(user, row?.role);
  const profile = row?.id ? mapProfileRow(row as ProfileRow) : buildFallbackProfile(user);
  const unreadMessageCount = await loadUnreadCount(role);

  return buildAuthenticatedSession(user, role, profile, unreadMessageCount);
});
