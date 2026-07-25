import {
  ACCOUNT_LIFECYCLE_TIMELINES,
  APPEAL_SLA_COPY,
  DATA_RETENTION_PERIODS,
  DELETION_REQUEST_SUPPORT_EMAIL,
  formatClosureDate,
} from "@/lib/data/legal";
import { getSiteUrl } from "@/lib/auth/site-url";
import {
  renderAccountSuspendedEmail,
  renderAccountUnsuspendedEmail,
  renderDeletionCompleteEmail,
  renderDeletionScheduledEmail,
} from "@/lib/server/email/email-templates";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import { safeError } from "@/utils/logger";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

export type LifecycleEmailResult =
  | { sent: true; messageId: string }
  | { sent: false; skipped: string };

const RETENTION_FOR_EMAIL = DATA_RETENTION_PERIODS.slice(0, 4);

function roleLabel(role: UserRole): string {
  switch (role) {
    case "employer":
      return "Employer";
    case "worker":
      return "Worker";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

function uniqueKey(parts: string[]): string {
  return parts.filter(Boolean).join("/").slice(0, 256);
}

export async function sendAccountSuspendedEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  reasonCategory?: string;
  endsAt: Date | null;
  notify: boolean;
}): Promise<LifecycleEmailResult> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };
  if (!input.to.trim()) return { sent: false, skipped: "missing_email" };

  try {
    const email = renderAccountSuspendedEmail({
      endsAtLabel: input.endsAt ? formatClosureDate(input.endsAt) : null,
      reasonCategory: input.reasonCategory ?? null,
      roleLabel: roleLabel(input.role),
      appealCopy: APPEAL_SLA_COPY,
      supportEmail: DELETION_REQUEST_SUPPORT_EMAIL,
    });

    const result = await sendTransactionalEmail({
      templateKey: "account.lifecycle.suspended",
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.userId,
      role: input.role,
      tags: {
        lifecycle: "suspended",
        role: input.role,
      },
      idempotencyKey: uniqueKey([
        "account-lifecycle",
        "suspended",
        input.userId,
        String(Date.now()),
      ]),
    });

    if (!result.success) return { sent: false, skipped: result.error };
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    safeError("sendAccountSuspendedEmail:", err);
    return {
      sent: false,
      skipped: err instanceof Error ? err.message : "suspend_email_failed",
    };
  }
}

export async function sendAccountUnsuspendedEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  notify: boolean;
}): Promise<LifecycleEmailResult> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };
  if (!input.to.trim()) return { sent: false, skipped: "missing_email" };

  try {
    const signInUrl = `${getSiteUrl().replace(/\/$/, "")}/signin`;
    const email = renderAccountUnsuspendedEmail({
      roleLabel: roleLabel(input.role),
      signInUrl,
      supportEmail: DELETION_REQUEST_SUPPORT_EMAIL,
    });

    const result = await sendTransactionalEmail({
      templateKey: "account.lifecycle.unsuspended",
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.userId,
      role: input.role,
      tags: {
        lifecycle: "unsuspended",
        role: input.role,
      },
      idempotencyKey: uniqueKey([
        "account-lifecycle",
        "unsuspended",
        input.userId,
        String(Date.now()),
      ]),
    });

    if (!result.success) return { sent: false, skipped: result.error };
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    safeError("sendAccountUnsuspendedEmail:", err);
    return {
      sent: false,
      skipped: err instanceof Error ? err.message : "unsuspend_email_failed",
    };
  }
}

export async function sendDeletionScheduledEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  scheduledFor: Date;
  notify: boolean;
}): Promise<LifecycleEmailResult> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };
  if (!input.to.trim()) return { sent: false, skipped: "missing_email" };

  try {
    const email = renderDeletionScheduledEmail({
      scheduledForLabel: formatClosureDate(input.scheduledFor),
      graceDays: ACCOUNT_LIFECYCLE_TIMELINES.deletionGraceCalendarDays,
      retentionRows: RETENTION_FOR_EMAIL,
      supportEmail: DELETION_REQUEST_SUPPORT_EMAIL,
    });

    const result = await sendTransactionalEmail({
      templateKey: "account.lifecycle.deletion_scheduled",
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.userId,
      role: input.role,
      tags: {
        lifecycle: "deletion_scheduled",
        role: input.role,
      },
      idempotencyKey: uniqueKey([
        "account-lifecycle",
        "deletion-scheduled",
        input.userId,
        String(Date.now()),
      ]),
    });

    if (!result.success) return { sent: false, skipped: result.error };
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    safeError("sendDeletionScheduledEmail:", err);
    return {
      sent: false,
      skipped: err instanceof Error ? err.message : "deletion_scheduled_email_failed",
    };
  }
}

export async function sendDeletionCompleteEmail(input: {
  to: string;
  userId: string;
  role: UserRole;
  notify: boolean;
}): Promise<LifecycleEmailResult> {
  if (!input.notify) return { sent: false, skipped: "notify_disabled" };
  if (!input.to.trim()) return { sent: false, skipped: "missing_email" };

  try {
    const email = renderDeletionCompleteEmail({
      retentionRows: RETENTION_FOR_EMAIL,
      supportEmail: DELETION_REQUEST_SUPPORT_EMAIL,
    });

    const result = await sendTransactionalEmail({
      templateKey: "account.lifecycle.deletion_complete",
      to: input.to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.userId,
      role: input.role,
      tags: {
        lifecycle: "deletion_complete",
        role: input.role,
      },
      idempotencyKey: uniqueKey([
        "account-lifecycle",
        "deletion-complete",
        input.userId,
        String(Date.now()),
      ]),
    });

    if (!result.success) return { sent: false, skipped: result.error };
    return { sent: true, messageId: result.messageId };
  } catch (err) {
    safeError("sendDeletionCompleteEmail:", err);
    return {
      sent: false,
      skipped: err instanceof Error ? err.message : "deletion_complete_email_failed",
    };
  }
}
