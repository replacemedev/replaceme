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

export function brandLogoUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}/images/logo.png`;
}
