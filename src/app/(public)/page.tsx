import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { getPricingData } from "@/actions/employer/pricing";
import { FAQSchema } from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Hire Top Filipino Remote Talent — No Agency Fees",
  description:
    "Replace Me connects global employers with top-tier Filipino remote professionals. Flat subscription, zero commissions, zero middlemen. Free for job seekers.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Hire Top Filipino Remote Talent — No Agency Fees",
    description:
      "Replace Me is a direct-hire marketplace for Filipino remote talent. Flat subscription rates for employers, completely free for workers.",
    url: BASE_URL,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { plans, faqs } = await getPricingData();

  // Fallback FAQ data for schema injection (server-side, AI-readable)
  const schemaFaqs =
    faqs.length > 0
      ? faqs
      : [
          {
            question: "How does the pricing work for employers?",
            answer:
              "Replace Me offers 4 transparent subscription tiers: Discovery (free), Starter, Growth, and Scale. Employers pay a flat monthly rate for platform access — no placement fees, no commissions, and no percentage of worker salaries.",
          },
          {
            question: "Is the platform free for workers?",
            answer:
              "Yes. Replace Me is 100% free for job seekers. Workers can create a profile, apply to jobs, and connect with employers without ever paying a fee.",
          },
          {
            question: "Can anyone see worker profiles on Replace Me?",
            answer:
              "No. Worker profiles are strictly private and only visible to authenticated employers with an active, verified subscription tier. Public visitors cannot browse individual worker profiles.",
          },
          {
            question: "How is Replace Me different from a recruitment agency?",
            answer:
              "Replace Me is a direct-hire marketplace, not an agency. Employers connect and hire workers directly, eliminating middlemen. The platform never takes a cut of worker salaries or charges placement fees.",
          },
          {
            question: "Can employers change or cancel their subscription?",
            answer:
              "Yes. Employers have full control over their subscription and can upgrade, downgrade, or cancel their plan at any time from the billing dashboard.",
          },
        ];

  return (
    <>
      <FAQSchema items={schemaFaqs} />
      <LandingPageClient pricingPlans={plans} faqs={faqs} />
    </>
  );
}
