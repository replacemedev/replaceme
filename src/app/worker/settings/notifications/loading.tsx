import { WorkerPageShell, WorkerPageHeader } from "@/components/worker/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function WorkerNotificationPreferencesLoading() {
  return (
    <WorkerPageShell width="narrow" className="animate-pulse">
      <WorkerPageHeader
        title={<SkeletonBlock className="h-9 w-64 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
        actions={<SkeletonBlock className="h-5 w-32 rounded" />}
      />

      <div className="space-y-6">
        <SkeletonBlock className="h-5 w-48 rounded" />

        <ul className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center justify-between gap-4">
              <SkeletonBlock className="h-4 w-44 rounded" />
              <SkeletonBlock className="h-6 w-11 rounded-full shrink-0" />
            </li>
          ))}
        </ul>

        <SkeletonBlock className="h-9 w-36 rounded-xl" />
      </div>
    </WorkerPageShell>
  );
}
