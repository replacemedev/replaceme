export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  return url.replace(/\/$/, "");
}

export function authCallbackUrl(type: "signup" | "recovery", next: string): string {
  const params = new URLSearchParams({ type, next });
  return `${getSiteUrl()}/auth/callback?${params.toString()}`;
}
