import { getSiteUrl } from "@/lib/auth/site-url";

const BRAND = {
  appName: "Replace Me",
  supportEmail: "support@replaceme.ph",
  logoAlt: "Replace Me",
  primary: "#0a4a29",
  accent: "#006e2f",
  accentSoft: "#ebfdf2",
  muted: "#64748b",
  text: "#0f172a",
  body: "#334155",
  border: "rgba(148,163,184,0.35)",
  bg: "#f3f6f4",
  productionSiteUrl: "https://replaceme.ph",
} as const;

function brandLogoUrl(siteUrl?: string): string {
  const base = (siteUrl ?? getSiteUrl()).replace(/\/$/, "");
  return `${base}/images/logo.png`;
}

export function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stripHtml(html: string): string {
  return html
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/p>/gi, "\n\n")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", " ")
    .trim();
}

function ctaButton(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:-0.01em;line-height:1.2;">${escapeHtml(label)}</a>`;
}

/**
 * Shared premium email shell used by transactional + Supabase auth templates.
 * Auth templates pass Go template vars as raw CTA hrefs (do not escape them).
 */
export function renderEmailLayout(input: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  footerNote?: string;
  /** Absolute site origin for logo/footer links (defaults to NEXT_PUBLIC_SITE_URL). */
  siteUrl?: string;
}): { html: string; text: string } {
  const title = escapeHtml(input.title);
  const preheader = escapeHtml(input.preheader ?? "");
  const footerNote = escapeHtml(
    input.footerNote ??
      `If you didn’t expect this email, you can ignore it or contact ${BRAND.supportEmail}.`
  );
  const siteUrl = (input.siteUrl ?? getSiteUrl()).replace(/\/$/, "");
  const logoUrl = brandLogoUrl(siteUrl);
  const year = new Date().getFullYear();

  const text = `${input.title}\n\n${stripHtml(input.bodyHtml)}\n\n${footerNote}\n`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.text};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 4px 24px 4px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:10px;">
                      <img src="${logoUrl}" width="40" height="40" alt="${BRAND.logoAlt}" style="display:block;border:0;border-radius:10px;" />
                    </td>
                    <td style="vertical-align:middle;">
                      <div style="font-weight:800;font-size:20px;letter-spacing:-0.03em;color:${BRAND.primary};line-height:1;">
                        ${BRAND.appName}
                      </div>
                      <div style="font-size:12px;color:${BRAND.muted};margin-top:4px;font-weight:500;">
                        Filipino remote talent, hired directly
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.04);">
                <div style="height:4px;background:linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.accent} 100%);"></div>
                <div style="padding:28px 24px 26px 24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                  <h1 style="margin:0 0 14px 0;font-size:20px;line-height:1.35;color:${BRAND.text};letter-spacing:-0.03em;font-weight:800;">
                    ${title}
                  </h1>
                  <div style="font-size:15px;line-height:1.65;color:${BRAND.body};">
                    ${input.bodyHtml}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 8px 0 8px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                <div style="font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:center;">
                  ${footerNote}
                </div>
                <div style="font-size:11px;line-height:1.5;color:#94a3b8;text-align:center;margin-top:10px;">
                  © ${year} ${BRAND.appName} · <a href="${siteUrl}" style="color:${BRAND.accent};text-decoration:none;">replaceme.ph</a>
                  · <a href="mailto:${BRAND.supportEmail}" style="color:${BRAND.accent};text-decoration:none;">${BRAND.supportEmail}</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
}

