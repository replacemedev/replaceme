import { EmployerPageShell } from "@/components/employer/layout";
import { CardSkeleton, SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerOnboardingLoading() {
  return (
    <EmployerPageShell width="wide" className="gap-8 sm:gap-10 animate-pulse">
      <header className="space-y-3 text-center max-w-lg mx-auto">
        <SkeletonBlock className="h-2 w-full max-w-xs bg-slate-200 rounded-full mx-auto" />
        <SkeletonBlock className="h-8 w-64 bg-slate-200 rounded-lg mx-auto" />
        <SkeletonBlock className="h-4 w-80 max-w-full bg-slate-200 rounded mx-auto" />
      </header>

      <CardSkeleton minHeight="min-h-[480px]" />
    </EmployerPageShell>
  );
}
