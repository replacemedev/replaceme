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
  billing_update: "Billing",
  subscription_update: "Subscription",
  worker_acceptance: "Hiring",
};

export function getNotificationHref(notification: Notification): string | null {
  if (notification.action_url) return notification.action_url;

  const meta = notification.metadata ?? {};
  switch (notification.type) {
    case "new_applicant":
      return typeof meta.job_id === "string"
        ? `/employer/jobs/${meta.job_id}/applicants`
        : "/employer/dashboard";
    case "application_status":
      return typeof meta.application_id === "string"
        ? `/worker/applications/${meta.application_id}`
        : "/worker/applications";
    case "new_message":
      return "/worker/messages";
    case "worker_acceptance":
      return "/worker/contracts";
    case "verification_update":
      return "/worker/verification";
    case "identity_verification_request":
      return "/admin/identity";
    case "moderation_queue":
      return "/admin/moderation";
    case "flagged_report":
      return "/admin/reports";
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
      return "/employer/pricing";
    default:
      return null;
  }
}
