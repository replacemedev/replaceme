import { PublicFaqPage } from "@/components/shared/faq/PublicFaqPage";
import {
  EMPLOYER_FAQ_FALLBACK,
  EMPLOYER_FAQ_FALLBACK_META,
} from "@/lib/content/faq-fallbacks";
import { FAQSchema } from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer FAQs \u2014 Hiring, Pricing & Platform Questions Answered",
  description:
    "Answers to the most common questions from employers using Replaceme. Learn about subscription plans, applicant access, how to post jobs, messaging, and direct hiring of Filipino remote talent.",
  keywords: [
    "Replaceme employer FAQ",
    "how to hire Filipino remote workers",
    "employer subscription questions",
    "Replaceme pricing FAQ",
  ],
  alternates: {
    canonical: `${BASE_URL}/faq/employer`,
  },
  openGraph: {
    title: "Employer FAQs \u2014 Replaceme",
    description:
      "Common questions about hiring Filipino remote professionals on Replaceme. Flat pricing, direct hire, zero agency fees.",
    url: `${BASE_URL}/faq/employer`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function EmployerFaqPage() {
  return (
    <>
      <FAQSchema items={EMPLOYER_FAQ_FALLBACK.items.map(({ question, answer }) => ({ question, answer }))} />
      <PublicFaqPage
        slug="employer-faq"
        defaultTitle="Employer FAQs"
        fallback={EMPLOYER_FAQ_FALLBACK}
        fallbackMeta={EMPLOYER_FAQ_FALLBACK_META}
      />
    </>
  );
}

