import { LandingPageClient } from "@/components/landing/LandingPageClient";
import { getPricingData } from "@/actions/employer/pricing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { plans, faqs } = await getPricingData();

  return <LandingPageClient pricingPlans={plans} faqs={faqs} />;
}
