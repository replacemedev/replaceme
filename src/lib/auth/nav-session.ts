"use server";

import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUnreadMessagingCount } from "@/actions/messaging";
import { getHomeHrefForRole } from "@/config/navigation";
import {
  GUEST_NAV_SESSION,
  type NavProfile,
  type NavSession,
  type UserRole,
} from "@/types/nav";

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
  return fullName || profile.username || "Worker";
}

function buildFallbackProfile(
  userId: string,
  user: { user_metadata?: Record<string, unknown> }
): NavProfile {
  return {
    id: userId,
    first_name: (user.user_metadata?.first_name as string | null) ?? null,
    last_name: (user.user_metadata?.last_name as string | null) ?? null,
    username: null,
    avatar_url: null,
    is_verified: false,
  };
}

function buildAuthenticatedSession(
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> },
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

export async function getNavSession(): Promise<NavSession> {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return GUEST_NAV_SESSION;

  const jwtRole = user.app_metadata?.role as UserRole | undefined;

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
    .eq("id", user.id)
    .maybeSingle();

  if (!row?.id) {
    if (jwtRole === "admin") {
      const profile = buildFallbackProfile(user.id, user);
      return buildAuthenticatedSession(user, "admin", profile, 0);
    }
    return GUEST_NAV_SESSION;
  }

  const role = (jwtRole ?? row.role) as UserRole | null;
  if (!role) return GUEST_NAV_SESSION;

  const companyProfiles = row.company_profiles as
    | { company_name: string | null }
    | { company_name: string | null }[]
    | null;
  const companyName = Array.isArray(companyProfiles)
    ? companyProfiles[0]?.company_name ?? null
    : companyProfiles?.company_name ?? null;

  const profile: NavProfile = {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    username: row.username,
    avatar_url: row.avatar_url,
    is_verified: Boolean(row.is_verified),
    company_name: companyName,
  };

  let unreadMessageCount = 0;
  if (role === "worker" || role === "employer") {
    unreadMessageCount = await getUnreadMessagingCount(role);
  }

  return buildAuthenticatedSession(user, role, profile, unreadMessageCount);
}
