import { z } from "zod";

export const notificationTypeSchema = z.enum([
  "new_applicant",
  "application_status",
  "new_message",
  "job_invite",
  "verification_update",
  "identity_verification_request",
  "moderation_queue",
  "flagged_report",
  "system_alert",
  "billing_update",
  "subscription_update",
  "worker_acceptance",
]);

export const notificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  action_url: z.string().nullable(),
  metadata: z
    .preprocess(
      (value) =>
        value && typeof value === "object" && !Array.isArray(value) ? value : null,
      z.record(z.string(), z.unknown()).nullable()
    )
    .optional(),
  is_read: z.boolean(),
  created_at: z.string(),
});

export const notificationListSchema = z.array(notificationSchema);

export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type Notification = z.infer<typeof notificationSchema>;

export type NotificationBootstrap = {
  notifications: Notification[];
  unreadCount: number;
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  new_applicant: "New applicant",
  application_status: "Application",
  new_message: "Message",
  job_invite: "Job invite",
  verification_update: "Verification",
  identity_verification_request: "Identity review",
  moderation_queue: "Moderation",
  flagged_report: "Report",
  system_alert: "System",
  system: "System",
  billing_update: "Billing",
  subscription_update: "Subscription",
  worker_acceptance: "Hiring",
};

function metaId(
  metadata: Record<string, unknown> | null | undefined,
  key: string
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
}

export function getNotificationHref(notification: Notification): string | null {
  const meta = notification.metadata ?? {};

  switch (notification.type) {
    case "new_applicant": {
      const jobId = metaId(meta, "job_id");
      if (jobId) return `/employer/jobs/${jobId}/applicants`;
      return notification.action_url ?? "/employer/dashboard";
    }
    case "application_status": {
      const applicationId = metaId(meta, "application_id");
      if (applicationId) return `/worker/applications/${applicationId}`;
      return notification.action_url ?? "/worker/applications";
    }
    case "new_message":
      return notification.action_url ?? "/worker/messages";
    case "worker_acceptance":
      return notification.action_url ?? "/worker/contracts";
    case "verification_update":
      return notification.action_url ?? "/worker/verification";
    case "identity_verification_request": {
      const workerId = metaId(meta, "worker_id");
      if (workerId) return `/admin/users/workers/${workerId}`;
      return notification.action_url ?? "/admin/identity";
    }
    case "moderation_queue": {
      const jobId = metaId(meta, "job_id");
      if (jobId) return `/admin/jobs/${jobId}`;
      return notification.action_url ?? "/admin/jobs";
    }
    case "flagged_report":
      return notification.action_url ?? "/admin/reports";
    case "billing_update":
    case "subscription_update":
      if (
        notification.action_url?.startsWith("/admin") ||
        meta.audience === "admin" ||
        meta.recipient_role === "admin"
      ) {
        return notification.action_url?.startsWith("/admin")
          ? notification.action_url
          : "/admin/billing";
      }
      return notification.action_url ?? "/employer/pricing";
    case "system_alert":
    case "system":
      return notification.action_url ?? "/admin/notifications";
    default:
      return notification.action_url ?? null;
  }
}
