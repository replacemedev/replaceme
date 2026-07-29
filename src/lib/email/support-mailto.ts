/**
 * Build support email links.
 * - mailto: must never use target="_blank" (Brave/Chrome leave a blank "Untitled" tab).
 * - Gmail compose is HTTPS and is safe with target="_blank" when the OS has no mail client.
 */

export function buildSupportMailto(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** Opens Gmail's compose UI in the browser (works when mailto: protocol handlers fail). */
export function buildGmailComposeUrl(email: string, subject: string): string {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: email,
    su: subject,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
