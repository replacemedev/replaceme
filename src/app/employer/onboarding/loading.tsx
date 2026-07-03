import { EmployerPageShell } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerOnboardingLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-8 sm:gap-10 animate-pulse">
      <header className="space-y-2 text-center">
        <SkeletonBlock className="h-4.5 w-32 bg-slate-200 rounded mx-auto" />
        <SkeletonBlock className="h-8 w-64 bg-slate-200 rounded-lg mx-auto" />
        <SkeletonBlock className="h-4 w-96 max-w-full bg-slate-200 rounded mx-auto mt-2" />
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <CardSkeleton minHeight="min-h-[500px]" />
        <CardSkeleton minHeight="min-h-[400px]" />
      </div>
    </EmployerPageShell>
  );
}
