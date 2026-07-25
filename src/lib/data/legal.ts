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
