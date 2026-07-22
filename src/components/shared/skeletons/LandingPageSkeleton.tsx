import { PUBLIC_HEADER_OFFSET } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "./primitives";
import { CitationBlockGridSkeleton } from "@/components/seo";

export function LandingPageSkeleton() {
  return (
    <div className={`min-h-screen bg-[#f8fafe] animate-pulse ${PUBLIC_HEADER_OFFSET}`}>
      {/* Hero Section Skeleton */}
      <section className="relative min-h-[calc(100svh-4rem)] flex items-center justify-center py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden bg-gradient-to-br from-white via-[#f8fafc] to-[#f1f5f9]">
        {/* Decorative Glowing Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[min(500px,80vw)] h-[min(500px,80vw)] rounded-full bg-emerald-100/40 blur-3xl pointer-events-none z-0" />
        <div className="absolute top-[40%] right-[-10%] w-[min(600px,85vw)] h-[min(600px,85vw)] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[30%] w-[min(400px,75vw)] h-[min(400px,75vw)] rounded-full bg-teal-100/25 blur-3xl pointer-events-none z-0" />

        {/* Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-dots [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] opacity-70 pointer-events-none z-0" />

        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 w-full min-w-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 w-full min-w-0">
            {/* Left text column */}
            <div className="w-full min-w-0 lg:w-[58%] lg:max-w-[58%] max-w-3xl lg:max-w-4xl space-y-6 sm:space-y-8 pr-0 lg:pr-8">
              {/* Title lines (synchronized with 3-line hero layout) */}
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3 lg:space-y-3.5">
                <SkeletonBlock className="h-9 min-[375px]:h-11 sm:h-14 md:h-16 lg:h-20 xl:h-22 2xl:h-24 w-[82%]" />
                <SkeletonBlock className="h-9 min-[375px]:h-11 sm:h-14 md:h-16 lg:h-20 xl:h-22 2xl:h-24 w-[58%]" />
                <SkeletonBlock className="h-9 min-[375px]:h-11 sm:h-14 md:h-16 lg:h-20 xl:h-22 2xl:h-24 w-[68%]" />
              </div>
              {/* Paragraph lines */}
              <div className="space-y-3 mt-6 lg:mt-8">
                <SkeletonBlock className="h-4 sm:h-5 w-full max-w-2xl" />
                <SkeletonBlock className="h-4 sm:h-5 w-11/12 max-w-xl" />
                <SkeletonBlock className="h-4 sm:h-5 w-4/5 max-w-lg" />
              </div>
              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-5 pt-4">
                <SkeletonBlock className="h-12 sm:h-14 w-full sm:w-[210px] rounded-xl" />
                <SkeletonBlock className="h-12 sm:h-14 w-full sm:w-[160px] rounded-xl" />
              </div>
            </div>

            {/* Right image column */}
            <div className="w-full lg:w-[42%] relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <SkeletonBlock className="w-full h-full rounded-[32px] border-[8px] border-white shadow-xl bg-white" />
                {/* Floating Card 1 Skeleton */}
                <div className="absolute -left-12 top-20 bg-white rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 border border-slate-50 w-[180px] h-[74px]">
                  <SkeletonBlock className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <SkeletonBlock className="h-3.5 w-16" />
                    <SkeletonBlock className="h-2.5 w-20" />
                  </div>
                </div>
                {/* Floating Card 2 Skeleton */}
                <div className="absolute -right-8 bottom-24 bg-white rounded-2xl p-4 shadow-xl z-20 flex items-center gap-4 border border-slate-50 w-[180px] h-[74px]">
                  <SkeletonBlock className="w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <SkeletonBlock className="h-3.5 w-16" />
                    <SkeletonBlock className="h-2.5 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content below Hero - Value Proposition Cards Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <CitationBlockGridSkeleton />
      </div>
      <SkeletonBlock className="h-64 w-full mt-8" />
    </div>
  );
}

