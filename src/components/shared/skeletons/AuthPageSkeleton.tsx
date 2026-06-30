import { SkeletonBlock } from "./primitives";

export function AuthPageSkeleton({
  marketingPosition = "right",
}: {
  marketingPosition?: "left" | "right";
}) {
  const formColumn = (
    <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-8 sm:px-12 lg:px-20">
      <div className="w-full max-w-md mx-auto space-y-6">
        <SkeletonBlock className="h-10 w-48" />
        <SkeletonBlock className="h-4 w-full max-w-sm" />
        <div className="space-y-4 pt-4">
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-12 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );

  const marketingColumn = (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-100 to-slate-200" />
  );

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#f8fafe] animate-pulse">
      {marketingPosition === "left" ? marketingColumn : null}
      {formColumn}
      {marketingPosition === "right" ? marketingColumn : null}
    </div>
  );
}
