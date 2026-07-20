import type { FaqPageConfig, PageContentMeta } from "@/types/page-content";

export const EMPLOYER_FAQ_FALLBACK_META: PageContentMeta = {
  lastUpdated: "June 26, 2026",
  badge: "Employers",
  badgeVariant: "pill",
  description: "Answers for companies hiring through Replaceme.",
};

export const WORKER_FAQ_FALLBACK_META: PageContentMeta = {
  lastUpdated: "June 26, 2026",
  badge: "Jobseekers",
  badgeVariant: "pill",
  description: "Answers for professionals finding remote work on Replaceme.",
};

export const EMPLOYER_FAQ_FALLBACK: FaqPageConfig = {
  items: [
    {
      id: "employer-faq-1",
      question: "How does the pricing model work?",
      answer:
        "Employers pay a flat monthly subscription based on their hiring needs. We never charge placement fees or take a percentage of the worker's salary.",
    },
    {
      id: "employer-faq-2",
      question: "Are there any hidden fees or salary markups?",
      answer:
        "No. You pay 100% of the agreed salary directly to your worker. ReplaceMe takes 0% commission and adds zero markups.",
    },
    {
      id: "employer-faq-3",
      question: "Can I message candidates directly?",
      answer:
        "Direct messaging is available on our Starter, Growth, and Scale plans, allowing you to seamlessly communicate with applicants right from your Employer dashboard.",
    },
    {
      id: "employer-faq-4",
      question: "How quickly will my job post be approved?",
      answer:
        "Job posts are approved instantly on all paid plans (Starter, Growth, and Scale). For the free Discovery plan, approval takes up to 2 days.",
    },
    {
      id: "employer-faq-5",
      question: "Can I change or cancel my subscription tier?",
      answer:
        "Yes. Employers have full control over their billing. You can upgrade, downgrade, or cancel your plan at any time directly from your Employer dashboard.",
    },
  ],
};

export const WORKER_FAQ_FALLBACK: FaqPageConfig = {
  items: [
    {
      id: "worker-faq-1",
      question: "Is Replaceme free for workers?",
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
        "On the free Discovery plan, employers see an anonymous preview of your skills and experience. Full profiles, resumes, and messaging unlock when they upgrade to Starter or above.",
    },
  ],
};
