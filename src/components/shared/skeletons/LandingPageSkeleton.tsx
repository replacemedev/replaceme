import { PUBLIC_HEADER_OFFSET } from "@/lib/layout/public-shell";
import { SkeletonBlock } from "./primitives";

export function LandingPageSkeleton() {
  return (
    <div className={`min-h-screen bg-[#f8fafe] animate-pulse ${PUBLIC_HEADER_OFFSET}`}>
      <div className="max-w-7xl mx-auto px-6 py-20 space-y-6">
        <SkeletonBlock className="h-14 w-full max-w-2xl mx-auto" />
        <SkeletonBlock className="h-6 w-full max-w-xl mx-auto" />
        <SkeletonBlock className="h-12 w-48 mx-auto rounded-xl mt-8" />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
      <SkeletonBlock className="h-64 w-full mt-8" />
    </div>
  );
}
