import { createAdminClient } from "@/lib/supabase/server";
import { DISCOVERY_JOB_APPROVAL_SLA } from "@/lib/data/legal";
import { safeError, safeLog } from "@/utils/logger";

export type JobModerationSlaReminderResult = {
  dueSoon: number;
  overdue: number;
  notified: boolean;
  skipped: string | null;
};

/**
 * Daily Discovery queue SLA reminder for admins.
 * Never auto-approves — preserves human review for free-tier posts.
 */
export async function remindAdminsDiscoveryJobSla(): Promise<JobModerationSlaReminderResult> {
  const admin = await createAdminClient();
  const now = Date.now();
  const dueSoonCutoff = new Date(
    now - DISCOVERY_JOB_APPROVAL_SLA.remindAfterHours * 60 * 60 * 1000
  ).toISOString();
  const overdueCutoff = new Date(
    now - DISCOVERY_JOB_APPROVAL_SLA.overdueAfterHours * 60 * 60 * 1000
  ).toISOString();

  const { data: pending, error } = await admin
    .from("jobs")
    .select("id, title, submitted_for_review_at")
    .eq("status", "Pending Review")
    .is("deleted_at", null)
    .not("submitted_for_review_at", "is", null);

  if (error) throw new Error(error.message);

  let dueSoon = 0;
  let overdue = 0;
  for (const job of pending ?? []) {
    const submitted = job.submitted_for_review_at;
    if (!submitted) continue;
    if (submitted <= overdueCutoff) overdue += 1;
    else if (submitted <= dueSoonCutoff) dueSoon += 1;
  }

  if (dueSoon === 0 && overdue === 0) {
    return { dueSoon: 0, overdue: 0, notified: false, skipped: "queue_clear" };
  }

  const dayKey = new Date().toISOString().slice(0, 10);
  const dayStart = `${dayKey}T00:00:00.000Z`;

  const { data: existing } = await admin
    .from("notifications")
    .select("id, metadata")
    .eq("type", "moderation_queue")
    .gte("created_at", dayStart)
    .limit(40);

  const alreadySent = (existing ?? []).some((row) => {
    const meta = row.metadata;
    return (
      meta &&
      typeof meta === "object" &&
      !Array.isArray(meta) &&
      (meta as Record<string, unknown>).cron === "job_moderation_sla" &&
      (meta as Record<string, unknown>).day === dayKey
    );
  });

  if (alreadySent) {
    return { dueSoon, overdue, notified: false, skipped: "already_sent_today" };
  }

  const title =
    overdue > 0
      ? "Discovery job SLA overdue"
      : "Discovery jobs approaching SLA";
  const message =
    overdue > 0
      ? `${overdue} Discovery job(s) pending past ${DISCOVERY_JOB_APPROVAL_SLA.overdueAfterHours}h (2-day SLA). ${dueSoon} more due soon. Review before auto-promises slip — do not leave unpaid listings unpublished.`
      : `${dueSoon} Discovery job(s) pending over ${DISCOVERY_JOB_APPROVAL_SLA.remindAfterHours}h. Clear the queue within ${DISCOVERY_JOB_APPROVAL_SLA.targetBusinessDays} business days.`;

  const { error: notifyError } = await admin.rpc("notify_admins", {
    p_type: "moderation_queue",
    p_title: title,
    p_message: message,
    p_action_url: "/admin/jobs?status=Pending+Review",
    p_metadata: {
      cron: "job_moderation_sla",
      day: dayKey,
      due_soon: dueSoon,
      overdue,
      audience: "admin",
    },
  });

  if (notifyError) {
    safeError("remindAdminsDiscoveryJobSla notify:", notifyError);
    throw new Error(notifyError.message);
  }

  safeLog(
    `job-moderation-sla: notified dueSoon=${dueSoon} overdue=${overdue}`
  );
  return { dueSoon, overdue, notified: true, skipped: null };
}
