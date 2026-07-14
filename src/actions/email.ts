"use server";

import * as React from "react";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { fetchEmployerEntitlements } from "@/lib/server/entitlements";
import {
  sendTransactionalEmail,
  type EmailTierSlug,
} from "@/lib/server/email/mailer";
import {
  renderEmployerSupportEmail,
  renderWorkerNotificationEmail,
} from "@/lib/server/email/email-templates";
import { renderReactEmail } from "@/lib/server/email/render-react-email";
import {
  isPaidEmailTier,
  normalizeEmailTierSlug,
  paidPlanLabel,
} from "@/lib/server/email/paid-tier";
import { workerStatusEmailCopy } from "@/lib/server/email/status-copy";
import { getSupportInboxEmail } from "@/lib/server/resend/client";
import { formatFullName } from "@/lib/format/name";
import { getSiteUrl } from "@/lib/auth/site-url";
import { uuidSchema } from "@/lib/validations/common";
import { assertRateLimit } from "@/lib/server/rate-limit";
import { TIER_LABELS } from "@/lib/entitlements/ui-copy";
import type { SubscriptionTier } from "@/types/employer/billing";
import type { ApplicationStatus } from "@/types/applications";
import { APPLICATION_STATUSES } from "@/types/applications";
import { safeError, safeLog } from "@/utils/logger";

import WorkerApplicationStatusEmail from "@emails/worker-application-status";
import WorkerNewMessageEmail from "@emails/worker-new-message";
import WorkerProfileNudgeEmail from "@emails/worker-profile-nudge";
import EmployerNewApplicantEmail from "@emails/employer-new-applicant";
import EmployerNewMessageEmail from "@emails/employer-new-message";
import EmployerSubscriptionAlertEmail, {
  type SubscriptionAlertKind,
} from "@emails/employer-subscription-alert";

const PAID_SUPPORT_TIERS = new Set<EmailTierSlug>([
  "starter",
  "growth",
  "scale",
]);

const FREE_SUPPORT_ERROR =
  "Email support is only available on paid plans. Please upgrade to contact support.";

const employerSupportSchema = z
  .object({
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters.")
      .max(120, "Subject is too long."),
    message: z
      .string()
      .trim()
      .min(20, "Please include a bit more detail (at least 20 characters).")
      .max(4000, "Message is too long."),
  })
  .strict();

const workerNotificationSchema = z
  .object({
    userId: uuidSchema,
    subject: z
      .string()
      .trim()
      .min(3, "Subject must be at least 3 characters.")
      .max(160, "Subject is too long."),
    messageBody: z
      .string()
      .trim()
      .min(1, "Message body is required.")
      .max(8000, "Message body is too long."),
    ctaUrl: z.string().url().optional(),
    ctaLabel: z.string().trim().min(1).max(60).optional(),
  })
  .strict();

const notifyWorkerStatusSchema = z
  .object({
    applicationId: uuidSchema,
    status: z.enum(APPLICATION_STATUSES),
  })
  .strict();

const notifyEmployerApplicantSchema = z
  .object({
    applicationId: uuidSchema,
    jobId: uuidSchema,
    employerId: uuidSchema,
  })
  .strict();

const notifyMessageSchema = z
  .object({
    threadId: uuidSchema,
    senderId: uuidSchema,
    recipientId: uuidSchema,
    messagePreview: z.string().trim().min(1).max(500),
  })
  .strict();

const notifySubscriptionSchema = z
  .object({
    employerId: uuidSchema,
    kind: z.enum([
      "upgraded",
      "downgraded",
      "payment_failed",
      "canceled",
    ] as const),
    planSlug: z.string().trim().min(1).max(40),
    previousPlanSlug: z.string().trim().min(1).max(40).optional().nullable(),
    amountLabel: z.string().trim().min(1).max(40).optional().nullable(),
    idempotencyKey: z.string().trim().min(8).max(200),
  })
  .strict();

const notifyProfileNudgeSchema = z
  .object({
    workerId: uuidSchema,
  })
  .strict();

function planLabelForSlug(slug: EmailTierSlug): string {
  return TIER_LABELS[slug as SubscriptionTier] ?? slug;
}

