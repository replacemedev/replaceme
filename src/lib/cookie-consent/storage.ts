import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";
import {
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent/types";

const ANONYMOUS_ID_KEY = "replace_me_cookie_anonymous_id";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";

  try {
    const existing = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(ANONYMOUS_ID_KEY, id);
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

export function readStoredConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    if (parsed.necessary !== true) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    if (typeof parsed.marketing !== "boolean") return null;
    if (typeof parsed.policyVersion !== "string") return null;
    if (typeof parsed.consentedAt !== "string") return null;

    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      policyVersion: parsed.policyVersion,
      consentedAt: parsed.consentedAt,
      anonymousId:
        typeof parsed.anonymousId === "string" ? parsed.anonymousId : undefined,
    };
  } catch {
    return null;
  }
}

export function writeStoredConsent(preferences: CookieConsentPreferences): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences));
    document.documentElement.setAttribute("data-cookie-consent", "granted");
  } catch {
    // Private browsing or quota exceeded — banner may reappear on reload.
  }
}

export function clearStoredConsent(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    document.documentElement.removeAttribute("data-cookie-consent");
  } catch {
    // ignore
  }
}

export function consentNeedsBanner(preferences: CookieConsentPreferences | null): boolean {
  if (!preferences) return true;
  return preferences.policyVersion !== COOKIE_POLICY_VERSION;
}

export function buildConsent(
  analytics: boolean,
  marketing: boolean,
  anonymousId?: string
): CookieConsentPreferences {
  return {
    necessary: true,
    analytics,
    marketing,
    policyVersion: COOKIE_POLICY_VERSION,
    consentedAt: new Date().toISOString(),
    anonymousId,
  };
}
