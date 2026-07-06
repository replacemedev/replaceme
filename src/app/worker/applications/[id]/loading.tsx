import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";
import { WORKER_CARD } from "@/lib/worker/ui-tokens";

export default function WorkerApplicationDetailLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-64 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-40 rounded mt-2" />}
        actions={
          <div className="flex flex-wrap gap-2">
            <SkeletonBlock className="h-9 w-24 rounded-xl shrink-0" />
            <SkeletonBlock className="h-9 w-28 rounded-xl shrink-0" />
          </div>
        }
      />

      <article className={`${WORKER_CARD} p-6 space-y-6`}>
        {/* Status / salary row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonBlock className="h-5 w-20 rounded-md" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="h-4 w-28 rounded" />
        </div>

        {/* Stepper skeleton — exactly mirrors ApplicationStepper's responsive layout */}
        <div className="w-full py-4">
          <div className="flex flex-row overflow-x-auto md:overflow-x-visible gap-0 justify-start md:justify-between w-full select-none scrollbar-none px-1 md:px-0">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="flex flex-col items-center shrink-0 md:shrink md:flex-1 w-[140px] relative"
              >
                {/* Connector line skeleton */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[2px] bg-slate-200" />
                )}
                {/* Circle skeleton */}
                <div className="relative z-10 h-10 w-10 shrink-0 rounded-full bg-slate-200" />
                {/* Label skeletons */}
                <div className="flex flex-col items-center gap-1.5 mt-3 px-1">
                  <SkeletonBlock className="h-3 w-14 rounded" />
                  <SkeletonBlock className="h-2.5 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline skeleton */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <SkeletonBlock className="h-5 w-36 rounded-md" />
          <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 py-2">
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full border-4 border-white bg-slate-200" />
              <SkeletonBlock className="h-4 w-32 rounded" />
              <SkeletonBlock className="h-3 w-20 rounded mt-1.5" />
            </div>
            <div className="relative">
              <span className="absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full border-4 border-white bg-slate-200" />
              <SkeletonBlock className="h-4 w-48 rounded" />
              <SkeletonBlock className="h-3 w-20 rounded mt-1.5" />
            </div>
          </div>
        </div>
      </article>
    </WorkerPageShell>
  );
}