function truncatePreview(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

async function workerAllowsEmail(
  workerId: string,
  kind: "applications" | "messages"
): Promise<boolean> {
  const admin = await createAdminClient();
  const { data } = await admin
    .from("notification_preferences")
    .select("email_applications, email_messages")
    .eq("user_id", workerId)
    .maybeSingle();

  if (!data) return true;
  return kind === "applications"
    ? data.email_applications !== false
    : data.email_messages !== false;
}

/**
 * Paid-plan employers send support tickets to the admin inbox via Resend.
 * Discovery / free tiers are rejected with an explicit upgrade error.
 */
export async function sendEmployerSupportEmail(input: {
  subject: string;
  message: string;
}) {
  return runAction("sendEmployerSupportEmail", async () => {
    const parsed = employerSupportSchema.parse(input);
    const { supabase, user, profile } = await requireRole("employer");

    const rateLimit = await assertRateLimit("employer-support-email", {
      maxAttempts: 5,
      windowMs: 60 * 60 * 1000,
      identifier: profile.id,
    });
    if (!rateLimit.ok) {
      return fail(rateLimit.error);
    }

    const entitlements = await fetchEmployerEntitlements(profile.id, supabase);
    const tierSlug = normalizeEmailTierSlug(entitlements?.planSlug);

    if (!PAID_SUPPORT_TIERS.has(tierSlug)) {
      return fail(FREE_SUPPORT_ERROR);
    }

    const [{ data: account }, { data: company }] = await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, middle_name, last_name, email")
        .eq("id", profile.id)
        .maybeSingle(),
      supabase
        .from("company_profiles")
        .select("company_name")
        .eq("employer_id", profile.id)
        .maybeSingle(),
    ]);

    const employerEmail = account?.email ?? user.email;
    if (!employerEmail) {
      return fail("No email is associated with your account.");
    }

    const employerName =
      formatFullName(account?.first_name, account?.middle_name, account?.last_name) ||
      company?.company_name ||
      "Employer";

    const planLabel = planLabelForSlug(tierSlug);
    const email = renderEmployerSupportEmail({
      employerName,
      employerEmail,
      companyName: company?.company_name,
      planLabel,
      subject: parsed.subject,
      message: parsed.message,
    });

    const result = await sendTransactionalEmail({
      templateKey: "employer.support.ticket",
      to: getSupportInboxEmail(),
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: employerEmail,
      userId: profile.id,
      role: "employer",
      tierSlug,
      tags: {
        category: "support",
        plan: tierSlug,
      },
      idempotencyKey: `employer-support/${profile.id}/${Date.now()}`,
    });

    if (!result.success) {
      return fail(result.error);
    }

    return ok({ messageId: result.messageId });
  });
}

/**
 * Reusable transactional notification to a worker (e.g. admin broadcast).
 */
export async function sendWorkerNotification(input: {
  userId: string;
  subject: string;
  messageBody: string;
  ctaUrl?: string;
  ctaLabel?: string;
}) {
  return runAction("sendWorkerNotification", async () => {
    const parsed = workerNotificationSchema.parse(input);
    await requireRole(["admin", "employer"]);

    const admin = await createAdminClient();
    const { data: worker, error } = await admin
      .from("profiles")
      .select("id, email, role, first_name, middle_name, last_name")
      .eq("id", parsed.userId)
      .maybeSingle();

    if (error || !worker) {
      return fail("Worker not found.");
    }
    if (worker.role !== "worker") {
      return fail("Notifications can only be sent to worker accounts.");
    }
    if (!worker.email) {
      return fail("Worker does not have an email on file.");
    }

    const recipientName = formatFullName(
      worker.first_name,
      worker.middle_name,
      worker.last_name
    );

    const email = renderWorkerNotificationEmail({
      recipientName: recipientName || null,
      subject: parsed.subject,
      messageBody: parsed.messageBody,
      ctaUrl: parsed.ctaUrl ?? `${getSiteUrl()}/worker/applications`,
      ctaLabel: parsed.ctaLabel ?? "View applications",
    });

    const result = await sendTransactionalEmail({
      templateKey: "worker.notification.transactional",
      to: worker.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: worker.id,
      role: "worker",
      tags: {
        category: "notification",
      },
      idempotencyKey: `worker-notification/${worker.id}/${parsed.subject.slice(0, 40)}/${Date.now()}`,
    });

    if (!result.success) {
      return fail(result.error);
    }

    return ok({ messageId: result.messageId });
  });
}

