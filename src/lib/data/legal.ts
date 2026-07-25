/**
 * Static legal / compliance content — not fetched from the database.
 */

import type { PageContentMeta } from "@/types/page-content";

export const LEGAL_LAST_UPDATED = "July 25, 2026";

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

export const EMPLOYER_DPA_PAGE_META: PageContentMeta = {
  lastUpdated: LEGAL_LAST_UPDATED,
  badge: "Legal",
  badgeVariant: "pill",
  wide: true,
};

/** Bump when cookie purposes/categories change so the consent banner reappears. */
export const COOKIE_POLICY_VERSION = "cookie-policy-v2";

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
    category: "Applications & messaging",
    period: "While relevant to open roles or account activity, then up to 24 months",
  },
  {
    category: "Billing ledger & invoices (Stripe metadata)",
    period: "Up to 7 years where tax or accounting law requires",
  },
  {
    category: "Security / audit logs",
    period: "Up to 24 months for fraud prevention and incident response",
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
    purpose: "Payment processing, subscriptions, and billing ledger",
    region: "United States / global",
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
