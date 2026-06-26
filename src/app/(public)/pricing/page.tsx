import Link from "next/link";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { getPricingData } from "@/actions/employer/pricing";
import { PublicPricingClient } from "@/components/public/PublicPricingClient";
import { HELP_INDEX_FALLBACK, PRICING_FALLBACK } from "@/lib/content/page-fallbacks";
import type { PricingPageConfig } from "@/types/page-content";

export const metadata = {
  title: "Pricing | ReplaceMe",
  description: "Compare employer plans and start hiring remote talent.",
};

export const dynamic = "force-dynamic";

export default async function PublicPricingPage() {
  const [cms, pricing] = await Promise.all([
    getPublishedPageContent("pricing"),
    getPricingData(),
  ]);

  const config = {
    ...PRICING_FALLBACK,
    ...(cms?.contentJson as Partial<PricingPageConfig>),
  };

  return (
    <div className="bg-[#f8fafe] min-h-screen py-16 pt-28">
      <header className="text-center max-w-3xl mx-auto px-4 mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {config.headline}
        </h1>
        <p className="text-slate-500 font-medium text-lg mt-4">{config.description}</p>
      </header>
      <PublicPricingClient
        plans={pricing.plans}
        testimonials={pricing.testimonials}
        faqs={pricing.faqs}
      />
    </div>
  );
}
