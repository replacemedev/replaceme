import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import {
  PricingCardsSkeleton,
  PricingCompareSkeleton,
  PricingFaqSkeleton,
} from "@/components/shared/skeletons/PricingPageSkeleton";

export default function EmployerPricingLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-10">
      <EmployerPageHeader
        title="Scale your remote team"
        subhead="Simple, transparent pricing — Discovery is free, then upgrade when you need full profiles, messaging, and instant approval."
        bordered={false}
      />

      <div className="space-y-10 animate-pulse">
        <PricingCardsSkeleton />
        <PricingCompareSkeleton />
        <PricingFaqSkeleton />
      </div>
    </EmployerPageShell>
  );
}
