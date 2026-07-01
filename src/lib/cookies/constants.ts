export const COOKIE_CONSENT_NAME = "cookie_consent";
export const COOKIE_CONSENT_VALUE = "true";

export const UX_THEME_COOKIE = "rm_theme";
export const UX_SIDEBAR_COOKIE = "rm_sidebar";

export const UX_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export type ThemePreference = "light" | "dark" | "system";
export type SidebarPreference = "expanded" | "collapsed";

export const THEME_PREFERENCES: ThemePreference[] = ["light", "dark", "system"];
export const SIDEBAR_PREFERENCES: SidebarPreference[] = ["expanded", "collapsed"];

export const DEFAULT_THEME: ThemePreference = "system";
export const DEFAULT_SIDEBAR: SidebarPreference = "expanded";

export function parseThemeCookie(value: string | undefined): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return DEFAULT_THEME;
}

export function parseSidebarCookie(value: string | undefined): SidebarPreference {
  if (value === "expanded" || value === "collapsed") {
    return value;
  }
  return DEFAULT_SIDEBAR;
}

export function hasConsentCookieValue(value: string | undefined): boolean {
  return value === COOKIE_CONSENT_VALUE;
}
