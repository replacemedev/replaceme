import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VALUE,
  UX_COOKIE_MAX_AGE_SECONDS,
  UX_SIDEBAR_COOKIE,
  UX_THEME_COOKIE,
  hasConsentCookieValue,
  parseSidebarCookie,
  parseThemeCookie,
  type SidebarPreference,
  type ThemePreference,
} from "@/lib/cookies/constants";

export type UxCookieSnapshot = {
  hasConsent: boolean;
  theme: ThemePreference;
  sidebar: SidebarPreference;
};

export type UxPreferencePayload = {
  theme?: ThemePreference;
  sidebarCollapsed?: boolean;
};

function cookieOptions() {
  return {
    path: "/",
    sameSite: "lax" as const,
    maxAge: UX_COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function getUxCookies(): Promise<UxCookieSnapshot> {
  const store = await cookies();
  const consent = store.get(COOKIE_CONSENT_NAME)?.value;
  const theme = store.get(UX_THEME_COOKIE)?.value;
  const sidebar = store.get(UX_SIDEBAR_COOKIE)?.value;

  return {
    hasConsent: hasConsentCookieValue(consent),
    theme: parseThemeCookie(theme),
    sidebar: parseSidebarCookie(sidebar),
  };
}

export function setUxCookieOnResponse(
  response: NextResponse,
  name: string,
  value: string
): void {
  response.cookies.set(name, value, cookieOptions());
}

export function setConsentCookieOnResponse(response: NextResponse): void {
  setUxCookieOnResponse(response, COOKIE_CONSENT_NAME, COOKIE_CONSENT_VALUE);
}

export async function setServerUxCookie(name: string, value: string): Promise<void> {
  const store = await cookies();
  store.set(name, value, cookieOptions());
}

export async function setServerConsentCookie(): Promise<void> {
  await setServerUxCookie(COOKIE_CONSENT_NAME, COOKIE_CONSENT_VALUE);
}

export async function applyUxPreferenceCookies(
  prefs: UxPreferencePayload,
  options?: { force?: boolean; hasConsent?: boolean }
): Promise<void> {
  const hasConsent = options?.hasConsent ?? (await getUxCookies()).hasConsent;
  if (!hasConsent && !options?.force) return;

  if (prefs.theme) {
    await setServerUxCookie(UX_THEME_COOKIE, prefs.theme);
  }

  if (prefs.sidebarCollapsed !== undefined) {
    await setServerUxCookie(
      UX_SIDEBAR_COOKIE,
      prefs.sidebarCollapsed ? "collapsed" : "expanded"
    );
  }
}

export function applyUxPreferenceCookiesOnResponse(
  response: NextResponse,
  prefs: UxPreferencePayload,
  hasConsent: boolean
): void {
  if (!hasConsent) return;

  if (prefs.theme) {
    setUxCookieOnResponse(response, UX_THEME_COOKIE, prefs.theme);
  }

  if (prefs.sidebarCollapsed !== undefined) {
    setUxCookieOnResponse(
      response,
      UX_SIDEBAR_COOKIE,
      prefs.sidebarCollapsed ? "collapsed" : "expanded"
    );
  }
}
