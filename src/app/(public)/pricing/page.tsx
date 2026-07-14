import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { getPricingData } from "@/actions/employer/pricing";
import { PublicPricingClient } from "@/components/public/PublicPricingClient";
import { PRICING_FALLBACK } from "@/lib/content/page-fallbacks";
import type { PricingPageConfig } from "@/types/page-content";
import { FAQSchema, FactBox } from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Pricing Plans — Hire Filipino Remote Talent at a Flat Rate",
  description:
    "Compare Replaceme's employer subscription plans. Start free with Discovery, then unlock full applicant profiles, messaging, and instant job approval. No placement fees, no salary commissions.",
  keywords: [
    "Filipino remote hiring pricing",
    "hire remote workers subscription",
    "no commission hiring platform",
    "remote team building cost",
  ],
  alternates: {
    canonical: `${BASE_URL}/pricing`,
  },
  openGraph: {
    title: "Pricing Plans — Replaceme",
    description:
      "Flat subscription pricing for employers. No agency fees. No salary commissions. Workers always join free.",
    url: `${BASE_URL}/pricing`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const PRICING_FACTS = [
  { label: "Worker fee", value: "Free — $0 forever", highlight: true },
  { label: "Employer pricing model", value: "Flat monthly subscription (4 tiers)" },
  { label: "Placement commission", value: "0% — none charged", highlight: true },
  { label: "Salary markup", value: "0% — workers receive 100% of agreed pay", highlight: true },
  { label: "Contract management", value: "Included in paid plans" },
  { label: "Applicant messaging", value: "Included from Growth plan onwards" },
];

const PRICING_FAQ_FALLBACK = [
  {
    question: "How much does it cost to hire Filipino remote workers on Replaceme?",
    answer:
      "Replaceme charges employers a flat monthly subscription fee with no placement commissions or salary percentages. Plans start with a free Discovery tier, with paid Starter, Growth, and Scale tiers unlocking additional features like full profiles, messaging, and instant job approval.",
  },
  {
    question: "Do workers pay any fees to use Replaceme?",
    answer:
      "No. Replaceme is completely free for job seekers. Workers can create a profile, browse job listings, and apply to positions at zero cost.",
  },
  {
    question: "Does Replaceme take a percentage of worker salaries?",
    answer:
      "No. Replaceme never takes a cut of worker earnings. Employers pay workers 100% of the agreed salary directly. The platform fee is a separate flat subscription paid by the employer.",
  },
  {
    question: "Can I cancel my Replaceme subscription at any time?",
    answer:
      "Yes. Employers can upgrade, downgrade, or cancel their subscription at any time from the employer billing dashboard with no lock-in period.",
  },
];

export default async function PublicPricingPage() {
  const [cms, pricing] = await Promise.all([
    getPublishedPageContent("pricing"),
    getPricingData(),
  ]);

  const config = {
    ...PRICING_FALLBACK,
    ...(cms?.contentJson as Partial<PricingPageConfig>),
  };

  const schemaFaqs = pricing.faqs.length > 0 ? pricing.faqs : PRICING_FAQ_FALLBACK;

  return (
    <>
      <FAQSchema items={schemaFaqs} />
      <div className={`bg-[#f8fafe] min-h-screen ${PUBLIC_PAGE_TOP} pb-16`}>
        <header className="text-center max-w-3xl mx-auto px-4 mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {config.headline}
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-4">{config.description}</p>
        </header>

        {/* GEO: Data-dense FactBox for LLM citation of pricing structure */}
        <div className="max-w-2xl mx-auto px-4 mb-12">
          <FactBox
            title="Replaceme Pricing Facts"
            items={PRICING_FACTS}
            variant="table"
          />
        </div>

        <PublicPricingClient
          plans={pricing.plans}
          testimonials={pricing.testimonials}
          faqs={pricing.faqs}
        />
      </div>
    </>
  );
}
