import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerNotificationsLoading() {
  return (
    <EmployerPageShell width="content" className="animate-pulse">
      <EmployerPageHeader
        title="Notifications"
        subhead="Stay updated with activities in your account."
      />

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-5 rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <SkeletonBlock className="h-4.5 w-1/3 rounded bg-slate-200" />
              <SkeletonBlock className="h-3.5 w-2/3 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </EmployerPageShell>
  );
}
