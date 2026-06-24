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

function buildDisplayName(profile: NavProfile, role: UserRole): string {
  if (role === "employer") {
    return (
      profile.company_name ||
      profile.first_name ||
      profile.username ||
      "Employer"
    );
  }
  const fullName = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || profile.username || "Worker";
}

export async function getNavSession(): Promise<NavSession> {
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
    .eq("id", user.id)
    .maybeSingle();

  if (!row?.id || !row.role) return GUEST_NAV_SESSION;

  const role = row.role as UserRole;
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

  return {
    isAuthenticated: true,
    role,
    userId: row.id,
    homeHref: getHomeHrefForRole(role),
    displayName: buildDisplayName(profile, role),
    initials: buildInitials(profile, role),
    avatarUrl: profile.avatar_url,
    isVerified: profile.is_verified,
    unreadMessageCount,
    profile,
  };
}
