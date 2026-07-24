/**
 * Cloudflare Turnstile server verification (Siteverify API).
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { safeError } from "@/utils/logger";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim());
}

function getTurnstileSecret(): string | undefined {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || undefined;
}

export function isTurnstileSiteverifyConfigured(): boolean {
  return isTurnstileEnabled() && Boolean(getTurnstileSecret());
}

/**
 * When true, Supabase Auth validates the Turnstile token (dashboard CAPTCHA on).
 * The app must NOT also call Cloudflare Siteverify — tokens are single-use and
 * double validation causes `timeout-or-duplicate` from Supabase.
 *
 * Set SUPABASE_AUTH_CAPTCHA_ENABLED=false only if Supabase CAPTCHA is disabled
 * and you want app-side Siteverify via TURNSTILE_SECRET_KEY instead.
 */
export function shouldDeferTurnstileToSupabase(): boolean {
  const flag = process.env.SUPABASE_AUTH_CAPTCHA_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  if (flag === "true" || flag === "1" || flag === "yes") return true;
  // Default: Supabase CAPTCHA is enabled in production when Turnstile widget is on.
  return isTurnstileEnabled();
}

type TurnstileResult =
  | { success: true; token: string }
  | { success: false; error: string };

/**
 * Validate Turnstile token before auth mutations.
 * - No site key → skip (dev / Turnstile off)
 * - `verifyLocally: true` → always Cloudflare Siteverify (signup OTP session path)
 * - Supabase CAPTCHA on → require token presence only; Supabase verifies once
 * - Supabase CAPTCHA off → Cloudflare Siteverify via TURNSTILE_SECRET_KEY
 */
export async function requireTurnstileToken(
  token: string | undefined | null,
  remoteip?: string,
  options?: { verifyLocally?: boolean }
): Promise<TurnstileResult> {
  if (!isTurnstileEnabled()) {
    return { success: true, token: "" };
  }

  const trimmed = token?.trim();
  if (!trimmed) {
    return {
      success: false,
      error: "Please complete the security check before continuing.",
    };
  }

  const verifyLocally =
    options?.verifyLocally === true || !shouldDeferTurnstileToSupabase();

  if (!verifyLocally) {
    return { success: true, token: trimmed };
  }

  const secret = getTurnstileSecret();
  if (!secret) {
    safeError(
      "[Turnstile] TURNSTILE_SECRET_KEY missing — cannot Siteverify. Enable SUPABASE_AUTH_CAPTCHA_ENABLED or add the secret."
    );
    return {
      success: false,
      error: "Security check unavailable. Please try again.",
    };
  }

  try {
    // Cloudflare docs: application/x-www-form-urlencoded is the canonical body
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", trimmed);
    if (remoteip) body.set("remoteip", remoteip);

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      safeError(`[Turnstile] Siteverify HTTP ${res.status}`);
      return {
        success: false,
        error: "Security check unavailable. Please try again.",
      };
    }

    const result = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!result.success) {
      const errorCodes = result["error-codes"] ?? [];
      safeError("[Turnstile] Siteverify rejected", {
        errorCodes,
        httpStatus: res.status,
        remoteipProvided: Boolean(remoteip),
        hint:
          errorCodes.includes("invalid-input-secret") ||
          errorCodes.includes("missing-input-secret")
            ? "Check TURNSTILE_SECRET_KEY matches the Cloudflare widget secret"
            : errorCodes.includes("timeout-or-duplicate")
              ? "Token expired or already consumed — reset the widget and retry with a fresh challenge"
              : errorCodes.includes("invalid-input-response")
                ? "Token expired or hostname mismatch — verify replaceme.ph is in the Turnstile widget hostnames"
                : undefined,
      });
      return {
        success: false,
        error: "Security check failed. Please try again.",
      };
    }

    return { success: true, token: trimmed };
  } catch (err) {
    safeError("[Turnstile] Siteverify error:", err);
    return {
      success: false,
      error: "Security check unavailable. Please try again.",
    };
  }
}