export function renderNewApplicationAlertEmail(input: {
  companyName: string;
  jobTitle: string;
  applicantsCount?: number;
  ctaUrl: string;
  planLabel: "Starter" | "Growth" | "Scale";
}): { subject: string; html: string; text: string } {
  const subject = `New applicant for ${input.jobTitle}`;
  const companyName = escapeHtml(input.companyName);
  const jobTitle = escapeHtml(input.jobTitle);
  const countLine =
    typeof input.applicantsCount === "number"
      ? `<p style="margin:0 0 14px 0;">Applicants this week: <strong>${input.applicantsCount}</strong></p>`
      : "";

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Hi ${companyName},</p>
    <p style="margin:0 0 14px 0;">
      You received a new job application for <strong>${jobTitle}</strong>.
    </p>
    ${countLine}
    <p style="margin:0 0 18px 0;">
      ${ctaButton(input.ctaUrl, "Review applicants")}
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};">Plan: <strong style="color:${BRAND.text};">${escapeHtml(input.planLabel)}</strong></p>
  `;

  const { html, text } = renderEmailLayout({
    title: "New application received",
    preheader: `New applicant for ${input.jobTitle}`,
    bodyHtml,
  });

  return { subject, html, text };
}

export function renderEmployerSupportEmail(input: {
  employerName: string;
  employerEmail: string;
  companyName?: string | null;
  planLabel: string;
  subject: string;
  message: string;
}): { subject: string; html: string; text: string } {
  const subject = `[Support · ${input.planLabel}] ${input.subject}`;
  const safeMessage = escapeHtml(input.message).replaceAll("\n", "<br />");
  const companyLine = input.companyName
    ? `<tr><td style="padding:8px 0;color:${BRAND.muted};width:120px;">Company</td><td style="padding:8px 0;color:${BRAND.text};font-weight:600;">${escapeHtml(input.companyName)}</td></tr>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">A paid-plan employer submitted a support request from the Replace Me dashboard.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.accentSoft};border-radius:14px;padding:4px 16px;margin:0 0 18px 0;">
      ${companyLine}
      <tr><td style="padding:8px 0;color:${BRAND.muted};width:120px;">Employer</td><td style="padding:8px 0;color:${BRAND.text};font-weight:600;">${escapeHtml(input.employerName)}</td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.muted};">Reply-to</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(input.employerEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.employerEmail)}</a></td></tr>
      <tr><td style="padding:8px 0;color:${BRAND.muted};">Plan</td><td style="padding:8px 0;color:${BRAND.text};font-weight:600;">${escapeHtml(input.planLabel)}</td></tr>
    </table>
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:0.04em;">Message</p>
    <div style="margin:0;padding:16px 18px;border:1px solid ${BRAND.border};border-radius:14px;background:#fff;color:${BRAND.body};">${safeMessage}</div>
  `;

  const { html, text } = renderEmailLayout({
    title: "Employer support request",
    preheader: `${input.employerName}: ${input.subject}`,
    bodyHtml,
    footerNote: `Reply directly to this email to reach ${input.employerEmail}.`,
  });

  return { subject, html, text };
}

export function renderWorkerNotificationEmail(input: {
  recipientName?: string | null;
  subject: string;
  messageBody: string;
  ctaUrl?: string;
  ctaLabel?: string;
}): { subject: string; html: string; text: string } {
  const greeting = input.recipientName
    ? `Hi ${escapeHtml(input.recipientName)},`
    : "Hi there,";
  const safeMessage = escapeHtml(input.messageBody).replaceAll("\n", "<br />");
  const cta =
    input.ctaUrl && input.ctaLabel
      ? `<p style="margin:22px 0 0 0;">${ctaButton(input.ctaUrl, input.ctaLabel)}</p>`
      : "";

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">${greeting}</p>
    <div style="margin:0 0 8px 0;">${safeMessage}</div>
    ${cta}
  `;

  const { html, text } = renderEmailLayout({
    title: input.subject,
    preheader: input.messageBody.slice(0, 120),
    bodyHtml,
  });

  return { subject: input.subject, html, text };
}

/**
 * HTML for Supabase Dashboard → Auth → Email Templates → Confirm signup.
 * Uses TokenHash so clicks go through /auth/confirm (SSR-safe).
 */
export function getSupabaseConfirmSignupHtml(): string {
  const ctaHref =
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup";

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Welcome to <strong>${BRAND.appName}</strong> — the direct marketplace for Filipino remote talent.</p>
    <p style="margin:0 0 18px 0;">Confirm your email to activate your account and get started.</p>
    <p style="margin:0 0 18px 0;">
      <a href="${ctaHref}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:-0.01em;line-height:1.2;">Confirm email address</a>
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      If the button doesn’t work, paste this link into your browser:<br />
      <span style="word-break:break-all;color:${BRAND.accent};">${ctaHref}</span>
    </p>
  `;

  return renderEmailLayout({
    title: "Confirm your email",
    preheader: "Activate your Replace Me account in one click.",
    bodyHtml,
    footerNote: `This link expires for your security. Need help? ${BRAND.supportEmail}`,
    siteUrl: BRAND.productionSiteUrl,
  }).html;
}

/**
 * HTML for Supabase Dashboard → Auth → Email Templates → Reset password.
 */
export function getSupabaseResetPasswordHtml(): string {
  const ctaHref =
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password";

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">We received a request to reset the password for your <strong>${BRAND.appName}</strong> account.</p>
    <p style="margin:0 0 18px 0;">Choose a new password using the secure link below.</p>
    <p style="margin:0 0 18px 0;">
      <a href="${ctaHref}" style="display:inline-block;background:${BRAND.accent};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:-0.01em;line-height:1.2;">Reset password</a>
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      If you didn’t request a reset, you can safely ignore this email. Your password won’t change.<br /><br />
      Fallback link:<br />
      <span style="word-break:break-all;color:${BRAND.accent};">${ctaHref}</span>
    </p>
  `;

  return renderEmailLayout({
    title: "Reset your password",
    preheader: "Secure link to choose a new Replace Me password.",
    bodyHtml,
    footerNote: `This link expires for your security. Need help? ${BRAND.supportEmail}`,
    siteUrl: BRAND.productionSiteUrl,
  }).html;
}
