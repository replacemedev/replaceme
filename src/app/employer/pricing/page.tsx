import { getPricingData } from "@/actions/employer/pricing";
import { getAccountSettings } from "@/actions/employer/billing";
import { EmployerPricingClient } from "@/components/employer/pricing/EmployerPricingClient";
import { normalizePlanSlug } from "@/lib/entitlements/ui-copy";
import {
  EmployerPageShell,
  EmployerBreadcrumb,
  EmployerPageHeader,
} from "@/components/employer/layout";

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
    <EmployerPageShell width="wide" className="gap-10">
      <EmployerBreadcrumb
        items={[
          { label: "Dashboard", href: "/employer/dashboard" },
          { label: "Pricing" },
        ]}
      />
      <EmployerPageHeader
        title="Scale your remote team"
        subhead="Simple, transparent pricing — Discovery is free, then upgrade when you need full profiles, messaging, and instant approval."
        bordered={false}
      />
      <EmployerPricingClient
        plans={plans}
        testimonials={testimonials}
        faqs={faqs}
        currentPlanSlug={currentPlanSlug}
      />
    </EmployerPageShell>
  );
}
