/**
 * Cloudflare Turnstile: require token presence + Siteverify API validation.
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

function getTurnstileSecret(): string | undefined {
  return process.env.TURNSTILE_SECRET_KEY?.trim() || undefined;
}

export async function requireTurnstileToken(
  token: string | undefined | null,
  remoteip?: string
): Promise<{ success: true; token: string } | { success: false; error: string }> {
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
    // ponytail: fail closed when widget is on but secret missing
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Security check is misconfigured. Please try again later.",
      };
    }
    // Dev without secret: presence-only (still pass captchaToken to Supabase)
    return { success: true, token: trimmed };
  }

  try {
    const body: Record<string, string> = {
      secret,
      response: trimmed,
    };
    if (remoteip) body.remoteip = remoteip;

    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!result.success) {
      return {
        success: false,
        error: "Security check failed. Please try again.",
      };
    }

    return { success: true, token: trimmed };
  } catch {
    return {
      success: false,
      error: "Security check unavailable. Please try again.",
    };
  }
}
