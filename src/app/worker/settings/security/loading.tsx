import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerSecuritySettingsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-8 w-28 sm:h-9 sm:w-32 rounded-xl" />}
        subhead={
          <SkeletonBlock className="h-4 w-full max-w-md rounded mt-2" />
        }
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
        {/* Account password card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-start gap-4">
              <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-36 sm:h-5 sm:w-40 rounded" />
                <SkeletonBlock className="h-4 w-full max-w-sm rounded" />
                <SkeletonBlock className="h-4 w-3/4 max-w-xs rounded" />
              </div>
            </div>
            <div className="flex w-full shrink-0 pl-14 sm:w-auto sm:justify-end sm:pl-0">
              <SkeletonBlock className="h-11 w-36 rounded-xl" />
            </div>
          </div>
        </section>

        {/* Active sessions card */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-32 sm:h-5 sm:w-36 rounded" />
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-4 w-5/6 max-w-md rounded" />
              </div>

              <ul className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <li key={i} className="flex gap-2">
                    <SkeletonBlock className="mt-0.5 h-4 w-4 shrink-0 rounded" />
                    <SkeletonBlock className="h-4 w-full max-w-sm rounded" />
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <SkeletonBlock className="h-11 w-full rounded-xl sm:w-48" />
                <SkeletonBlock className="h-11 w-full rounded-xl sm:w-44" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </WorkerPageShell>
  );
}
