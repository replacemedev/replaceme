import { PublicFaqPage } from "@/components/shared/faq/PublicFaqPage";
import {
  WORKER_FAQ_FALLBACK,
  WORKER_FAQ_FALLBACK_META,
} from "@/lib/content/faq-fallbacks";
import { FAQSchema } from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Job Seeker FAQs \u2014 Applying, Profiles & Getting Hired on Replaceme",
  description:
    "Common questions from Filipino job seekers using Replaceme. Learn how to create a profile, apply to remote jobs, communicate with employers, and get paid directly with no platform fees.",
  keywords: [
    "Replaceme job seeker FAQ",
    "how to get hired remotely Philippines",
    "Filipino remote worker FAQ",
    "work from home application process Philippines",
  ],
  alternates: {
    canonical: `${BASE_URL}/faq/worker`,
  },
  openGraph: {
    title: "Job Seeker FAQs \u2014 Replaceme",
    description:
      "Everything Filipino professionals need to know about finding and landing remote work on Replaceme. Free to join, zero platform fees on earnings.",
    url: `${BASE_URL}/faq/worker`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default function WorkerFaqPage() {
  return (
    <>
      <FAQSchema items={WORKER_FAQ_FALLBACK.items.map(({ question, answer }) => ({ question, answer }))} />
      <PublicFaqPage
        slug="worker-faq"
        defaultTitle="Worker FAQs"
        fallback={WORKER_FAQ_FALLBACK}
        fallbackMeta={WORKER_FAQ_FALLBACK_META}
      />
    </>
  );
}

