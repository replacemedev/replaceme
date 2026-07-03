import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerPricingLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-10 animate-pulse">
      <EmployerPageHeader
        title="Scale your remote team"
        subhead="Simple, transparent pricing — Discovery is free, then upgrade when you need full profiles, messaging, and instant approval."
        bordered={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col justify-between p-6 rounded-3xl bg-white border border-slate-100 shadow-sm min-h-[380px]">
            <div className="space-y-4">
              <SkeletonBlock className="h-6 w-24 rounded bg-slate-200" />
              <SkeletonBlock className="h-8 w-36 rounded-lg bg-slate-200" />
              <SkeletonBlock className="h-4 w-full rounded bg-slate-200" />
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-slate-200 rounded-full shrink-0" />
                    <SkeletonBlock className="h-4 w-32 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
            <SkeletonBlock className="h-10 w-full rounded-xl mt-6 bg-slate-200" />
          </div>
        ))}
      </div>
    </EmployerPageShell>
  );
}
