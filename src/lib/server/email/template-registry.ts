/**
 * Catalog of transactional / system email templates for admin preview + toggles.
 */

export type EmailTemplateCategory = "auth" | "lifecycle" | "marketplace" | "billing";

export type EmailTemplateRegistryItem = {
  key: string;
  name: string;
  category: EmailTemplateCategory;
  channel: "string-html" | "react-email";
  /** Auth / account recovery — cannot be disabled. */
  critical: boolean;
  description: string;
};

export const EMAIL_TEMPLATE_REGISTRY: EmailTemplateRegistryItem[] = [
  {
    key: "auth.confirm_signup",
    name: "Confirm signup",
    category: "auth",
    channel: "string-html",
    critical: true,
    description: "Email verification after registration.",
  },
  {
    key: "auth.reset_password",
    name: "Password reset",
    category: "auth",
    channel: "string-html",
    critical: true,
    description: "Secure password reset link.",
  },
  {
    key: "kyc.approved",
    name: "KYC approved",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Worker identity verification approved.",
  },
  {
    key: "kyc.decision",
    name: "KYC decision",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Worker identity verification needs action.",
  },
  {
    key: "account.suspended",
    name: "Account suspended",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Account suspension notice.",
  },
  {
    key: "account.unsuspended",
    name: "Account unsuspended",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Account reinstatement notice.",
  },
  {
    key: "account.warning",
    name: "Account warning",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Trust & Safety warning without naming the reporter.",
  },
  {
    key: "account.deletion_scheduled",
    name: "Deletion scheduled",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Account deletion cooling-off started.",
  },
  {
    key: "account.deletion_complete",
    name: "Deletion complete",
    category: "lifecycle",
    channel: "string-html",
    critical: false,
    description: "Account erasure completed.",
  },
  {
    key: "job.approved",
    name: "Job approved",
    category: "marketplace",
    channel: "string-html",
    critical: false,
    description: "Employer job listing approved.",
  },
  {
    key: "job.rejected",
    name: "Job rejected",
    category: "marketplace",
    channel: "string-html",
    critical: false,
    description: "Employer job listing rejected.",
  },
  {
    key: "employer.new_applicant",
    name: "New applicant",
    category: "marketplace",
    channel: "react-email",
    critical: false,
    description: "Instant alert when a worker applies.",
  },
  {
    key: "worker.application_status",
    name: "Application status",
    category: "marketplace",
    channel: "react-email",
    critical: false,
    description: "Worker application status update.",
  },
  {
    key: "employer.subscription_alert",
    name: "Subscription alert",
    category: "billing",
    channel: "react-email",
    critical: false,
    description: "Billing / subscription notices for employers.",
  },
  {
    key: "admin.broadcast",
    name: "Admin broadcast",
    category: "marketplace",
    channel: "react-email",
    critical: false,
    description: "Segment broadcasts from Email Management.",
  },
];

export const CRITICAL_TEMPLATE_KEYS = new Set(
  EMAIL_TEMPLATE_REGISTRY.filter((t) => t.critical).map((t) => t.key)
);
