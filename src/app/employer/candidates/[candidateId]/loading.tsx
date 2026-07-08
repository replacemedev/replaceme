import { EmployerPageShell } from "@/components/employer/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerCandidateLoading() {
  return (
    <EmployerPageShell width="content" className="gap-6 pb-24 lg:pb-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {/* Header Skeleton */}
          <div className="relative bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-slate-200" />
            <div className="space-y-3 flex-1 w-full flex flex-col items-center sm:items-start">
              <SkeletonBlock className="h-7 w-48 bg-slate-200 rounded-lg" />
              <SkeletonBlock className="h-4.5 w-36 bg-slate-200 rounded-lg" />
              <SkeletonBlock className="h-3.5 w-24 bg-slate-100 rounded-lg" />
            </div>
          </div>

          {/* Compensation & Availability Grid Skeleton */}
          <div className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-6">
            <SkeletonBlock className="h-4 w-44 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100/60">
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-28 bg-slate-100 rounded" />
                <SkeletonBlock className="h-5 w-40 bg-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-28 bg-slate-100 rounded" />
                <SkeletonBlock className="h-5 w-32 bg-slate-200 rounded-lg" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <SkeletonBlock className="h-3 w-20 bg-slate-100 rounded" />
                <SkeletonBlock className="h-4.5 w-48 bg-slate-200 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Skills & Experience Skeleton */}
          <div className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-4">
            <SkeletonBlock className="h-4 w-32 bg-slate-200 rounded-lg" />
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100/60">
              <SkeletonBlock className="h-7 w-20 bg-slate-100 rounded-full" />
              <SkeletonBlock className="h-7 w-24 bg-slate-100 rounded-full" />
              <SkeletonBlock className="h-7 w-16 bg-slate-100 rounded-full" />
              <SkeletonBlock className="h-7 w-28 bg-slate-100 rounded-full" />
              <SkeletonBlock className="h-7 w-22 bg-slate-100 rounded-full" />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <div className="h-4 w-4 bg-slate-200 rounded-full shrink-0" />
              <SkeletonBlock className="h-4.5 w-60 bg-slate-200 rounded-lg" />
            </div>
          </div>

          {/* Application Message Skeleton */}
          <div className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-4">
            <SkeletonBlock className="h-4 w-40 bg-slate-200 rounded-lg" />
            <div className="space-y-3 pt-4 border-t border-slate-100/60">
              <SkeletonBlock className="h-4 w-full bg-slate-100 rounded-md" />
              <SkeletonBlock className="h-4 w-[90%] bg-slate-100 rounded-md" />
              <SkeletonBlock className="h-4 w-[95%] bg-slate-100 rounded-md" />
            </div>
          </div>

          {/* Project Highlights Skeleton */}
          <div className="bg-white border border-slate-100/90 shadow-xs sm:rounded-2xl p-6 sm:p-8 space-y-4">
            <SkeletonBlock className="h-4 w-36 bg-slate-200 rounded-lg" />
            <div className="space-y-6 pt-2 border-t border-slate-100/60">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <SkeletonBlock className="h-4.5 w-48 bg-slate-200 rounded-lg" />
                  <SkeletonBlock className="h-4 w-12 bg-slate-100 rounded" />
                </div>
                <SkeletonBlock className="h-3.5 w-24 bg-slate-100 rounded" />
                <SkeletonBlock className="h-4 w-full bg-slate-150 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions Skeleton */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl p-5 sm:p-6 space-y-4">
          <SkeletonBlock className="h-4 w-16 bg-slate-200 rounded-lg" />
          <div className="flex flex-col gap-3">
            <SkeletonBlock className="h-[42px] w-full bg-slate-200 rounded-xl" />
            <SkeletonBlock className="h-[42px] w-full bg-slate-100 rounded-xl" />
          </div>
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <SkeletonBlock className="h-3.5 w-20 bg-slate-200 rounded-lg" />
            <SkeletonBlock className="h-11 w-full bg-slate-50 rounded-xl" />
          </div>
        </aside>
      </div>
    </EmployerPageShell>
  );
}
