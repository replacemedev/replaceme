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

export const HELP_INDEX_CATEGORIES = [
  {
    id: "employers",
    title: "For Employers",
    description: "Guides on posting jobs, flat-rate pricing tiers, applicant pipelines, and direct candidate messaging.",
    articles: [
      {
        href: "/help/employer/hiring-guide",
        title: "Employer Hiring Guide",
        description: "How to write job posts, evaluate applicants, and hire remote talent directly on Replaceme.",
        icon: "Briefcase",
      },
      {
        href: "/help/employer/onboarding",
        title: "Employer Onboarding",
        description: "Learn how to set up your company profile, choose your flat-rate pricing tier, and manage your applicant pipeline.",
        icon: "Building2",
      },
      {
        href: "/help/employer/billing-subscriptions",
        title: "Billing & Subscriptions",
        description: "Manage your flat-rate pricing tier, payment methods, and invoice history.",
        icon: "CreditCard",
      },
    ],
  },
  {
    id: "workers",
    title: "For Workers",
    description: "Resources for job seekers to build profiles, land remote roles, and keep 100% of their earnings.",
    articles: [
      {
        href: "/help/worker/application-guide",
        title: "Job Seeker Application Guide",
        description: "Learn how to build a standout profile and apply for remote roles. 100% free for workers, always.",
        icon: "UserCheck",
      },
      {
        href: "/help/worker/onboarding",
        title: "Worker Onboarding",
        description: "What to expect after you get hired. Understand direct payments, setting expectations, and keeping 100% of your agreed salary.",
        icon: "ShieldCheck",
      },
      {
        href: "/help/worker/profile-optimization",
        title: "Profile Optimization",
        description: "Tips for standing out to employers with a complete, verified, and professional profile.",
        icon: "Sparkles",
      },
    ],
  },
  {
    id: "general",
    title: "General & Support",
    description: "Platform FAQs, trust & safety guidelines, legal terms, and support access.",
    articles: [
      {
        href: "/contact",
        title: "Contact Support",
        description: "Reach our team for billing, account, or platform questions.",
        icon: "LifeBuoy",
      },
      {
        href: "/terms-of-service",
        title: "Terms of Service",
        description: "Platform rules and acceptable use for all roles.",
        icon: "FileText",
      },
      {
        href: "/privacy-policy",
        title: "Privacy Policy",
        description: "How we collect, store, and protect your data.",
        icon: "Shield",
      },
    ],
  },
];

export const HELP_INDEX_FALLBACK: HelpIndexConfig = {
  title: "Help Center",
  description: "Comprehensive guides, FAQs, and support resources for employers and remote job seekers on Replaceme.",
  categories: HELP_INDEX_CATEGORIES,
  articles: HELP_INDEX_CATEGORIES.flatMap((cat) => cat.articles),
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
