/**
 * Cloudflare Turnstile server verification (Siteverify API).
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { safeError, safeLog } from "@/utils/logger";

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

type TurnstileResult =
  | { success: true; token: string }
  | { success: false; error: string };

/**
 * Validate Turnstile token before auth mutations.
 * - No site key → skip (dev / Turnstile off)
 * - Site key + secret → Cloudflare Siteverify (required)
 * - Site key only → require token presence; pass through to Supabase captchaToken
 *   (does not brick login when Vercel secret env is missing)
 */
export async function requireTurnstileToken(
  token: string | undefined | null,
  remoteip?: string
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

  const secret = getTurnstileSecret();
  if (!secret) {
    safeError(
      "[Turnstile] TURNSTILE_SECRET_KEY missing — presence-only check. Add the secret in Vercel for Siteverify."
    );
    return { success: true, token: trimmed };
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
      safeLog(
        `[Turnstile] Siteverify rejected: ${(result["error-codes"] ?? []).join(",")}`
      );
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
