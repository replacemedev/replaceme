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
              </div>
            </div>
            <SkeletonBlock className="h-11 w-full shrink-0 rounded-xl sm:w-32 sm:self-center" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Worker Account Identity Card Skeleton */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-4 border-b border-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-3.5">
              <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-5 w-36 rounded" />
                <SkeletonBlock className="h-4 w-full max-w-md rounded" />
              </div>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <SkeletonBlock className="h-3 w-28 rounded mb-3" />
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <SkeletonBlock className="h-9 w-9 shrink-0 rounded-lg" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <SkeletonBlock className="h-2.5 w-12 rounded" />
                  <SkeletonBlock className="h-4 w-48 rounded" />
                </div>
              </div>
              <SkeletonBlock className="h-5 w-16 rounded-full shrink-0" />
            </div>
          </div>
          <div className="border-t border-slate-50 bg-slate-50/40 px-5 py-4 sm:px-6">
            <SkeletonBlock className="h-5 w-72 rounded" />
          </div>
        </div>

        {/* Settings Nav Cards */}
        <div className="flex flex-col gap-4 md:flex-row md:gap-5">
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
              </div>
            </div>
          ))}
        </div>

        {/* Grid 2-cols: Form & Support */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 items-start">
          {/* Availability & Rate Form Skeleton */}
          <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6">
            <div>
              <SkeletonBlock className="h-4 w-36 rounded" />
              <SkeletonBlock className="h-3.5 w-64 rounded mt-1.5" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24 rounded" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-36 rounded" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-4 w-24 rounded" />
              <SkeletonBlock className="h-11 w-full rounded-xl" />
            </div>
            <div className="flex items-center gap-3 py-1">
              <SkeletonBlock className="h-5 w-5 rounded shrink-0" />
              <SkeletonBlock className="h-4 w-36 rounded" />
            </div>
            <SkeletonBlock className="h-11 w-full sm:w-36 rounded-xl" />
          </div>

          {/* Safety or billing concern? (ContactSupportCard) Skeleton */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6 h-fit space-y-4">
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-44 rounded" />
                <SkeletonBlock className="h-3.5 w-full rounded" />
                <SkeletonBlock className="h-3.5 w-4/5 rounded" />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
              <SkeletonBlock className="h-11 w-36 rounded-xl shrink-0" />
              <SkeletonBlock className="h-11 w-20 rounded-xl shrink-0" />
              <SkeletonBlock className="h-11 w-24 rounded-xl shrink-0" />
            </div>
          </div>
        </div>

        {/* Delete your account (DataDeletionRequestCard) Skeleton */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6 h-fit space-y-4">
          <div className="flex items-start gap-3">
            <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-40 rounded" />
              <SkeletonBlock className="h-3.5 w-full rounded" />
              <SkeletonBlock className="h-3.5 w-3/4 rounded" />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
            <SkeletonBlock className="h-11 w-36 rounded-xl shrink-0" />
            <SkeletonBlock className="h-11 w-20 rounded-xl shrink-0" />
            <SkeletonBlock className="h-11 w-24 rounded-xl shrink-0" />
          </div>
        </div>
      </div>
    </WorkerPageShell>
  );
}

