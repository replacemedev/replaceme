import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerContractsLoading() {
  return (
    <WorkerPageShell width="content" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-40 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
      />

      <ul className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2.5 flex-1">
              <SkeletonBlock className="h-4 w-1/3 max-w-[15rem] rounded" />
              <SkeletonBlock className="h-4 w-1/4 max-w-[10rem] rounded" />
              <SkeletonBlock className="h-3 w-1/2 max-w-[18rem] rounded mt-1" />
            </div>
            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <SkeletonBlock className="flex-1 sm:flex-none h-8 w-16 rounded-lg" />
              <SkeletonBlock className="flex-1 sm:flex-none h-8 w-16 rounded-lg" />
            </div>
          </li>
        ))}
      </ul>
    </WorkerPageShell>
  );
}
