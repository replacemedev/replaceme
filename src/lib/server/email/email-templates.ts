import { getSiteUrl } from "@/lib/auth/site-url";

const BRAND = {
  appName: "Replaceme",
  supportEmail: "support@replaceme.ph",
  logoAlt: "Replaceme",
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

/** Optimized email logo on Supabase Storage CDN (200×200, ~20KB). */
const EMAIL_LOGO_CDN_URL =
  "https://dsbfudkacjrpnilqmiuy.supabase.co/storage/v1/object/public/brand-assets/email/logo.png";

function brandLogoUrl(_siteUrl?: string): string {
  return EMAIL_LOGO_CDN_URL;
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
                      <img src="${logoUrl}" width="40" height="40" alt="${BRAND.logoAlt}" style="display:block;border:0;border-radius:10px;max-width:100%;height:auto;" />
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
    <p style="margin:0 0 16px 0;">A paid-plan employer submitted a support request from the Replaceme dashboard.</p>
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

function detailRow(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:8px 0;color:${BRAND.muted};width:132px;vertical-align:top;font-size:14px;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;color:${BRAND.text};font-weight:600;font-size:14px;vertical-align:top;">${valueHtml}</td>
  </tr>`;
}

function detailCard(rowsHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.accentSoft};border-radius:14px;padding:4px 16px;margin:0 0 18px 0;">
    ${rowsHtml}
  </table>`;
}

function sectionLabel(label: string): string {
  return `<p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:${BRAND.primary};text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(label)}</p>`;
}

function retentionListHtml(
  rows: ReadonlyArray<{ category: string; period: string }>
): string {
  const items = rows
    .map(
      (row) =>
        `<li style="margin:0 0 8px 0;"><strong style="color:${BRAND.text};">${escapeHtml(row.category)}:</strong> ${escapeHtml(row.period)}</li>`
    )
    .join("");
  return `<div style="margin:0 0 18px 0;padding:14px 16px;border:1px solid ${BRAND.border};border-radius:14px;background:#fff;">
    <ul style="margin:0;padding-left:18px;color:${BRAND.body};font-size:14px;line-height:1.55;">${items}</ul>
  </div>`;
}

/** Job post rejected by Trust & Safety — reason category + optional detail for employer. */
export function renderJobRejectedEmail(input: {
  companyName?: string | null;
  jobTitle: string;
  categoryLabel: string;
  reason?: string | null;
  ctaUrl: string;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = `Job post not approved: ${input.jobTitle}`;
  const greeting = input.companyName
    ? `Hi ${escapeHtml(input.companyName)},`
    : "Hi there,";
  const reasonBlock = input.reason?.trim()
    ? `${sectionLabel("Notes")}
    <div style="margin:0 0 18px 0;padding:14px 16px;border:1px solid ${BRAND.border};border-radius:14px;background:#fff;color:${BRAND.body};font-size:14px;line-height:1.55;">${escapeHtml(input.reason).replaceAll("\n", "<br />")}</div>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">
      Your job post <strong>${escapeHtml(input.jobTitle)}</strong> was reviewed and is not approved for publication. It has been closed and is hidden from workers.
    </p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:#b91c1c;">Not approved</span>`)}
      ${detailRow("Reason", escapeHtml(input.categoryLabel))}
    `)}
    ${reasonBlock}
    <p style="margin:0 0 18px 0;">
      You may edit the listing to address the issue and submit a new post for review. For appeals or questions, contact support.
    </p>
    <p style="margin:0 0 18px 0;">
      ${ctaButton(input.ctaUrl, "View job posts")}
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      Prefer email?
      <a href="mailto:${escapeHtml(input.supportEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.supportEmail)}</a>
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Job post not approved",
    preheader: `${input.jobTitle} was not approved for publication`,
    bodyHtml,
    footerNote: `Questions: ${input.supportEmail}`,
  });

  return { subject, html, text };
}

/** Job post approved and published. */
export function renderJobApprovedEmail(input: {
  companyName?: string | null;
  jobTitle: string;
  ctaUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Job post live: ${input.jobTitle}`;
  const greeting = input.companyName
    ? `Hi ${escapeHtml(input.companyName)},`
    : "Hi there,";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">
      Good news — <strong>${escapeHtml(input.jobTitle)}</strong> is approved and now visible to workers on Replaceme.
    </p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:${BRAND.accent};">Active</span>`)}
    `)}
    <p style="margin:0 0 18px 0;">
      ${ctaButton(input.ctaUrl, "View job post")}
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Job post published",
    preheader: `${input.jobTitle} is now live`,
    bodyHtml,
  });

  return { subject, html, text };
}

/** Account suspended — matches employer support email visual system. */
export function renderAccountSuspendedEmail(input: {
  endsAtLabel: string | null;
  reasonCategory?: string | null;
  roleLabel: string;
  appealCopy: string;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = "Your Replaceme account has been suspended";
  const untilValue = input.endsAtLabel
    ? escapeHtml(input.endsAtLabel)
    : "Until further review";
  const reasonRow = input.reasonCategory
    ? detailRow("Reason", escapeHtml(input.reasonCategory))
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Your Replaceme account access has been temporarily restricted. You will not be able to sign in to the dashboard while this suspension is in effect.</p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:${BRAND.primary};">Suspended</span>`)}
      ${detailRow("Until", untilValue)}
      ${detailRow("Account type", escapeHtml(input.roleLabel))}
      ${reasonRow}
    `)}
    ${sectionLabel("Appeals")}
    <p style="margin:0 0 18px 0;">${escapeHtml(input.appealCopy)}</p>
    <p style="margin:0 0 18px 0;">
      ${ctaButton(`mailto:${input.supportEmail}`, "Contact support")}
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      Prefer email? Write to
      <a href="mailto:${escapeHtml(input.supportEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.supportEmail)}</a>.
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Account suspended",
    preheader: "Your Replaceme account has been suspended",
    bodyHtml,
    footerNote: `Questions or appeals: ${input.supportEmail}`,
  });

  return { subject, html, text };
}

/** Account reactivated after suspension. */
export function renderAccountUnsuspendedEmail(input: {
  roleLabel: string;
  signInUrl: string;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = "Your Replaceme account has been reactivated";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Good news — your Replaceme account is active again. You can sign in and continue as usual.</p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:${BRAND.accent};">Active</span>`)}
      ${detailRow("Account type", escapeHtml(input.roleLabel))}
    `)}
    <p style="margin:0 0 18px 0;">
      ${ctaButton(input.signInUrl, "Sign in to Replaceme")}
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      If you did not expect this change, contact
      <a href="mailto:${escapeHtml(input.supportEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.supportEmail)}</a>.
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Account reactivated",
    preheader: "Your Replaceme account access is restored",
    bodyHtml,
    footerNote: `Need help? ${input.supportEmail}`,
  });

  return { subject, html, text };
}

/** Soft-delete grace window scheduled. */
export function renderDeletionScheduledEmail(input: {
  scheduledForLabel: string;
  graceDays: number;
  retentionRows: ReadonlyArray<{ category: string; period: string }>;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = "Your Replaceme account closure is scheduled";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Your Replaceme account is scheduled for closure. You keep full access until the date below — contact support before then if you want to cancel.</p>
    ${detailCard(`
      ${detailRow("Closure date", escapeHtml(input.scheduledForLabel))}
      ${detailRow("Recovery window", `${input.graceDays} calendar days`)}
      ${detailRow("Status", "Scheduled for closure")}
    `)}
    ${sectionLabel("What we may retain after closure")}
    <p style="margin:0 0 10px 0;font-size:14px;color:${BRAND.body};">After closure we anonymize profile PII. Categories that may be retained for legal, tax, fraud, or dispute purposes only:</p>
    ${retentionListHtml(input.retentionRows)}
    <p style="margin:0 0 18px 0;">
      ${ctaButton(`mailto:${input.supportEmail}?subject=${encodeURIComponent("Cancel account closure")}`, "Contact support to cancel")}
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Account closure scheduled",
    preheader: `Account closure scheduled for ${input.scheduledForLabel}`,
    bodyHtml,
    footerNote: `Need to cancel? Email ${input.supportEmail}`,
  });

  return { subject, html, text };
}

/** Account erasure completed. */
export function renderDeletionCompleteEmail(input: {
  retentionRows: ReadonlyArray<{ category: string; period: string }>;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = "Your Replaceme account has been closed";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Your Replaceme account has been closed and personal profile data has been anonymized. Sign-in is disabled.</p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:${BRAND.primary};">Closed</span>`)}
      ${detailRow("Sign-in", "Disabled")}
    `)}
    ${sectionLabel("Data retention")}
    <p style="margin:0 0 10px 0;font-size:14px;color:${BRAND.body};">Categories that may be retained (for legal, tax, fraud, or dispute purposes only — not marketing):</p>
    ${retentionListHtml(input.retentionRows)}
    <p style="margin:0 0 18px 0;font-size:14px;color:${BRAND.body};">You may complain to the National Privacy Commission (NPC) or another supervisory authority where applicable.</p>
    <p style="margin:0 0 8px 0;">
      ${ctaButton(`mailto:${input.supportEmail}`, "Contact support")}
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Account closed",
    preheader: "Your Replaceme account has been closed",
    bodyHtml,
    footerNote: `Questions: ${input.supportEmail}`,
  });

  return { subject, html, text };
}

/**
 * HTML for Supabase Dashboard → Auth → Email Templates → Confirm signup.
 * Uses TokenHash so clicks go through /auth/confirm (SSR-safe).
 */
export function getSupabaseConfirmSignupHtml(): string {
  const ctaHref =
    "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next={{ .RedirectTo }}";

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Welcome to <strong>${BRAND.appName}</strong> — the direct marketplace for Filipino remote talent.</p>
    <p style="margin:0 0 18px 0;">Confirm your email to finish verifying your account. You can keep using Replaceme in the meantime.</p>
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
    preheader: "Verify your Replaceme email when you’re ready.",
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
    preheader: "Secure link to choose a new Replaceme password.",
    bodyHtml,
    footerNote: `This link expires for your security. Need help? ${BRAND.supportEmail}`,
    siteUrl: BRAND.productionSiteUrl,
  }).html;
}

/** Worker identity verification approved. */
export function renderKycApprovedEmail(input: {
  workerName?: string | null;
  ctaUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = "Identity verified on Replaceme";
  const greeting = input.workerName?.trim()
    ? `Hi ${escapeHtml(input.workerName.trim())},`
    : "Hi there,";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">
      Your government ID and selfie were reviewed and your identity is now <strong>verified</strong> on Replaceme.
    </p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:${BRAND.accent};">Verified</span>`)}
    `)}
    <p style="margin:0 0 18px 0;">
      You can apply to verified-only roles and employers will see your verified badge.
    </p>
    <p style="margin:0 0 18px 0;">
      ${ctaButton(input.ctaUrl, "View verification")}
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Identity verified",
    preheader: "Your Replaceme identity verification was approved",
    bodyHtml,
  });

  return { subject, html, text };
}

/** Worker identity verification rejected or needs resubmission. */
export function renderKycDecisionEmail(input: {
  workerName?: string | null;
  decision: "rejected" | "resubmission_required";
  reason: string;
  ctaUrl: string;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const needsUpdate = input.decision === "resubmission_required";
  const subject = needsUpdate
    ? "Action needed: resubmit your identity documents"
    : "Identity verification was not approved";
  const greeting = input.workerName?.trim()
    ? `Hi ${escapeHtml(input.workerName.trim())},`
    : "Hi there,";
  const statusLabel = needsUpdate ? "Resubmission required" : "Not approved";
  const statusColor = needsUpdate ? "#b45309" : "#b91c1c";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">${greeting}</p>
    <p style="margin:0 0 16px 0;">
      ${
        needsUpdate
          ? "Our Trust &amp; Safety team reviewed your identity submission and needs an updated set of documents before we can verify your account."
          : "Our Trust &amp; Safety team reviewed your identity submission and could not approve it at this time."
      }
    </p>
    ${detailCard(`
      ${detailRow("Status", `<span style="color:${statusColor};">${statusLabel}</span>`)}
    `)}
    ${sectionLabel("Reason")}
    <div style="margin:0 0 18px 0;padding:14px 16px;border:1px solid ${BRAND.border};border-radius:14px;background:#fff;color:${BRAND.body};font-size:14px;line-height:1.55;">${escapeHtml(input.reason).replaceAll("\n", "<br />")}</div>
    <p style="margin:0 0 18px 0;">
      Please upload clear photos of your physical Philippine government-issued ID (front and back) and a selfie holding the ID, then submit again for review.
    </p>
    <p style="margin:0 0 18px 0;">
      ${ctaButton(input.ctaUrl, "Resubmit documents")}
    </p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      Questions?
      <a href="mailto:${escapeHtml(input.supportEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.supportEmail)}</a>
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: needsUpdate ? "Resubmit identity documents" : "Verification not approved",
    preheader: needsUpdate
      ? "Please resubmit your ID documents for verification"
      : "Your identity verification was not approved",
    bodyHtml,
    footerNote: `Support: ${input.supportEmail}`,
  });

  return { subject, html, text };
}

/** Trust & Safety warning — never names the reporter. */
export function renderAccountWarningEmail(input: {
  roleLabel: string;
  reasonSummary: string;
  supportEmail: string;
}): { subject: string; html: string; text: string } {
  const subject = "Important notice about your Replaceme account";

  const bodyHtml = `
    <p style="margin:0 0 16px 0;">Our Trust &amp; Safety team reviewed a report related to your account and is issuing a formal warning. This notice does not identify who submitted the report.</p>
    ${detailCard(`
      ${detailRow("Account type", escapeHtml(input.roleLabel))}
      ${detailRow("Notice", escapeHtml(input.reasonSummary))}
    `)}
    <p style="margin:0 0 18px 0;">Please review our Terms of Service and Community Guidelines. Further violations may result in suspension or permanent restriction of your account.</p>
    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.55;">
      Questions? Contact
      <a href="mailto:${escapeHtml(input.supportEmail)}" style="color:${BRAND.accent};font-weight:600;text-decoration:none;">${escapeHtml(input.supportEmail)}</a>.
    </p>
  `;

  const { html, text } = renderEmailLayout({
    title: "Account warning",
    preheader: "Formal notice from Trust & Safety",
    bodyHtml,
    footerNote: `Support: ${input.supportEmail}`,
  });

  return { subject, html, text };
}
