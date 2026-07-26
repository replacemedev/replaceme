/**
 * Server-safe parsers for `/signin` account-status query params.
 * Keep this module free of `"use client"` so Server Components can call it.
 */

export type SignInAccountReason = "suspended" | "account_closed";

export function parseSignInAccountReason(
  raw: string | undefined
): SignInAccountReason | null {
  if (raw === "suspended" || raw === "account_closed") return raw;
  return null;
}
