export type UserRole = "worker" | "employer" | "admin";

export interface NavProfile {
  id: string;
  first_name: string | null;
  middle_name?: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  company_name?: string | null;
  company_logo_url?: string | null;
}

export interface NavSession {
  isAuthenticated: boolean;
  role: UserRole | null;
  userId: string | null;
  homeHref: string;
  displayName: string;
  initials: string;
  avatarUrl: string | null;
  isVerified: boolean;
  unreadMessageCount: number;
  profile: NavProfile | null;
}

export const GUEST_NAV_SESSION: NavSession = {
  isAuthenticated: false,
  role: null,
  userId: null,
  homeHref: "/",
  displayName: "",
  initials: "",
  avatarUrl: null,
  isVerified: false,
  unreadMessageCount: 0,
  profile: null,
};