/**
 * Notify a worker when an employer changes their application status.
 */
export async function notifyWorkerStatusUpdate(input: {
  applicationId: string;
  status: ApplicationStatus;
}): Promise<{ success: true; skipped?: boolean; messageId?: string } | { success: false; error: string }> {
  try {
    const parsed = notifyWorkerStatusSchema.parse(input);
    const copy = workerStatusEmailCopy(parsed.status);
    if (!copy.shouldNotify) {
      return { success: true, skipped: true };
    }

    const admin = await createAdminClient();
    const { data: application, error } = await admin
      .from("applications")
      .select("id, candidate_id, job_id")
      .eq("id", parsed.applicationId)
      .maybeSingle();

    if (error || !application) {
      safeError("notifyWorkerStatusUpdate: application missing", error);
      return { success: false, error: "Application not found." };
    }

    const allowed = await workerAllowsEmail(application.candidate_id, "applications");
    if (!allowed) {
      safeLog(
        `notifyWorkerStatusUpdate: skipped (prefs) application=${parsed.applicationId}`
      );
      return { success: true, skipped: true };
    }

    const [{ data: worker }, { data: job }] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, first_name, middle_name, last_name, role")
        .eq("id", application.candidate_id)
        .maybeSingle(),
      admin
        .from("job_posts")
        .select("id, title, employer_id, company_name")
        .eq("id", application.job_id)
        .maybeSingle(),
    ]);

    if (!worker?.email || worker.role !== "worker") {
      return { success: true, skipped: true };
    }

    let companyName = job?.company_name ?? "an employer";
    if (job?.employer_id) {
      const { data: company } = await admin
        .from("company_profiles")
        .select("company_name")
        .eq("employer_id", job.employer_id)
        .maybeSingle();
      if (company?.company_name) companyName = company.company_name;
    }

    const siteUrl = getSiteUrl();
    const workerName = formatFullName(
      worker.first_name,
      worker.middle_name,
      worker.last_name
    );
    const jobTitle = job?.title ?? "your role";
    const ctaUrl = `${siteUrl}/worker/applications/${application.id}`;

    const { html, text } = await renderReactEmail(
      React.createElement(WorkerApplicationStatusEmail, {
        workerName: workerName || null,
        jobTitle,
        companyName,
        statusTone: copy.tone,
        statusHeadline: copy.headline,
        statusBody: copy.body,
        ctaUrl,
        siteUrl,
      })
    );

    const result = await sendTransactionalEmail({
      templateKey: "worker.application.status_update",
      to: worker.email,
      subject: `${copy.headline} — ${jobTitle}`,
      html,
      text,
      userId: worker.id,
      role: "worker",
      tags: {
        category: "application_status",
        status: parsed.status,
        application_id: application.id,
      },
      idempotencyKey: `worker-status/${application.id}/${parsed.status}`,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, messageId: result.messageId };
  } catch (err) {
    safeError("notifyWorkerStatusUpdate:", err);
    return { success: false, error: "Failed to notify worker." };
  }
}

/**
 * Paid-tier gate: notify employer of a new applicant (Starter / Growth / Scale).
 * Discovery / free tiers abort silently.
 */
