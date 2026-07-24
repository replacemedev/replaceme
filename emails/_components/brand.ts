/** Shared brand tokens for Replaceme transactional emails. */
export const BRAND = {
  appName: "Replaceme",
  supportEmail: "support@replaceme.ph",
  primary: "#0a4a29",
  accent: "#006e2f",
  accentSoft: "#ebfdf2",
  muted: "#64748b",
  text: "#0f172a",
  body: "#334155",
  border: "#e2e8f0",
  bg: "#f3f6f4",
  white: "#ffffff",
  siteUrl: "https://replaceme.ph",
  tagline: "Filipino remote talent, hired directly",
} as const;

/** Optimized email logo on Supabase Storage CDN (200×200, ~20KB). */
export const EMAIL_LOGO_CDN_URL =
  "https://dsbfudkacjrpnilqmiuy.supabase.co/storage/v1/object/public/brand-assets/email/logo.png";

export function brandLogoUrl(_siteUrl?: string): string {
  return EMAIL_LOGO_CDN_URL;
}
