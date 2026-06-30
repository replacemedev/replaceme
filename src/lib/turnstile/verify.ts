/**
 * Turnstile is verified by Supabase Auth when CAPTCHA protection is enabled
 * in the Supabase dashboard. The frontend passes `captchaToken` on auth calls;
 * this module only gates presence of the token before those calls run.
 */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

export function requireTurnstileToken(
  token: string | undefined | null
): { success: true; token: string } | { success: false; error: string } {
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

  return { success: true, token: trimmed };
}