export async function notifyEmployerNewApplicant(input: {
  applicationId: string;
  jobId: string;
  employerId: string;
}): Promise<{ success: true; skipped?: boolean; messageId?: string } | { success: false; error: string }> {
  try {
    const parsed = notifyEmployerApplicantSchema.parse(input);
    const admin = await createAdminClient();

    const entitlements = await fetchEmployerEntitlements(
      parsed.employerId,
      admin
    );
    const tierSlug = normalizeEmailTierSlug(entitlements?.planSlug);

    if (!isPaidEmailTier(tierSlug)) {
      safeLog(
        `notifyEmployerNewApplicant: aborted (tier=${tierSlug}) employer=${parsed.employerId}`
      );
      return { success: true, skipped: true };
    }

    const [{ data: employer }, { data: company }, { data: job }, { data: application }] =
      await Promise.all([
        admin
          .from("profiles")
          .select("id, email, role, first_name, middle_name, last_name")
          .eq("id", parsed.employerId)
          .maybeSingle(),
        admin
          .from("company_profiles")
          .select("company_name")
          .eq("employer_id", parsed.employerId)
          .maybeSingle(),
        admin
          .from("job_posts")
          .select("id, title")
          .eq("id", parsed.jobId)
          .maybeSingle(),
        admin
          .from("applications")
          .select("id, candidate_id")
          .eq("id", parsed.applicationId)
          .maybeSingle(),
      ]);

    if (!employer?.email) {
      return { success: true, skipped: true };
    }

    let applicantName: string | null = null;
    if (application?.candidate_id) {
      const { data: worker } = await admin
        .from("profiles")
        .select("first_name, middle_name, last_name")
        .eq("id", application.candidate_id)
        .maybeSingle();
      applicantName =
        formatFullName(worker?.first_name, worker?.middle_name, worker?.last_name) ||
        null;
    }

    const siteUrl = getSiteUrl();
    const planLabel = paidPlanLabel(tierSlug);
    const jobTitle = job?.title ?? "your job post";
    const ctaUrl = `${siteUrl}/employer/jobs/${parsed.jobId}/applicants`;

    const { html, text } = await renderReactEmail(
      React.createElement(EmployerNewApplicantEmail, {
        companyName: company?.company_name ?? null,
        jobTitle,
        applicantName,
        planLabel,
        ctaUrl,
        siteUrl,
      })
    );

    const result = await sendTransactionalEmail({
      templateKey: "employer.new_application.instant_alert",
      to: employer.email,
      subject: `New applicant for ${jobTitle}`,
      html,
      text,
      userId: employer.id,
      role: employer.role,
      tierSlug,
      tags: {
        category: "application",
        job_id: parsed.jobId,
        application_id: parsed.applicationId,
        plan: tierSlug,
      },
      idempotencyKey: `new-application/${parsed.applicationId}`,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, messageId: result.messageId };
  } catch (err) {
    safeError("notifyEmployerNewApplicant:", err);
    return { success: false, error: "Failed to notify employer." };
  }
}

/**
 * Notify worker when an employer sends a message.
 */
export async function notifyWorkerNewMessage(input: {
  threadId: string;
  senderId: string;
  recipientId: string;
  messagePreview: string;
}): Promise<{ success: true; skipped?: boolean; messageId?: string } | { success: false; error: string }> {
  try {
    const parsed = notifyMessageSchema.parse(input);
    const allowed = await workerAllowsEmail(parsed.recipientId, "messages");
    if (!allowed) {
      return { success: true, skipped: true };
    }

    const admin = await createAdminClient();
    const [{ data: worker }, { data: sender }] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, role, first_name, middle_name, last_name")
        .eq("id", parsed.recipientId)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("first_name, middle_name, last_name, role")
        .eq("id", parsed.senderId)
        .maybeSingle(),
    ]);

    if (!worker?.email || worker.role !== "worker") {
      return { success: true, skipped: true };
    }

    const { data: company } = await admin
      .from("company_profiles")
      .select("company_name")
      .eq("employer_id", parsed.senderId)
      .maybeSingle();

    const employerName =
      company?.company_name ||
      formatFullName(sender?.first_name, sender?.middle_name, sender?.last_name) ||
      "An employer";

    const siteUrl = getSiteUrl();
    const workerName = formatFullName(
      worker.first_name,
      worker.middle_name,
      worker.last_name
    );

    const { html, text } = await renderReactEmail(
      React.createElement(WorkerNewMessageEmail, {
        workerName: workerName || null,
        employerName,
        messagePreview: truncatePreview(parsed.messagePreview),
        ctaUrl: `${siteUrl}/worker/messages?thread=${parsed.threadId}`,
        siteUrl,
      })
    );

    const result = await sendTransactionalEmail({
      templateKey: "worker.message.new",
      to: worker.email,
      subject: `New message from ${employerName}`,
      html,
      text,
      userId: worker.id,
      role: "worker",
      tags: {
        category: "message",
        thread_id: parsed.threadId,
      },
      idempotencyKey: `worker-message/${parsed.threadId}/${Date.now()}`,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, messageId: result.messageId };
  } catch (err) {
    safeError("notifyWorkerNewMessage:", err);
    return { success: false, error: "Failed to notify worker." };
  }
}

