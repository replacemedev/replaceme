import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import {
  PricingCompareSkeleton,
  PricingFaqSkeleton,
} from "@/components/shared/skeletons/PricingPageSkeleton";

/** Feature row counts mirror Discovery / Starter / Growth / Scale cards. */
const CARD_FEATURE_COUNTS = [7, 7, 7, 8] as const;

export default function EmployerPricingLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-10">
      <EmployerPageHeader
        title="Scale your remote team"
        subhead="Simple, transparent pricing. Discovery is free, then upgrade when you need full profiles, messaging, and instant approval."
        bordered={false}
      />

      <div className="space-y-10">
        {/* Active Plan Status Card Skeleton */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="w-full border border-slate-200/80 rounded-2xl p-5 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
            <div className="space-y-2 w-full min-w-0">
              <div className="h-5 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-3/4 max-w-md bg-slate-200 rounded-md" />
            </div>
            <div className="h-9 w-36 bg-slate-200 rounded-xl shrink-0" />
          </div>
        </div>

        {/* Billing Interval Toggle Skeleton */}
        <div className="flex flex-col items-center gap-2 mb-2 animate-pulse">
          <div className="inline-flex h-11 w-full max-w-xs items-center justify-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-xs sm:w-64">
            <div className="h-9 w-1/2 bg-slate-200 rounded-full" />
            <div className="h-9 w-1/2 bg-slate-100 rounded-full" />
          </div>
          <div className="h-3 w-64 bg-slate-200 rounded-sm" />
        </div>

        {/* Pricing Cards 4-Column Grid Skeleton */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
            {CARD_FEATURE_COUNTS.map((featureCount, i) => {
              const isGrowth = i === 2;
              const isDiscovery = i === 0;
              const hasBadge = isDiscovery || isGrowth;

              return (
                <div
                  key={i}
                  className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl transition-all duration-300 animate-pulse ${
                    isGrowth
                      ? "border-2 border-[#006e2f]/30 bg-gradient-to-b from-[#fafdfb] to-white shadow-lg lg:scale-105 z-10"
                      : "border border-gray-100 bg-white shadow-sm"
                  }`}
                >
                  {/* Pinned Top Badge Skeleton */}
                  {hasBadge ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <div className="h-6 w-24 bg-slate-200 rounded-full" />
                    </div>
                  ) : null}

                  <div className="flex-1 flex flex-col">
                    {/* Plan Title Skeleton */}
                    <div className="h-7 w-28 bg-slate-200 rounded-md" />

                    {/* Price Block Skeleton */}
                    <div className="mt-3 flex items-baseline flex-wrap gap-x-1 gap-y-1">
                      <div className="h-10 w-28 bg-slate-200 rounded-lg" />
                      <div className="h-4 w-12 bg-slate-200 rounded" />
                    </div>
                    <div className="mt-1.5 h-3.5 w-36 bg-slate-200 rounded" />

                    {/* Description Block Skeleton */}
                    <div className="mt-4 min-h-[50px] flex flex-col justify-start gap-1.5">
                      <div className="h-3 w-20 bg-slate-200 rounded" />
                      <div className="h-4 w-full bg-slate-200 rounded" />
                      <div className="h-4 w-4/5 bg-slate-200 rounded" />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-5" />

                    {/* Features List Skeleton */}
                    <ul className="space-y-3 flex-1">
                      {Array.from({ length: featureCount }).map((_, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="mt-[2px] size-4 shrink-0 rounded-full bg-slate-200" />
                          <div
                            className={`h-3.5 rounded mt-0.5 bg-slate-200 ${
                              idx % 3 === 0 ? "w-full" : idx % 3 === 1 ? "w-5/6" : "w-3/4"
                            }`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button Skeleton */}
                  <div className="mt-8 space-y-2">
                    <div className="h-12 w-full bg-slate-200 rounded-xl" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-center animate-pulse">
            <div className="h-3 w-full max-w-xl bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Compare Table & FAQ Skeletons */}
        <div className="animate-pulse">
          <PricingCompareSkeleton />
          <PricingFaqSkeleton />
        </div>
      </div>
    </EmployerPageShell>
  );
}
