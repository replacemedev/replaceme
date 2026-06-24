import { SkeletonBlock } from "./primitives";

export function MessagingPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 h-[75vh] animate-pulse">
      <SkeletonBlock className="h-full w-full rounded-3xl border border-slate-100" />
    </div>
  );
}
