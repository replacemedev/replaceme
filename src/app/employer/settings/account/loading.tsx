import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerAccountSettingsLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-8 animate-pulse">
      <EmployerPageHeader
        title="Account settings"
        subhead="Manage your profile, security, and subscription plan."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <CardSkeleton minHeight="min-h-[220px]" />
          <CardSkeleton minHeight="min-h-[300px]" />
        </div>
        <aside className="space-y-6">
          <CardSkeleton minHeight="min-h-[200px]" />
        </aside>
      </div>
    </EmployerPageShell>
  );
}
