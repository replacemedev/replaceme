/**
 * CAN-SPAM / marketing-broadcast compliance helpers.
 * Transactional mail is out of scope here.
 */

export const RESEND_UNSUBSCRIBE_TOKEN = "{{{RESEND_UNSUBSCRIBE_URL}}}";

/** Valid physical postal address for commercial email footers (env). Empty = unset. */
export function getCompanyPhysicalAddress(): string | null {
  const value = process.env.COMPANY_PHYSICAL_ADDRESS?.trim();
  return value && value.length > 0 ? value : null;
}

export function isBroadcastComplianceReady(): boolean {
  return getCompanyPhysicalAddress() !== null;
}

export type BroadcastComplianceResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Blocks commercial broadcasts missing Resend unsubscribe or a configured postal address.
 */
export function assertBroadcastHtmlCompliance(
  html: string
): BroadcastComplianceResult {
  const address = getCompanyPhysicalAddress();
  if (!address) {
    return {
      ok: false,
      error:
        "Commercial broadcasts are blocked until COMPANY_PHYSICAL_ADDRESS is set (CAN-SPAM). Use a real street address, registered P.O. box, or CMRA mailbox.",
    };
  }

  if (!html.includes(RESEND_UNSUBSCRIBE_TOKEN)) {
    return {
      ok: false,
      error: `Broadcast HTML must include the Resend unsubscribe placeholder ${RESEND_UNSUBSCRIBE_TOKEN}.`,
    };
  }

  if (!html.includes(address)) {
    return {
      ok: false,
      error:
        "Broadcast HTML must include the configured company physical postal address in the footer.",
    };
  }

  return { ok: true };
}

/** Append-safe compliance footer fragment for modular broadcast templates. */
export function broadcastComplianceFooterHtml(): string {
  const address = getCompanyPhysicalAddress() ?? "";
  return `
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;line-height:1.5;color:#94a3b8;">
  <p style="margin:0 0 8px;">You are receiving this because you have a Replaceme account.</p>
  <p style="margin:0 0 8px;"><a href="${RESEND_UNSUBSCRIBE_TOKEN}" style="color:#006e2f;text-decoration:underline;">Unsubscribe</a></p>
  <p style="margin:0;">${escapeHtml(address)}</p>
</div>`.trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
