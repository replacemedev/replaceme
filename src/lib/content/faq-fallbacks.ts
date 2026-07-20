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
        "Employers pay a flat subscription (Discovery, Starter, Growth, or Scale) based on hiring needs. We never charge placement fees or take a percentage of the worker's salary.",
    },
    {
      id: "employer-faq-2",
      question: "Are there any hidden fees or salary markups?",
      answer:
        "No. You pay 100% of the agreed salary directly to your worker.",
    },
    {
      id: "employer-faq-3",
      question: "Can I message candidates directly?",
      answer:
        "Direct messaging is available on our Starter, Growth, and Scale plans right from your Employer dashboard.",
    },
    {
      id: "employer-faq-4",
      question: "How quickly will my job post be approved?",
      answer:
        "Job posts are approved instantly on all paid plans. For the free Discovery plan, approval takes up to 2 days.",
    },
    {
      id: "employer-faq-5",
      question: "Can I change or cancel my subscription tier?",
      answer:
        "Yes. You can upgrade, downgrade, or cancel your plan at any time directly from your Employer dashboard.",
    },
  ],
};

export const WORKER_FAQ_FALLBACK: FaqPageConfig = {
  items: [
    {
      id: "worker-faq-1",
      question: "Is ReplaceMe free for job seekers?",
      answer:
        "Yes! Joining the platform, building your profile, and applying to jobs is always 100% free for workers.",
    },
    {
      id: "worker-faq-2",
      question: "Does ReplaceMe take a cut or commission from my salary?",
      answer:
        "Absolutely not. You keep 100% of your agreed salary. We take 0% commission and add zero markups to your pay.",
    },
    {
      id: "worker-faq-3",
      question: "How do I get paid?",
      answer:
        "You are paid directly by your employer. ReplaceMe does not process payroll; you and your employer will agree on the payment method and schedule.",
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
