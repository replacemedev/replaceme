import { readStoredConsent } from "@/lib/cookie-consent/storage";

export function hasAnalyticsConsent(): boolean {
  return readStoredConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return readStoredConsent()?.marketing === true;
}
