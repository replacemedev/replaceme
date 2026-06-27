import { getPricingData } from "@/actions/employer/pricing";
import { getAccountSettings } from "@/actions/employer/billing";
import { EmployerPricingClient } from "@/components/employer/pricing/EmployerPricingClient";
import { normalizePlanSlug } from "@/lib/entitlements/ui-copy";

export const runtime = "edge";

export const metadata = {
  title: "Pricing - Scale Your Remote Team | ReplaceMe",
  description:
    "Simple, transparent pricing. Discovery is free — upgrade to Starter, Growth, or Scale when you're ready to hire.",
};

export default async function PricingPage() {
  const [{ plans, testimonials, faqs }, accountSettings] = await Promise.all([
    getPricingData(),
    getAccountSettings(),
  ]);

  const currentPlanSlug = normalizePlanSlug(accountSettings?.plan ?? "discovery");

  return (
    <EmployerPricingClient
      plans={plans}
      testimonials={testimonials}
      faqs={faqs}
      currentPlanSlug={currentPlanSlug}
    />
  );
}
