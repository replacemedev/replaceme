/**
 * Static legal / compliance content — not fetched from the database.
 */

import type { PageContentMeta } from "@/types/page-content";

/** Discovery plan: human review SLA before publish (not auto-approve). */
export const DISCOVERY_JOB_APPROVAL_SLA = {
  /** Marketing / Terms: review within this many business days. */
  targetBusinessDays: 2,
  /** Ops badge: warn admins after this many hours pending. */
  remindAfterHours: 24,
  /** Ops badge: mark overdue after this many hours (≈ 2 calendar days). */
  overdueAfterHours: 48,
} as const;

export const LEGAL_LAST_UPDATED = "July 29, 2026";

export const PRIVACY_PAGE_META: PageContentMeta = {
  lastUpdated: LEGAL_LAST_UPDATED,
  badge: "Legal",
  badgeVariant: "pill",
  wide: true,
};

export const TERMS_PAGE_META: PageContentMeta = {
  lastUpdated: LEGAL_LAST_UPDATED,
  badge: "Legal Document",
  badgeVariant: "text",
  wide: true,
};

export const COOKIE_PAGE_META: PageContentMeta = {
  lastUpdated: LEGAL_LAST_UPDATED,
  badge: "Legal",
  badgeVariant: "pill",
  wide: true,
};


export const REFUND_PAGE_META: PageContentMeta = {
  lastUpdated: LEGAL_LAST_UPDATED,
  badge: "Legal",
  badgeVariant: "pill",
  wide: true,
};

/**
 * Merchant-of-record disclosure for Stripe employer subscriptions.
 * Update ABN when issued; do not invent a registration number.
 */
export const BILLING_MERCHANT = {
  country: "Australia",
  countryCode: "AU",
  /** Display name until a formal registered trading name is supplied. */
  displayName: "Replaceme",
  /** Set when the Australian entity has an ABN (e.g. "12 345 678 901"). */
  abn: null as string | null,
  supportEmail: "support@replaceme.ph",
  billingCurrency: "USD",
} as const;

/** Bump when cookie purposes/categories change so the consent banner reappears. */
export const COOKIE_POLICY_VERSION = "cookie-policy-v2";

/** Unsuccessful application packets: months after job close / terminal status (RA 10173 + GDPR-aligned). */
export const APPLICATION_RETENTION_MONTHS_AFTER_JOB_CLOSE = 6;

/** Documented retention periods surfaced in Privacy Policy §9 and deletion UX. */
export const DATA_RETENTION_PERIODS = [
  {
    category: "Account profile",
    period: "While the account is active, then up to 30 days after closure for recovery",
  },
  {
    category: "Government ID images & verification metadata",
    period:
      "Until verification purpose is fulfilled, then deleted or anonymized within 90 days unless a legal hold applies",
  },
  {
    category: "Job applications (unsuccessful / withdrawn)",
    period: `Deleted or anonymized ${APPLICATION_RETENTION_MONTHS_AFTER_JOB_CLOSE} months after the related job closes or a terminal decision (rejected / withdrawn), unless a legal hold, dispute, or fraud investigation applies`,
  },
  {
    category: "Messaging threads",
    period:
      "While relevant to open roles or account activity, then up to 24 months for support and dispute handling",
  },
  {
    category: "Billing ledger & invoices (Stripe metadata)",
    period: "Up to 7 years where tax or accounting law requires",
  },
  {
    category: "Security / audit logs",
    period:
      "Up to 24 months for fraud prevention, incident response, and SOC 2 / GDPR accountability evidence. Entries are append-only (staff cannot alter or erase them via the admin portal). Actor identity, action, target, timestamp, and source IP are retained; longer under legal hold",
  },
  {
    category: "Admin in-app notifications (Identity / Moderation / Billing / System)",
    period:
      "Up to 24 months as a secondary operational alert trail for Trust & Safety triage. Archiving hides an alert from an administrator's inbox UI but does not erase the database record; hard erasure follows account-lifecycle and legal-hold processes only (RA 10173 / GDPR storage limitation)",
  },
  {
    category: "Job post moderation records",
    period:
      "Up to 24 months after a moderation decision (approve, reject, or soft-delete/remove), including reason category, optional explanation, soft-delete timestamps, and admin actor—for Trust & Safety, dispute, and compliance audits—unless a legal hold requires longer. Soft-deleted listings leave public boards but may remain recoverable by authorized administrators (capability-scoped) during that audit window",
  },
  {
    category: "Worker→employer abuse & safety reports",
    period:
      "Up to 24 months after case closure (resolved or dismissed), including violation category, evidence attachments, admin notes, and actor IDs—for Trust & Safety investigation, anti-retaliation, and legal defense. Employer→worker reporting is not offered. Reporter identity is restricted to Super administrators and Moderators with Reports/Disputes capability and is not disclosed to the reported party except by court order or explicit reporter consent (RA 10173 / GDPR)",
  },
  {
    category: "Admin staff operational data",
    period:
      "Work email, optional staff profile photo, department, timezone, short bio, MFA enrollment metadata (TOTP factors managed in the admin Security Center), invite timestamps, module capability grants, directory opt-in flag, and admin action audit logs—retained up to 24 months with security/audit logs (or longer under legal hold). Staff who opt in may publish name, photo, department, timezone, and bio on the public /team page (email and phone stay private). Password credentials are handled by the auth provider (hashed); in-app password change and email reset are available to each signed-in admin. Processed as employment/contractor operational data under RA 10173 / GDPR accountability",
  },
  {
    category: "Cookie consent records",
    period: "Aligned with Cookie Policy version; refreshed on consent change",
  },
] as const;

