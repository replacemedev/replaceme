import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerJobDetailLoading() {
  return (
    <EmployerPageShell width="content" className="gap-8 pb-24 lg:pb-12 animate-pulse">
      <EmployerPageHeader
        title={<SkeletonBlock className="h-9 w-64 rounded-xl" />}
        subhead={<SkeletonBlock className="h-4 w-96 max-w-full rounded mt-2" />}
        actions={
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-24 rounded-xl" />
            <SkeletonBlock className="h-10 w-24 rounded-xl" />
          </div>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <CardSkeleton minHeight="min-h-[400px]" />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <CardSkeleton minHeight="min-h-[220px]" />
          <CardSkeleton minHeight="min-h-[200px]" />
          <CardSkeleton minHeight="min-h-[180px]" />
        </div>
      </div>
    </EmployerPageShell>
  );
}
