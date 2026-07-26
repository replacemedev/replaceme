import { getSiteUrl } from "@/lib/auth/site-url";
import { DELETION_REQUEST_SUPPORT_EMAIL } from "@/lib/data/legal";
import {
  renderKycApprovedEmail,
  renderKycDecisionEmail,
} from "@/lib/server/email/email-templates";
import { sendTransactionalEmail } from "@/lib/server/email/mailer";
import { createAdminClient } from "@/lib/supabase/server";
import { formatFullName } from "@/lib/format/name";
import { safeError } from "@/utils/logger";

type NotifyOutcome =
  | { notified: true; emailSent: boolean }
  | { notified: false; skipped: string };

async function loadWorkerContact(workerId: string) {
  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, first_name, middle_name, last_name")
    .eq("id", workerId)
    .maybeSingle();

  return {
    email: profile?.email ?? null,
    name:
      formatFullName(
        profile?.first_name,
        profile?.middle_name,
        profile?.last_name
      ) || null,
  };
}

export async function notifyWorkerKycDecision(input: {
  workerId: string;
  decision: "approved" | "rejected" | "resubmission_required";
  reason?: string | null;
}): Promise<NotifyOutcome> {
  try {
    const admin = await createAdminClient();
    const contact = await loadWorkerContact(input.workerId);
    const siteUrl = getSiteUrl().replace(/\/$/, "");
    const verificationUrl = `${siteUrl}/worker/verification`;

    const title =
      input.decision === "approved"
        ? "Identity verified"
        : input.decision === "resubmission_required"
          ? "Resubmit identity documents"
          : "Identity verification not approved";

    const message =
      input.decision === "approved"
        ? "Your identity verification was approved. Your verified badge is now active."
        : `Your identity verification needs attention.${
            input.reason?.trim() ? ` ${input.reason.trim()}` : ""
          }`;

    await admin.rpc("create_notification", {
      p_user_id: input.workerId,
      p_type: "verification_update",
      p_title: title,
      p_message: message,
      p_action_url: "/worker/verification",
      p_metadata: {
        decision: input.decision,
        reason: input.reason?.trim() || null,
      },
    });

    if (!contact.email?.trim()) {
      return { notified: true, emailSent: false };
    }

    if (input.decision === "approved") {
      const email = renderKycApprovedEmail({
        workerName: contact.name,
        ctaUrl: verificationUrl,
      });
      const result = await sendTransactionalEmail({
        templateKey: "worker.kyc.approved",
        to: contact.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        userId: input.workerId,
        role: "worker",
        tags: { category: "kyc", decision: "approved" },
        idempotencyKey: `kyc-approved/${input.workerId}/${Date.now()}`.slice(
          0,
          256
        ),
      });
      return { notified: true, emailSent: result.success };
    }

    const reason =
      input.reason?.trim() ||
      "Please review the feedback in your verification dashboard and resubmit.";
    const email = renderKycDecisionEmail({
      workerName: contact.name,
      decision: input.decision,
      reason,
      ctaUrl: verificationUrl,
      supportEmail: DELETION_REQUEST_SUPPORT_EMAIL,
    });
    const result = await sendTransactionalEmail({
      templateKey:
        input.decision === "resubmission_required"
          ? "worker.kyc.resubmission"
          : "worker.kyc.rejected",
      to: contact.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      userId: input.workerId,
      role: "worker",
      tags: { category: "kyc", decision: input.decision },
      idempotencyKey: `kyc-${input.decision}/${input.workerId}/${Date.now()}`.slice(
        0,
        256
      ),
    });
    return { notified: true, emailSent: result.success };
  } catch (err) {
    safeError("notifyWorkerKycDecision:", err);
    return { notified: false, skipped: "notify_failed" };
  }
}
