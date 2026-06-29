export type CookieConsentAction =
  | "accept_all"
  | "reject_non_essential"
  | "save_preferences"
  | "withdraw";

export interface CookieConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  policyVersion: string;
  consentedAt: string;
  anonymousId?: string;
}

export const COOKIE_CONSENT_STORAGE_KEY = "replace_me_cookie_consent";
export const COOKIE_CONSENT_OPEN_EVENT = "cookie-consent:open";
