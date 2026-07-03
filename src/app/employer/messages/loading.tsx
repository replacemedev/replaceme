import { EmployerPageShell } from "@/components/employer/layout";
import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export default function EmployerMessagesLoading() {
  return (
    <EmployerPageShell width="wide" className="h-[calc(100dvh-4rem)] flex flex-col justify-center py-4 animate-pulse">
      <SkeletonBlock className="h-full w-full rounded-3xl border border-slate-100 bg-white" />
    </EmployerPageShell>
  );
}
