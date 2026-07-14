"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { runAction, ok, fail } from "@/lib/server/action-result";
import { requireRole } from "@/lib/server/auth/session";
import { fetchEmployerEntitlements } from "@/lib/server/entitlements";
import { sendTransactionalEmail, type EmailTierSlug } from "@/lib/server/email/mailer";
import {
  renderEmployerSupportEmail,
  renderWorkerNotificationEmail,
} from "@/lib/server/email/email-templates";
import { getSupportInboxEmail } from "@/lib/server/resend/client";
import { formatFullName } from "@/lib/format/name";
import { getSiteUrl } from "@/lib/auth/site-url";
import { uuidSchema } from "@/lib/validations/common";
import { assertRateLimit } from "@/lib/server/rate-limit";
import { TIER_LABELS } from "@/lib/entitlements/ui-copy";
import type { SubscriptionTier } from "@/types/employer/billing";

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

function normalizeTierSlug(slug: string | null | undefined): EmailTierSlug {
  const value = (slug ?? "discovery").toLowerCase();
  if (
    value === "starter" ||
    value === "growth" ||
    value === "scale" ||
    value === "discovery"
  ) {
    return value;
  }
  if (value === "free" || value === "essential" || value === "professional") {
    if (value === "essential") return "starter";
    if (value === "professional") return "growth";
    return "discovery";
  }
  return "discovery";
}

function planLabelForSlug(slug: EmailTierSlug): string {
  return TIER_LABELS[slug as SubscriptionTier] ?? slug;
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
    const tierSlug = normalizeTierSlug(entitlements?.planSlug);

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
 * Reusable transactional notification to a worker (e.g. application status).
 * Callable from other server modules, or from the client by admins / employers.
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
