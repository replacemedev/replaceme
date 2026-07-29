/**
 * Static mock content for public informational pages.
 */

import type {
  ContactPageConfig,
  FaqPageConfig,
  HelpIndexConfig,
  PageContentMeta,
  PricingPageConfig,
} from "@/types/page-content";

export {
  PRIVACY_PAGE_META,
  COOKIE_PAGE_META,
  TERMS_PAGE_META,
  REFUND_PAGE_META,
  COOKIE_POLICY_VERSION,
} from "@/lib/data/legal";


/** Migrated from live CMS + product pricing copy. */
export const PRICING_PAGE: PricingPageConfig = {
  headline: "Simple, Transparent Pricing",
  description:
    "Discovery is free ($0). Starter $19/mo, Growth $39/mo, Scale $79/mo — workers always join for free.",
};

export const HELP_INDEX_CATEGORIES = [
  {
    id: "employers",
    title: "For Employers",
    description:
      "Guides on posting jobs, flat-rate pricing tiers, applicant pipelines, and direct candidate messaging.",
    articles: [
      {
        href: "/help/employer/hiring-guide",
        title: "Employer Hiring Guide",
        description:
          "How to write job posts, evaluate applicants, and hire remote talent directly on Replaceme.",
        icon: "Briefcase",
      },
      {
        href: "/help/employer/onboarding",
        title: "Employer Onboarding",
        description:
          "Learn how to set up your company profile, choose your flat-rate pricing tier, and manage your applicant pipeline.",
        icon: "Building2",
      },
      {
        href: "/help/employer/billing-subscriptions",
        title: "Billing & Subscriptions",
        description:
          "Manage your flat-rate pricing tier, payment methods, and invoice history.",
        icon: "CreditCard",
      },
    ],
  },
  {
    id: "workers",
    title: "For Workers",
    description:
      "Resources for job seekers to build profiles, land remote roles, and keep 100% of their earnings.",
    articles: [
      {
        href: "/help/worker/application-guide",
        title: "Job Seeker Application Guide",
        description:
          "Learn how to build a standout profile and apply for remote roles. 100% free for workers, always.",
        icon: "UserCheck",
      },
      {
        href: "/help/worker/onboarding",
        title: "Worker Onboarding",
        description:
          "What to expect after you get hired. Understand direct payments, setting expectations, and keeping 100% of your agreed salary.",
        icon: "ShieldCheck",
      },
      {
        href: "/help/worker/profile-optimization",
        title: "Profile Optimization",
        description:
          "Tips for standing out to employers with a complete, verified, and professional profile.",
        icon: "Sparkles",
      },
    ],
  },
  {
    id: "account",
    title: "Trust & Safety / Account",
    description:
      "Suspension, account closure, deletion timelines, and how to exercise privacy rights.",
    articles: [
      {
        href: "/help/account/suspension",
        title: "Account Suspension",
        description:
          "What suspension means, duration tiers, and how to appeal a restricted account.",
        icon: "Lock",
      },
      {
        href: "/help/account/close-delete",
        title: "Close or Delete Your Account",
        description:
          "Grace periods, anonymization, what to resolve first, and what we retain by law.",
        icon: "Trash2",
      },
      {
        href: "/help/account/privacy-rights",
        title: "Your Privacy Rights",
        description:
          "Access, erasure, portability, and how to contact support about your data.",
        icon: "Shield",
      },
    ],
  },
  {
    id: "general",
    title: "General & Support",
    description:
      "Platform FAQs, trust & safety guidelines, legal terms, and support access.",
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
] satisfies HelpIndexConfig["categories"];

export const HELP_INDEX: HelpIndexConfig = {
  title: "Help Center",
  description:
    "Comprehensive guides, FAQs, and support resources for employers and remote job seekers on Replaceme.",
  categories: HELP_INDEX_CATEGORIES,
  articles: HELP_INDEX_CATEGORIES.flatMap((cat) => cat.articles),
};

export const CONTACT_PAGE: ContactPageConfig = {
  badge: "Support",
  title: "Contact Us",
  description: "We're here to help with account, billing, or platform questions.",
  email: "support@replaceme.ph",
};

export const EMPLOYER_FAQ_META: PageContentMeta = {
  lastUpdated: "June 26, 2026",
  badge: "Employers",
  badgeVariant: "pill",
  description: "Answers for companies hiring through Replaceme.",
};

export const WORKER_FAQ_META: PageContentMeta = {
  lastUpdated: "June 26, 2026",
  badge: "Jobseekers",
  badgeVariant: "pill",
  description: "Answers for professionals finding remote work on Replaceme.",
};

/** Live employer FAQ items migrated from CMS (E2E fixtures excluded). */
export const EMPLOYER_FAQ: FaqPageConfig = {
  items: [
    {
      id: "employer-faq-1",
      question: "How do I post a job?",
      answer:
        "Create a free employer account, complete your company profile, then use Post a Job from your dashboard. Jobs go live after review.",
    },
    {
      id: "employer-faq-2",
      question: "How does applicant unlocking work?",
      answer:
        "Candidate contact details stay masked until you spend a credit to unlock a profile from the applicant pipeline.",
    },
    {
      id: "employer-faq-3",
      question: "Can I change plans later?",
      answer:
        "Yes. Upgrade or downgrade anytime from account settings. Prorated charges or credits apply automatically.",
    },
    {
      id: "employer-faq-4",
      question: "How does the pricing model work?",
      answer:
        "Employers pay a flat subscription (Discovery, Starter, Growth, or Scale) based on hiring needs. We never charge placement fees or take a percentage of the worker's salary.",
    },
    {
      id: "employer-faq-5",
      question: "Are there any hidden fees or salary markups?",
      answer: "No. You pay 100% of the agreed salary directly to your worker.",
    },
  ],
};

export const WORKER_FAQ: FaqPageConfig = {
  items: [
    {
      id: "worker-faq-1",
      question: "Is Replaceme free for job seekers?",
      answer:
        "Yes! Joining the platform, building your profile, and applying to jobs is always 100% free for workers.",
    },
    {
      id: "worker-faq-2",
      question: "Does Replaceme take a cut or commission from my salary?",
      answer:
        "Absolutely not. You keep 100% of your agreed salary. We take 0% commission and add zero markups to your pay.",
    },
    {
      id: "worker-faq-3",
      question: "How do I get paid?",
      answer:
        "You are paid directly by your employer. Replaceme does not process payroll; you and your employer will agree on the payment method and schedule.",
    },
    {
      id: "worker-faq-4",
      question: "Can employers see my contact information?",
      answer:
        "It depends on the employer's plan. Some employers view anonymous profiles first, while others on premium plans can see full names, contact details, and resumes immediately.",
    },
    {
      id: "worker-faq-5",
      question: "How do I apply for jobs?",
      answer:
        "Simply create a complete profile, browse the active job listings on your dashboard, and click apply.",
    },
  ],
};

export const UPDATE_PASSWORD_PAGE = {
  headline: "Set a new password",
  description: "Choose a strong password for your account.",
} as const;