/**
 * Paid-tier gate: notify employer when a worker replies.
 * Discovery / free tiers abort silently.
 */
export async function notifyEmployerNewMessage(input: {
  threadId: string;
  senderId: string;
  recipientId: string;
  messagePreview: string;
}): Promise<{ success: true; skipped?: boolean; messageId?: string } | { success: false; error: string }> {
  try {
    const parsed = notifyMessageSchema.parse(input);
    const admin = await createAdminClient();

    const entitlements = await fetchEmployerEntitlements(
      parsed.recipientId,
      admin
    );
    const tierSlug = normalizeEmailTierSlug(entitlements?.planSlug);

    if (!isPaidEmailTier(tierSlug)) {
      safeLog(
        `notifyEmployerNewMessage: aborted (tier=${tierSlug}) employer=${parsed.recipientId}`
      );
      return { success: true, skipped: true };
    }

    const [{ data: employer }, { data: worker }] = await Promise.all([
      admin
        .from("profiles")
        .select("id, email, role, first_name, middle_name, last_name")
        .eq("id", parsed.recipientId)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("first_name, middle_name, last_name")
        .eq("id", parsed.senderId)
        .maybeSingle(),
    ]);

    if (!employer?.email || employer.role !== "employer") {
      return { success: true, skipped: true };
    }

    const employerName = formatFullName(
      employer.first_name,
      employer.middle_name,
      employer.last_name
    );
    const workerName =
      formatFullName(worker?.first_name, worker?.middle_name, worker?.last_name) ||
      "A candidate";
    const siteUrl = getSiteUrl();
    const planLabel = paidPlanLabel(tierSlug);

    const { html, text } = await renderReactEmail(
      React.createElement(EmployerNewMessageEmail, {
        employerName: employerName || null,
        workerName,
        messagePreview: truncatePreview(parsed.messagePreview),
        ctaUrl: `${siteUrl}/employer/messages?thread=${parsed.threadId}`,
        planLabel,
        siteUrl,
      })
    );

    const result = await sendTransactionalEmail({
      templateKey: "employer.message.new",
      to: employer.email,
      subject: `${workerName} replied to your message`,
      html,
      text,
      userId: employer.id,
      role: "employer",
      tierSlug,
      tags: {
        category: "message",
        thread_id: parsed.threadId,
        plan: tierSlug,
      },
      idempotencyKey: `employer-message/${parsed.threadId}/${Date.now()}`,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, messageId: result.messageId };
  } catch (err) {
    safeError("notifyEmployerNewMessage:", err);
    return { success: false, error: "Failed to notify employer." };
  }
}

/**
 * Billing / subscription transactional emails for employers.
 * Always attempted (not soft-gated by discovery) because they are account-critical.
 */
export async function notifyEmployerSubscriptionAlert(input: {
  employerId: string;
  kind: SubscriptionAlertKind;
  planSlug: string;
  previousPlanSlug?: string | null;
  amountLabel?: string | null;
  idempotencyKey: string;
}): Promise<{ success: true; skipped?: boolean; messageId?: string } | { success: false; error: string }> {
  try {
    const parsed = notifySubscriptionSchema.parse(input);
    const admin = await createAdminClient();

    const { data: employer } = await admin
      .from("profiles")
      .select("id, email, role, first_name, middle_name, last_name")
      .eq("id", parsed.employerId)
      .maybeSingle();

    if (!employer?.email) {
      return { success: true, skipped: true };
    }

    const tierSlug = normalizeEmailTierSlug(parsed.planSlug);
    const planLabel = planLabelForSlug(tierSlug);
    const previousPlanLabel = parsed.previousPlanSlug
      ? planLabelForSlug(normalizeEmailTierSlug(parsed.previousPlanSlug))
      : null;
    const siteUrl = getSiteUrl();
    const employerName = formatFullName(
      employer.first_name,
      employer.middle_name,
      employer.last_name
    );

    const { html, text } = await renderReactEmail(
      React.createElement(EmployerSubscriptionAlertEmail, {
        employerName: employerName || null,
        kind: parsed.kind,
        planLabel,
        previousPlanLabel,
        amountLabel: parsed.amountLabel ?? null,
        ctaUrl: `${siteUrl}/employer/settings/account`,
        siteUrl,
      })
    );

    const subjectByKind: Record<SubscriptionAlertKind, string> = {
      upgraded: `Your ${planLabel} plan has been upgraded`,
      downgraded: `Your plan is now ${planLabel}`,
      payment_failed: "Payment failed on your subscription",
      canceled: "Your subscription was canceled",
    };

    const result = await sendTransactionalEmail({
      templateKey: `employer.subscription.${parsed.kind}`,
      to: employer.email,
      subject: subjectByKind[parsed.kind],
      html,
      text,
      userId: employer.id,
      role: "employer",
      tierSlug,
      tags: {
        category: "billing",
        kind: parsed.kind,
        plan: tierSlug,
      },
      idempotencyKey: parsed.idempotencyKey,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, messageId: result.messageId };
  } catch (err) {
    safeError("notifyEmployerSubscriptionAlert:", err);
    return { success: false, error: "Failed to send subscription alert." };
  }
}

/**
 * Optional engagement nudge: profile incomplete ~48h after signup.
 */
export async function notifyWorkerProfileNudge(input: {
  workerId: string;
}): Promise<{ success: true; skipped?: boolean; messageId?: string } | { success: false; error: string }> {
  try {
    const parsed = notifyProfileNudgeSchema.parse(input);
    const admin = await createAdminClient();

    const { data: worker } = await admin
      .from("profiles")
      .select(
        "id, email, role, first_name, middle_name, last_name, is_verified, created_at"
      )
      .eq("id", parsed.workerId)
      .maybeSingle();

    if (!worker?.email || worker.role !== "worker") {
      return { success: true, skipped: true };
    }

    const [{ count: skillCount }, { count: docCount }] = await Promise.all([
      admin
        .from("worker_skills")
        .select("id", { count: "exact", head: true })
        .eq("worker_id", worker.id),
      admin
        .from("verification_documents")
        .select("id", { count: "exact", head: true })
        .eq("worker_id", worker.id),
    ]);

    const missingItems: string[] = [];
    if (!worker.is_verified && (docCount ?? 0) === 0) {
      missingItems.push("Upload a government ID for verification");
    }
    if ((skillCount ?? 0) < 3) {
      missingItems.push("Add at least 3 skills");
    }

    if (missingItems.length === 0) {
      return { success: true, skipped: true };
    }

    const siteUrl = getSiteUrl();
    const workerName = formatFullName(
      worker.first_name,
      worker.middle_name,
      worker.last_name
    );

    const { html, text } = await renderReactEmail(
      React.createElement(WorkerProfileNudgeEmail, {
        workerName: workerName || null,
        missingItems,
        ctaUrl: `${siteUrl}/worker/profile`,
        siteUrl,
      })
    );

    const result = await sendTransactionalEmail({
      templateKey: "worker.profile.optimization_nudge",
      to: worker.email,
      subject: "Finish your Replaceme profile",
      html,
      text,
      userId: worker.id,
      role: "worker",
      tags: {
        category: "engagement",
        nudge: "profile_48h",
      },
      idempotencyKey: `worker-profile-nudge/${worker.id}`,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, messageId: result.messageId };
  } catch (err) {
    safeError("notifyWorkerProfileNudge:", err);
    return { success: false, error: "Failed to send profile nudge." };
  }
}
