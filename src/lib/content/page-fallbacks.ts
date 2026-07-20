import { PUBLIC_HELP_ARTICLES } from "@/config/publicNav";
import type {
  AuthScreenConfig,
  ContactPageConfig,
  HelpIndexConfig,
  PageContentMeta,
  PricingPageConfig,
} from "@/types/page-content";

export const PRIVACY_FALLBACK_META: PageContentMeta = {
  lastUpdated: "July 14, 2026",
  badge: "Legal",
  badgeVariant: "pill",
  wide: true,
};

export const COOKIE_FALLBACK_META: PageContentMeta = {
  lastUpdated: "July 14, 2026",
  badge: "Legal",
  badgeVariant: "pill",
  wide: true,
};

/** Bump when cookie purposes/categories change so the consent banner reappears. */
export const COOKIE_POLICY_VERSION = "cookie-policy-v2";

export const TERMS_FALLBACK_META: PageContentMeta = {
  lastUpdated: "July 14, 2026",
  badge: "Legal Document",
  badgeVariant: "text",
  wide: true,
};

export const PRICING_FALLBACK: PricingPageConfig = {
  headline: "Simple, Transparent Pricing",
  description:
    "Discovery is free ($0). Starter $19/mo, Growth $39/mo, Scale $79/mo — workers always join for free.",
};

export const HELP_INDEX_FALLBACK: HelpIndexConfig = {
  title: "Help Center",
  description: "Guides and policies for workers and employers on Replaceme.",
  articles: [...PUBLIC_HELP_ARTICLES],
};

export const HIRING_GUIDE_FALLBACK_META: PageContentMeta = {
  description:
    "A simple, step-by-step playbook to find and hire top remote talent on ReplaceMe.",
};

export const CONTACT_FALLBACK: ContactPageConfig = {
  badge: "Support",
  title: "Contact Us",
  description: "We're here to help with account, billing, or platform questions.",
  email: "support@replaceme.ph",
};

export const AUTH_LOGIN_FALLBACK: AuthScreenConfig = {
  headline: "Welcome back",
  description:
    "Sign in to access your professional dashboard and manage your network.",
  signupPrompt: "Don't have an account?",
  signupLinkLabel: "Sign up",
  testimonialQuote:
    "This platform has transformed how we connect with top-tier professionals. It's an indispensable tool for our daily operations.",
  testimonialName: "Sarah Jenkins",
  testimonialRole: "Director of Operations, TechCorp",
};

export const AUTH_SIGNUP_FALLBACK: AuthScreenConfig = {
  headline: "Create your account",
  description: "Join the premier professional marketplace.",
  signupPrompt: "Already have an account?",
  signupLinkLabel: "Log in",
};
