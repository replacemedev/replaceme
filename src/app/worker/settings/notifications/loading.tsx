import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerNotificationPreferencesLoading() {
  return (
    <WorkerPageShell width="narrow" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-8 w-56 sm:h-9 sm:w-64 rounded-xl" />}
        subhead={
          <SkeletonBlock className="h-4 w-full max-w-lg rounded mt-2" />
        }
      />

      <div className="space-y-6">
        <ul className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-4">
              <SkeletonBlock className="h-5 w-1/2 max-w-[14rem] rounded" />
              <SkeletonBlock className="h-6 w-11 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>

        <SkeletonBlock className="h-9 w-full sm:w-36 rounded-xl" />
      </div>
    </WorkerPageShell>
  );
}
