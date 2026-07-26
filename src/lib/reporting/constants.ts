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

export const ADMIN_REPORTS_TABS = ["platform", "jobs"] as const;

export type AdminReportsTab = (typeof ADMIN_REPORTS_TABS)[number];

/** Tabs for unified Case Center at /admin/disputes */
export const ADMIN_DISPUTES_TABS = [
  "financial",
  "safety",
  "resolved",
] as const;

export type AdminDisputesTab = (typeof ADMIN_DISPUTES_TABS)[number];

export const CASE_STAGES = [
  "awaiting_evidence",
  "in_mediation",
  "arbitration_noted",
  "resolved",
  "dismissed",
] as const;

export type CaseStage = (typeof CASE_STAGES)[number];

export const CASE_STAGE_LABELS: Record<CaseStage, string> = {
  awaiting_evidence: "Awaiting Evidence",
  in_mediation: "In Mediation",
  arbitration_noted: "Arbitration Noted",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const RESOLUTION_OUTCOMES = [
  "non_binding_recommendation",
  "favor_employer_recorded",
  "favor_worker_recorded",
  "mutual_closure",
  "funds_at_risk_noted",
  "policy_warn",
  "policy_suspend",
  "dismissed",
] as const;

export type ResolutionOutcome = (typeof RESOLUTION_OUTCOMES)[number];

export const RESOLUTION_OUTCOME_LABELS: Record<ResolutionOutcome, string> = {
  non_binding_recommendation: "Non-binding recommendation",
  favor_employer_recorded: "Favor employer (recorded)",
  favor_worker_recorded: "Favor worker (recorded)",
  mutual_closure: "Mutual closure",
  funds_at_risk_noted: "Funds-at-risk note",
  policy_warn: "Policy warning issued",
  policy_suspend: "Policy suspension",
  dismissed: "Dismissed",
};

/** Violation categories treated as financial / wage mediation cases. */
export const FINANCIAL_VIOLATIONS = ["wage_dispute"] as const;

export function isFinancialViolation(
  category: string
): category is (typeof FINANCIAL_VIOLATIONS)[number] {
  return (FINANCIAL_VIOLATIONS as readonly string[]).includes(category);
}

export function isFinancialCaseCategory(
  category: string
): boolean {
  return category === "legacy_mediation" || isFinancialViolation(category);
}

export function formatDisputedAmount(
  cents: number | null,
  currency: string | null
): string | null {
  if (cents == null) return null;
  const cur = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${cur}`;
  }
}
