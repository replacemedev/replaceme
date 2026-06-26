import type { FaqPageConfig, PageContentMeta } from "@/types/page-content";

export const EMPLOYER_FAQ_FALLBACK_META: PageContentMeta = {
  lastUpdated: "June 26, 2026",
  badge: "Employers",
  badgeVariant: "pill",
  description: "Answers for companies hiring through ReplaceMe.",
};

export const WORKER_FAQ_FALLBACK_META: PageContentMeta = {
  lastUpdated: "June 26, 2026",
  badge: "Jobseekers",
  badgeVariant: "pill",
  description: "Answers for professionals finding remote work on ReplaceMe.",
};

export const EMPLOYER_FAQ_FALLBACK: FaqPageConfig = {
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
  ],
};

export const WORKER_FAQ_FALLBACK: FaqPageConfig = {
  items: [
    {
      id: "worker-faq-1",
      question: "Is ReplaceMe free for workers?",
      answer:
        "Yes. Creating a profile, browsing jobs, and applying are free for jobseekers.",
    },
    {
      id: "worker-faq-2",
      question: "How do I apply to a job?",
      answer:
        "Open a job listing, review the details, and submit your application from the apply flow in your worker dashboard.",
    },
    {
      id: "worker-faq-3",
      question: "When will employers see my full profile?",
      answer:
        "Employers see your public profile fields immediately. Contact details may unlock after they review your application.",
    },
  ],
};
