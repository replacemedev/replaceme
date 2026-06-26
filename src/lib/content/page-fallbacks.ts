import { PUBLIC_HELP_ARTICLES } from "@/config/publicNav";
import type {
  ContactPageConfig,
  HelpIndexConfig,
  PageContentMeta,
  PricingPageConfig,
} from "@/types/page-content";

export const PRIVACY_FALLBACK_META: PageContentMeta = {
  lastUpdated: "January 26, 2026",
  badge: "Legal",
  badgeVariant: "pill",
};

export const TERMS_FALLBACK_META: PageContentMeta = {
  lastUpdated: "January 24, 2026",
  badge: "Legal Document",
  badgeVariant: "text",
  wide: true,
};

export const PRICING_FALLBACK: PricingPageConfig = {
  headline: "Simple, Transparent Pricing",
  description:
    "Compare plans and create a free employer account to post jobs. Workers always join for free.",
};

export const HELP_INDEX_FALLBACK: HelpIndexConfig = {
  title: "Help Center",
  description: "Guides and policies for workers and employers on ReplaceMe.",
  articles: [...PUBLIC_HELP_ARTICLES],
};

export const HIRING_GUIDE_FALLBACK_META: PageContentMeta = {
  description:
    "A practical playbook for posting jobs, reviewing applicants, and hiring remote talent through ReplaceMe.",
};

export const CONTACT_FALLBACK: ContactPageConfig = {
  badge: "Support",
  title: "Contact Us",
  description: "We're here to help with account, billing, or platform questions.",
  email: "support@replaceme.com",
};
