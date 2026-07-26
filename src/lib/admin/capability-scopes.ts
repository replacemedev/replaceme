/**
 * Need-to-know maps: which module capability owns dashboard widgets,
 * audit action types, and admin notification types.
 * Superadmins bypass filters (caller checks isSuperAdmin).
 */

import {
  hasCapability,
  type AdminCapability,
} from "@/lib/admin/capabilities";
import type { PlatformMetrics, UrgentAlert } from "@/types/admin.types";

/** Dashboard metric keys stripped/shown by capability. */
export type DashboardMetricKey =
  | "total_users"
  | "active_jobs"
  | "pending_verifications"
  | "active_subscriptions"
  | "total_applications"
  | "active_contracts"
  | "verified_workers"
  | "user_growth_30d"
  | "job_activity_30d"
  | "urgent_alerts"
  | "recent_actions";

export const DASHBOARD_WIDGET_CAPABILITY: Record<
  DashboardMetricKey,
  AdminCapability
> = {
  total_users: "users",
  active_jobs: "jobs",
  pending_verifications: "identity",
  active_subscriptions: "billing",
  total_applications: "applications",
  active_contracts: "applications",
  verified_workers: "identity",
  user_growth_30d: "users",
  job_activity_30d: "jobs",
  urgent_alerts: "jobs",
  recent_actions: "audit_log",
};

/** Exact audit action → owning module. Unlisted → superadmin-only. */
const AUDIT_ACTION_EXACT: Record<string, AdminCapability | "superadmin_only"> = {
  suspend_user: "users",
  unsuspend_user: "users",
  schedule_account_deletion: "users",
  delete_user_account: "users",
  warn_user: "users",
  approve_job: "jobs",
  reject_job: "jobs",
  delete_job_post: "jobs",
  restore_job_post: "jobs",
  view_verification_documents: "identity",
  claim_verification_review: "identity",
  update_report_status: "reports",
  update_job_report_status: "reports",
  update_dispute: "disputes",
  update_dispute_case: "disputes",
  override_employer_plan: "billing",
  issue_stripe_refund: "billing",
  export_audit_logs: "audit_log",
  capability_denied: "security",
  "auth.revoke_other_sessions": "security",
  "auth.revoke_all_sessions": "security",
  update_admin_self_profile: "settings",
  upload_admin_avatar: "settings",
  remove_admin_avatar: "settings",
  invite_admin: "team",
  resend_admin_invite: "team",
  update_admin_capabilities: "team",
  update_admin_status: "team",
  update_admin_role: "team",
  admin_password_reset: "team",
  revoke_admin_invite: "team",
  view_admin_personal_details: "team",
  "messaging.view_thread": "moderation",
  "application.clear_flag": "applications",
};

const AUDIT_ACTION_PREFIXES: ReadonlyArray<{
  prefix: string;
  capability: AdminCapability | "superadmin_only";
}> = [
  { prefix: "user_", capability: "users" },
  { prefix: "job_", capability: "jobs" },
  { prefix: "identity_", capability: "identity" },
  { prefix: "verification_", capability: "identity" },
  { prefix: "kyc_", capability: "identity" },
  { prefix: "company_verif", capability: "identity" },
  { prefix: "report_", capability: "reports" },
  { prefix: "moderation_", capability: "moderation" },
  { prefix: "messaging.", capability: "moderation" },
  { prefix: "dispute_", capability: "disputes" },
  { prefix: "billing_", capability: "billing" },
  { prefix: "stripe_", capability: "billing" },
  { prefix: "override_", capability: "billing" },
  { prefix: "application.", capability: "applications" },
  { prefix: "application_", capability: "applications" },
  { prefix: "admin_", capability: "team" },
  { prefix: "invite_admin", capability: "team" },
  { prefix: "email_", capability: "email" },
  { prefix: "auth.", capability: "security" },
];

export function capabilityForAuditAction(
  actionType: string
): AdminCapability | "superadmin_only" {
  const exact = AUDIT_ACTION_EXACT[actionType];
  if (exact) return exact;
  for (const row of AUDIT_ACTION_PREFIXES) {
    if (actionType.startsWith(row.prefix)) return row.capability;
  }
  return "superadmin_only";
}