export const DELETION_REQUEST_SUPPORT_EMAIL = "support@replaceme.ph";

export const DELETION_REQUEST_SLA =
  "We aim to acknowledge deletion requests within 5 business days and complete eligible erasure within 30 days, subject to legal retention exceptions.";

/** Operational timelines for admin account lifecycle (suspend / delete / appeal). */
export const ACCOUNT_LIFECYCLE_TIMELINES = {
  suspendDefaultDays: 30,
  suspendOptionsDays: [7, 14, 30, 90] as const,
  suspendIndefiniteAllowed: true,
  deletionAckBusinessDays: 5,
  deletionGraceCalendarDays: 30,
  eligibleErasureCalendarDays: 30,
  appealAckBusinessDays: 2,
  billingRetainYears: 7,
  kycImageDaysAfterPurpose: 90,
  auditLogMonths: 24,
} as const;

export const SUBPROCESSORS = [
  {
    name: "Stripe",
    purpose:
      "Payment processing, subscriptions, invoicing, and Stripe Tax calculation for employer plan billing (Australian merchant of record)",
    region: "United States / Australia / global",
  },
  {
    name: "Resend",
    purpose: "Transactional and lifecycle email delivery",
    region: "United States",
  },
  {
    name: "Supabase",
    purpose: "Database, authentication, storage, and hosting infrastructure",
    region: "Configured project region (Southeast Asia / global edge)",
  },
  {
    name: "Vercel",
    purpose: "Application hosting, edge delivery, and serverless compute",
    region: "United States / global edge",
  },
  {
    name: "Cloudflare",
    purpose: "Bot protection (Turnstile) and related edge security services",
    region: "Global",
  },
  {
    name: "Upstash",
    purpose: "Redis-backed rate limiting and ephemeral operational caches",
    region: "Configured project region",
  },
  {
    name: "Sentry",
    purpose: "Application error monitoring (when enabled for the environment)",
    region: "United States / global",
  },
] as const;

export const APPEAL_SLA_COPY =
  "We aim to acknowledge account appeals within 2 business days and will communicate next steps once the review is underway.";

/** Add calendar days to an ISO string or Date (local calendar date arithmetic). */
export function addCalendarDays(isoOrDate: string | Date, days: number): Date {
  const base =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : new Date(isoOrDate.getTime());
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

/** Human-readable closure / grace-end date for UI (e.g. "July 25, 2026"). */
export function formatClosureDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
