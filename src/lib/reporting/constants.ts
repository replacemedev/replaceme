export const REPORT_CATEGORIES = [
  "bug",
  "ui_error",
  "malicious_user",
  "feature_request",
  "other",
] as const;

export const REPORT_STATUSES = ["open", "in_progress", "resolved"] as const;

/** User-to-user Trust & Safety violation taxonomy (Upwork / OLJ-aligned). */
export const USER_REPORT_VIOLATIONS = [
  "scam_fraud",
  "payment_circumvention",
  "harassment",
  "wage_dispute",
  "identity_misrepresentation",
  "spam_misleading",
  "other",
] as const;

export type UserReportViolation = (typeof USER_REPORT_VIOLATIONS)[number];

export const USER_REPORT_VIOLATION_LABELS: Record<UserReportViolation, string> = {
  scam_fraud: "Scam / Fraud",
  payment_circumvention: "Off-platform payment",
  harassment: "Harassment / Abuse",
  wage_dispute: "Wage / Payment dispute",
  identity_misrepresentation: "Identity misrepresentation",
  spam_misleading: "Spam / Misleading",
  other: "Other",
};

export const USER_REPORT_STATUSES = [
  "open",
  "investigating",
  "resolved",
  "dismissed",
] as const;

export type UserReportStatus = (typeof USER_REPORT_STATUSES)[number];

export const USER_REPORT_STATUS_LABELS: Record<UserReportStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const ADMIN_REPORTS_TABS = [
  "platform",
  "jobs",
  "employers",
  "workers",
] as const;

export type AdminReportsTab = (typeof ADMIN_REPORTS_TABS)[number];
