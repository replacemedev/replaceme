import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { getPricingData } from "@/actions/employer/pricing";
import { FAQSchema } from "@/components/seo";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Hire Top Filipino Remote Talent | No Agency Fees",
  description:
    "Hire skilled Filipino remote professionals with zero agency fees or salary markups. Flat monthly subscriptions for companies, 100% free for job seekers.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Hire Top Filipino Remote Talent | No Agency Fees",
    description:
      "Direct-hire marketplace for remote Filipino talent. Flat monthly plans for employers and 100% free for workers.",
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
            question: "How does pricing work for employers?",
            answer:
              "We offer 4 simple subscription plans: Discovery (free), Starter, Growth, and Scale. Employers pay a flat monthly rate to post jobs and message talent with zero placement fees, commissions, or salary markups.",
          },
          {
            question: "Is Replaceme free for job seekers?",
            answer:
              "Yes! Replaceme is 100% free for job seekers. You can build your profile, apply for jobs, and connect with employers without ever paying a fee.",
          },
          {
            question: "Can anyone view worker profiles on Replaceme?",
            answer:
              "No. Worker profiles are private to protect candidate privacy. Only logged-in employers with an active subscription can view full profiles and resumes.",
          },
          {
            question: "How is Replaceme different from a recruitment agency?",
            answer:
              "Replaceme is a direct-hire marketplace. You connect and hire remote talent directly on your own terms with no middlemen and no percentage cut taken from worker pay.",
          },
          {
            question: "Can employers change or cancel plans anytime?",
            answer:
              "Yes. You can upgrade, downgrade, or cancel your subscription plan at any time directly from your employer dashboard.",
          },
        ];

  return (
    <>
      <FAQSchema items={schemaFaqs} />
      <LandingPageClient pricingPlans={plans} faqs={faqs} />
    </>
  );
}
