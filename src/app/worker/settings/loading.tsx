import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerSettingsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-8 w-48 sm:h-9 sm:w-56 rounded-xl" />}
        subhead={
          <SkeletonBlock className="h-4 w-full max-w-md rounded mt-2" />
        }
      />

      {/* Email verification banner */}
      <div className="mb-6">
        <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-start gap-3">
              <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-36 sm:h-5 sm:w-40 rounded" />
                <SkeletonBlock className="h-4 w-full max-w-lg rounded" />
                <SkeletonBlock className="h-4 w-3/4 max-w-md rounded" />
              </div>
            </div>
            <SkeletonBlock className="h-11 w-full shrink-0 rounded-xl sm:w-32 sm:self-center" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings nav cards */}
        <nav
          aria-hidden
          className="lg:col-span-2 flex flex-col gap-4 md:flex-row md:gap-6"
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-1 items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-5"
            >
              <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <SkeletonBlock className="h-4 w-40 max-w-[70%] rounded" />
                  <SkeletonBlock className="h-4 w-4 shrink-0 rounded" />
                </div>
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-4 w-4/5 max-w-xs rounded" />
              </div>
            </div>
          ))}
        </nav>

        {/* Availability & Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <SkeletonBlock className="h-4 w-36 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-4 w-28 rounded" />
              <SkeletonBlock className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-4 w-4 rounded" />
            <SkeletonBlock className="h-4 w-36 rounded" />
          </div>
          <SkeletonBlock className="h-10 w-full sm:w-32 rounded-xl" />
        </div>

        {/* Report Employer */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <SkeletonBlock className="h-4 w-32 rounded" />
          <SkeletonBlock className="h-3 w-full max-w-xs rounded" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-16 rounded" />
            <SkeletonBlock className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-16 rounded" />
            <SkeletonBlock className="h-28 w-full rounded-lg" />
          </div>
          <SkeletonBlock className="h-10 w-full sm:w-32 rounded-xl" />
        </div>
      </div>
    </WorkerPageShell>
  );
}
