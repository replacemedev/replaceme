import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  APPEAL_SLA_COPY,
  DATA_RETENTION_PERIODS,
  DELETION_REQUEST_SUPPORT_EMAIL,
  formatClosureDate,
} from "@/lib/data/legal";
import {
  escapeHtml,
  renderEmailLayout,
} from "@/lib/server/email/email-templates";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

function retentionBulletsHtml(): string {
  return DATA_RETENTION_PERIODS.slice(0, 4)
    .map(
      (row) =>
        `<li><strong>${escapeHtml(row.category)}:</strong> ${escapeHtml(row.period)}</li>`
    )
    .join("");
}

export async function sendAccountSuspendedEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  reasonCategory?: string;
  endsAt: Date | null;
  notify: boolean;
}): Promise<{ sent: boolean; messageId?: string; skipped?: string }> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };

  const endCopy = input.endsAt
    ? `Your access is suspended until <strong>${escapeHtml(formatClosureDate(input.endsAt))}</strong>.`
    : "Your access is suspended until further review.";

  const category = input.reasonCategory
    ? `<p>Reason category: <strong>${escapeHtml(input.reasonCategory)}</strong>.</p>`
    : "";

  const { html, text } = renderEmailLayout({
    preheader: "Your Replaceme account has been suspended",
    title: "Account suspended",
    bodyHtml: `
      <p>${endCopy}</p>
      ${category}
      <p>You will not be able to sign in to the dashboard while this suspension is in effect.</p>
      <p>${escapeHtml(APPEAL_SLA_COPY)}</p>
      <p>Questions or appeals: <a href="mailto:${DELETION_REQUEST_SUPPORT_EMAIL}">${DELETION_REQUEST_SUPPORT_EMAIL}</a></p>
    `,
  });

  const result = await sendTransactionalEmail({
    templateKey: "account.lifecycle.suspended",
    to: input.to,
    subject: "Your Replaceme account has been suspended",
    html,
    text,
    userId: input.userId,
    role: input.role,
    idempotencyKey: `account-suspended:${input.userId}:${input.endsAt?.toISOString() ?? "indefinite"}`,
  });

  if (!result.success) return { sent: false, skipped: result.error };
  return { sent: true, messageId: result.messageId };
}

export async function sendAccountUnsuspendedEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  notify: boolean;
}): Promise<{ sent: boolean; messageId?: string; skipped?: string }> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };

  const { html, text } = renderEmailLayout({
    preheader: "Your Replaceme account access is restored",
    title: "Account reactivated",
    bodyHtml: `
      <p>Your Replaceme account is active again. You can sign in as usual.</p>
      <p>If you did not expect this change, contact <a href="mailto:${DELETION_REQUEST_SUPPORT_EMAIL}">${DELETION_REQUEST_SUPPORT_EMAIL}</a>.</p>
    `,
  });

  const result = await sendTransactionalEmail({
    templateKey: "account.lifecycle.unsuspended",
    to: input.to,
    subject: "Your Replaceme account has been reactivated",
    html,
    text,
    userId: input.userId,
    role: input.role,
    idempotencyKey: `account-unsuspended:${input.userId}:${Date.now()}`,
  });

  if (!result.success) return { sent: false, skipped: result.error };
  return { sent: true, messageId: result.messageId };
}

export async function sendDeletionScheduledEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  scheduledFor: Date;
  notify: boolean;
}): Promise<{ sent: boolean; messageId?: string; skipped?: string }> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };

  const dateLabel = formatClosureDate(input.scheduledFor);
  const { html, text } = renderEmailLayout({
    preheader: `Account closure scheduled for ${dateLabel}`,
    title: "Account closure scheduled",
    bodyHtml: `
      <p>Your Replaceme account is scheduled for closure on <strong>${escapeHtml(dateLabel)}</strong>
      (${ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays}-day recovery window).</p>
      <p>You keep full access until that date. Contact support before then to cancel.</p>
      <p>After closure we anonymize profile PII. We may retain the following for legal or tax reasons:</p>
      <ul>${retentionBulletsHtml()}</ul>
      <p>Support: <a href="mailto:${DELETION_REQUEST_SUPPORT_EMAIL}">${DELETION_REQUEST_SUPPORT_EMAIL}</a></p>
    `,
  });

  const result = await sendTransactionalEmail({
    templateKey: "account.lifecycle.deletion_scheduled",
    to: input.to,
    subject: "Your Replaceme account closure is scheduled",
    html,
    text,
    userId: input.userId,
    role: input.role,
    idempotencyKey: `account-deletion-scheduled:${input.userId}:${input.scheduledFor.toISOString()}`,
  });

  if (!result.success) return { sent: false, skipped: result.error };
  return { sent: true, messageId: result.messageId };
}

export async function sendDeletionCompleteEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  notify: boolean;
}): Promise<{ sent: boolean; messageId?: string; skipped?: string }> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };

  const { html, text } = renderEmailLayout({
    preheader: "Your Replaceme account has been closed",
    title: "Account closed",
    bodyHtml: `
      <p>Your Replaceme account has been closed and personal profile data has been anonymized.</p>
      <p>Sign-in is disabled. Categories that may be retained (for legal, tax, fraud, or dispute purposes only — not marketing):</p>
      <ul>${retentionBulletsHtml()}</ul>
      <p>You may complain to the National Privacy Commission (NPC) or another supervisory authority where applicable.</p>
      <p>Questions: <a href="mailto:${DELETION_REQUEST_SUPPORT_EMAIL}">${DELETION_REQUEST_SUPPORT_EMAIL}</a></p>
    `,
  });

  const result = await sendTransactionalEmail({
    templateKey: "account.lifecycle.deletion_complete",
    to: input.to,
    subject: "Your Replaceme account has been closed",
    html,
    text,
    userId: input.userId,
    role: input.role,
    idempotencyKey: `account-deletion-complete:${input.userId}`,
  });

  if (!result.success) return { sent: false, skipped: result.error };
  return { sent: true, messageId: result.messageId };
}
