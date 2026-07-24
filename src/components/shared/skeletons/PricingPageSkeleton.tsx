import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "./primitives";

/** Feature row counts mirror Discovery / Starter / Growth / Scale cards. */
const CARD_FEATURE_COUNTS = [6, 7, 7, 8] as const;

/**
 * Mirrors `PricingCards` grid + card chrome exactly
 * (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
 */
export function PricingCardsSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
        {CARD_FEATURE_COUNTS.map((featureCount, i) => {
          const isGrowth = i === 2;
          const hasBadge = i === 0 || isGrowth;

          return (
            <div
              key={i}
              className={`relative flex flex-col justify-between p-6 md:p-8 rounded-3xl ${
                isGrowth
                  ? "border-2 border-[#006e2f]/30 bg-gradient-to-b from-[#fafdfb] to-white shadow-lg lg:scale-105 z-10"
                  : "border border-gray-100 bg-white shadow-sm"
              }`}
            >
              {hasBadge ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <SkeletonBlock className="h-6 w-24 rounded-full" />
                </div>
              ) : null}

              <div className="flex-1 flex flex-col">
                <SkeletonBlock className="h-7 w-1/2 max-w-[8rem] rounded-md" />

                <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
                  <SkeletonBlock className="h-10 w-3/4 max-w-[9rem] rounded-lg" />
                  <SkeletonBlock className="h-4 w-14 rounded" />
                </div>

                <div className="mt-4 min-h-[50px] flex flex-col justify-start gap-1.5">
                  <SkeletonBlock className="h-3 w-20 rounded" />
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-5/6 rounded" />
                </div>

                <div className="border-t border-gray-100 my-5" />

                <ul className="space-y-3 flex-1">
                  {Array.from({ length: featureCount }).map((_, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <SkeletonBlock className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                      <SkeletonBlock
                        className={`h-3.5 rounded mt-1 ${
                          idx % 3 === 0 ? "w-full" : idx % 3 === 1 ? "w-5/6" : "w-4/5"
                        }`}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <SkeletonBlock className="h-[46px] w-full rounded-xl" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="pt-4 flex justify-center">
        <SkeletonBlock className="h-3 w-full max-w-xl rounded-md" />
      </p>
    </div>
  );
}

/** Mirrors `CompareTable` section spacing and table chrome. */
export function PricingCompareSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <SkeletonBlock className="h-8 w-48 max-w-full mx-auto mb-3 rounded-md" />
      <SkeletonBlock className="h-4 w-full max-w-xl mx-auto mb-10 rounded" />

      <div className="overflow-x-auto pb-4">
        <div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-900/5 bg-white min-w-[640px]">
          <div className="grid grid-cols-5 border-b border-gray-100">
            <div className="p-4">
              <SkeletonBlock className="h-4 w-16 rounded" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex justify-center">
                <SkeletonBlock className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5">
                <div className="p-4">
                  <SkeletonBlock className="h-4 w-28 max-w-full rounded" />
                </div>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="p-4 flex justify-center">
                    <SkeletonBlock className="h-4 w-10 rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors `FAQ` section spacing and stacked cards. */
export function PricingFaqSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <SkeletonBlock className="h-8 md:h-9 w-48 max-w-full mx-auto mb-12 rounded-md" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-100 rounded-3xl bg-white p-6 md:p-8 shadow-sm space-y-2"
          >
            <SkeletonBlock className="h-5 w-2/3 max-w-md rounded" />
            <SkeletonBlock className="h-4 w-full rounded" />
            <SkeletonBlock className="h-4 w-11/12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full public `/pricing` page skeleton — header + cards + compare + FAQ. */
export function PricingPageSkeleton() {
  return (
    <div className={`bg-[#f8fafe] min-h-screen ${PUBLIC_PAGE_TOP} animate-pulse`}>
      <header className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <SkeletonBlock className="h-9 sm:h-11 lg:h-14 w-full max-w-xl mx-auto rounded-lg" />
        <SkeletonBlock className="h-5 sm:h-6 w-full max-w-lg mx-auto mt-3 sm:mt-4 rounded" />
      </header>

      <PricingCardsSkeleton />
      <PricingCompareSkeleton />
      <PricingFaqSkeleton />
    </div>
  );
}
