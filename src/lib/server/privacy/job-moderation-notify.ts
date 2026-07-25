import { getSiteUrl } from "@/lib/auth/site-url";
import { DELETION_REQUEST_SUPPORT_EMAIL } from "@/lib/data/legal";
import {
  renderJobApprovedEmail,
  renderJobRejectedEmail,
} from "@/lib/server/email/email-templates";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import { createAdminClient } from "@/lib/supabase/server";
import {
  JOB_REJECTION_CATEGORY_LABELS,
  type JobRejectionCategory,
} from "@/types/admin.types";
import { safeError } from "@/utils/logger";

type NotifyOutcome =
  | { notified: true; emailSent: boolean }
  | { notified: false; skipped: string };

async function loadEmployerContact(employerId: string) {
  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, first_name, last_name")
    .eq("id", employerId)
    .maybeSingle();

  const { data: company } = await admin
    .from("company_profiles")
    .select("company_name")
    .eq("employer_id", employerId)
    .maybeSingle();

  const fallbackName = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ");

  return {
    email: profile?.email ?? null,
    companyName: company?.company_name ?? (fallbackName || null),
  };
}

export async function notifyEmployerJobRejected(input: {
  employerId: string;
  jobId: string;
  jobTitle: string;
  category: JobRejectionCategory;
  reason?: string | null;
}): Promise<NotifyOutcome> {
  try {
    const admin = await createAdminClient();
    const contact = await loadEmployerContact(input.employerId);
    const categoryLabel = JOB_REJECTION_CATEGORY_LABELS[input.category];
    const siteUrl = getSiteUrl().replace(/\/$/, "");
    const jobsUrl = `${siteUrl}/employer/jobs`;
    const message = `Your job post "${input.jobTitle}" was not approved (${categoryLabel}).${
      input.reason?.trim() ? ` ${input.reason.trim()}` : ""
    }`;

    await admin.rpc("create_notification", {
      p_user_id: input.employerId,
      p_type: "job_moderation",
      p_title: "Job post not approved",
      p_message: message,
      p_action_url: `/employer/jobs/${input.jobId}`,
      p_metadata: {
        job_id: input.jobId,
        decision: "rejected",
        rejection_category: input.category,
      },
    });

    if (!contact.email?.trim()) {
      return { notified: true, emailSent: false };
    }

    const email = renderJobRejectedEmail({
      companyName: contact.companyName,
      jobTitle: input.jobTitle,
      categoryLabel,
      reason: input.reason,
      ctaUrl: jobsUrl,
      supportEmail: DELETION_REQUEST_SUPPORT_EMAIL,
    });

    const result = await sendTransactionalEmail({
      templateKey: "employer.job.rejected",
      to: contact.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.employerId,
      role: "employer",
      tags: {
        category: "job_moderation",
        decision: "rejected",
      },
      idempotencyKey: `job-rejected/${input.jobId}/${Date.now()}`.slice(0, 256),
    });

    return { notified: true, emailSent: result.success };
  } catch (err) {
    safeError("notifyEmployerJobRejected:", err);
    return { notified: false, skipped: "notify_failed" };
  }
}

export async function notifyEmployerJobApproved(input: {
  employerId: string;
  jobId: string;
  jobTitle: string;
}): Promise<NotifyOutcome> {
  try {
    const admin = await createAdminClient();
    const contact = await loadEmployerContact(input.employerId);
    const siteUrl = getSiteUrl().replace(/\/$/, "");
    const jobUrl = `${siteUrl}/employer/jobs/${input.jobId}`;

    await admin.rpc("create_notification", {
      p_user_id: input.employerId,
      p_type: "job_moderation",
      p_title: "Job post published",
      p_message: `"${input.jobTitle}" is live and visible to workers.`,
      p_action_url: `/employer/jobs/${input.jobId}`,
      p_metadata: {
        job_id: input.jobId,
        decision: "approved",
      },
    });

    if (!contact.email?.trim()) {
      return { notified: true, emailSent: false };
    }

    const email = renderJobApprovedEmail({
      companyName: contact.companyName,
      jobTitle: input.jobTitle,
      ctaUrl: jobUrl,
    });

    const result = await sendTransactionalEmail({
      templateKey: "employer.job.approved",
      to: contact.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.employerId,
      role: "employer",
      tags: {
        category: "job_moderation",
        decision: "approved",
      },
      idempotencyKey: `job-approved/${input.jobId}/${Date.now()}`.slice(0, 256),
    });

    return { notified: true, emailSent: result.success };
  } catch (err) {
    safeError("notifyEmployerJobApproved:", err);
    return { notified: false, skipped: "notify_failed" };
  }
}
