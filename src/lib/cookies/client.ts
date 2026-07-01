import {
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VALUE,
  UX_COOKIE_MAX_AGE_SECONDS,
  UX_SIDEBAR_COOKIE,
  UX_THEME_COOKIE,
  parseSidebarCookie,
  parseThemeCookie,
  type SidebarPreference,
  type ThemePreference,
} from "@/lib/cookies/constants";

function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

function serializeCookie(name: string, value: string, maxAge = UX_COOKIE_MAX_AGE_SECONDS): string {
  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (isSecureContext()) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const encoded = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(encoded));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(encoded.length));
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = serializeCookie(name, value);
  } catch {
    // Private browsing or disabled cookies.
  }
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  try {
    document.cookie = serializeCookie(name, "", 0);
  } catch {
    // ignore
  }
}

export function hasCookieConsent(): boolean {
  return readCookie(COOKIE_CONSENT_NAME) === COOKIE_CONSENT_VALUE;
}

export function setCookieConsentGranted(): void {
  writeCookie(COOKIE_CONSENT_NAME, COOKIE_CONSENT_VALUE);
}

export function clearCookieConsent(): void {
  deleteCookie(COOKIE_CONSENT_NAME);
}

export function setUxCookie(name: typeof UX_THEME_COOKIE | typeof UX_SIDEBAR_COOKIE, value: string): boolean {
  if (!hasCookieConsent()) return false;
  writeCookie(name, value);
  return true;
}

export function clearUxCookies(): void {
  deleteCookie(UX_THEME_COOKIE);
  deleteCookie(UX_SIDEBAR_COOKIE);
}

export function getClientUxCookies(): {
  hasConsent: boolean;
  theme: ThemePreference;
  sidebar: SidebarPreference;
} {
  return {
    hasConsent: hasCookieConsent(),
    theme: parseThemeCookie(readCookie(UX_THEME_COOKIE)),
    sidebar: parseSidebarCookie(readCookie(UX_SIDEBAR_COOKIE)),
  };
}

export function readClientThemeCookie(): ThemePreference {
  return parseThemeCookie(readCookie(UX_THEME_COOKIE));
}

export function readClientSidebarCookie(): SidebarPreference {
  return parseSidebarCookie(readCookie(UX_SIDEBAR_COOKIE));
}
