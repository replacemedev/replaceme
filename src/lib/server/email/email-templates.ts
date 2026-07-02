const BRAND = {
  appName: "ReplaceMe",
  supportEmail: "support@replaceme.ph",
  logoAlt: "ReplaceMe",
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderEmailLayout(input: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  footerNote?: string;
}): { html: string; text: string } {
  const title = escapeHtml(input.title);
  const preheader = escapeHtml(input.preheader ?? "");
  const footerNote = escapeHtml(
    input.footerNote ??
      `If you didn’t request this, you can ignore this email or contact ${BRAND.supportEmail}.`
  );

  const text = `${input.title}\n\n${stripHtml(input.bodyHtml)}\n\n${footerNote}\n`;

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:12px 8px 20px 8px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                <div style="font-weight:800;font-size:18px;letter-spacing:-0.02em;color:#0f172a;">
                  ${BRAND.logoAlt}
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid rgba(148,163,184,0.35);border-radius:18px;padding:22px 20px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                <h1 style="margin:0 0 10px 0;font-size:18px;line-height:1.3;color:#0f172a;letter-spacing:-0.02em;">
                  ${title}
                </h1>
                <div style="font-size:14px;line-height:1.55;color:#334155;">
                  ${input.bodyHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 8px 0 8px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
                <div style="font-size:12px;line-height:1.5;color:#64748b;">
                  ${footerNote}
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
  const ctaUrl = escapeHtml(input.ctaUrl);
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
      <a href="${ctaUrl}" style="display:inline-block;background:#006e2f;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px;">
        Review applicants
      </a>
    </p>
    <p style="margin:0;">Plan: <strong>${escapeHtml(input.planLabel)}</strong></p>
  `;

  const { html, text } = renderEmailLayout({
    title: "New application received",
    preheader: `New applicant for ${input.jobTitle}`,
    bodyHtml,
  });

  return { subject, html, text };
}

function stripHtml(html: string): string {
  return html
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<\/p>/gi, "\n\n")
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll("&nbsp;", " ")
    .trim();
}

