import { Resend } from "resend";

/** Canonical sender for all Replaceme transactional email. */
export const RESEND_DEFAULT_FROM = "Replaceme <noreply@replaceme.ph>";

export function createResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

/**
 * Prefer RESEND_FROM_EMAIL when set (e.g. staging), otherwise always
 * send as Replaceme &lt;noreply@replaceme.ph&gt;.
 */
export function getResendFromEmail(): string {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (from) return from;
  return RESEND_DEFAULT_FROM;
}

export function getSupportInboxEmail(): string {
  return (
    process.env.SUPPORT_INBOX_EMAIL?.trim() || "support@replaceme.ph"
  );
}