export function canViewAuditAction(
  actionType: string,
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;
  const owner = capabilityForAuditAction(actionType);
  if (owner === "superadmin_only") return false;
  return hasCapability(caps, owner);
}

export function filterAuditActionTypes(
  actionTypes: readonly string[],
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): string[] {
  if (isSuperAdmin) return [...actionTypes];
  return actionTypes.filter((t) => canViewAuditAction(t, caps, false));
}

export function filterAuditRowsByCapability<T extends { action_type: string }>(
  rows: readonly T[],
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): T[] {
  if (isSuperAdmin) return [...rows];
  return rows.filter((row) => canViewAuditAction(row.action_type, caps, false));
}

/** Allowed action_type values for DB `.in()` filters. Empty = none (moderator with no matching modules). */
export function allowedAuditActionTypesForQuery(
  knownTypes: readonly string[],
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): string[] | "all" {
  if (isSuperAdmin) return "all";
  return filterAuditActionTypes(knownTypes, caps, false);
}

export const NOTIFICATION_TYPE_CAPABILITY: Record<string, AdminCapability> = {
  identity_verification_request: "identity",
  verification_update: "identity",
  job_moderation: "jobs",
  moderation_queue: "jobs",
  flagged_report: "reports",
  billing_update: "billing",
  subscription_update: "billing",
  system_alert: "security",
  system: "security",
};

export function capabilityForNotificationType(
  type: string
): AdminCapability | null {
  return NOTIFICATION_TYPE_CAPABILITY[type] ?? null;
}

const URGENT_ALERT_CAPABILITY: Record<string, AdminCapability> = {
  moderation: "jobs",
  security: "security",
  system: "security",
};

export function filterUrgentAlerts(
  alerts: readonly UrgentAlert[],
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): UrgentAlert[] {
  if (isSuperAdmin) return [...alerts];
  return alerts.filter((alert) => {
    const required =
      URGENT_ALERT_CAPABILITY[alert.type] ??
      capabilityForNotificationType(alert.type) ??
      "jobs";
    return hasCapability(caps, required);
  });
}

export function canShowDashboardWidget(
  key: DashboardMetricKey,
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true;
  return hasCapability(caps, DASHBOARD_WIDGET_CAPABILITY[key]);
}

/** Strip metrics the caller must not see before crossing the RSC→client boundary. */
export function scopePlatformMetrics(
  metrics: PlatformMetrics,
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): PlatformMetrics {
  if (isSuperAdmin) return metrics;

  const zeroIf = (key: DashboardMetricKey, value: number) =>
    canShowDashboardWidget(key, caps, false) ? value : 0;

  return {
    ...metrics,
    total_users: zeroIf("total_users", metrics.total_users),
    total_workers: canShowDashboardWidget("total_users", caps, false)
      ? metrics.total_workers
      : 0,
    total_employers: canShowDashboardWidget("total_users", caps, false)
      ? metrics.total_employers
      : 0,
    active_jobs: zeroIf("active_jobs", metrics.active_jobs),
    pending_jobs: canShowDashboardWidget("active_jobs", caps, false)
      ? metrics.pending_jobs
      : 0,
    pending_verifications: zeroIf(
      "pending_verifications",
      metrics.pending_verifications
    ),
    active_subscriptions: zeroIf(
      "active_subscriptions",
      metrics.active_subscriptions
    ),
    total_applications: zeroIf("total_applications", metrics.total_applications),
    active_contracts: zeroIf("active_contracts", metrics.active_contracts),
    verified_workers: zeroIf("verified_workers", metrics.verified_workers),
    user_growth_30d: canShowDashboardWidget("user_growth_30d", caps, false)
      ? metrics.user_growth_30d
      : [],
    job_activity_30d: canShowDashboardWidget("job_activity_30d", caps, false)
      ? metrics.job_activity_30d
      : [],
    urgent_alerts: filterUrgentAlerts(metrics.urgent_alerts, caps, false),
  };
}

export function firstAllowedAdminHome(
  caps: readonly AdminCapability[],
  isSuperAdmin: boolean
): string {
  if (isSuperAdmin || hasCapability(caps, "dashboard")) return "/admin/dashboard";
  if (hasCapability(caps, "settings")) return "/admin/settings";
  return "/admin/settings/profile";
}
