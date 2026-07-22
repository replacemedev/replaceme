import { SkeletonBlock } from "./primitives";
import { AUTH_FORM_MAX, AUTH_PANEL_PADDING, AUTH_CARD } from "@/lib/auth/ui-tokens";

export function AuthPageSkeleton({
  marketingPosition = "right",
}: {
  marketingPosition?: "left" | "right";
}) {
  const isSignUp = marketingPosition === "left";

  const formColumn = (
    <div
      className={`flex w-full flex-1 flex-col justify-between min-h-screen lg:w-1/2 ${AUTH_PANEL_PADDING}`}
    >
      <div
        className={`flex flex-1 flex-col justify-center w-full ${AUTH_FORM_MAX} mx-auto py-6 sm:py-8`}
      >
        {/* Brand Logo Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <SkeletonBlock className="h-8 w-32 rounded-xl" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-6 space-y-2 text-center lg:text-left">
          <SkeletonBlock className="h-8 w-3/4 mx-auto lg:mx-0 rounded-lg" />
          <SkeletonBlock className="h-4 w-full max-w-sm mx-auto lg:mx-0 rounded-md" />
        </div>

        {/* Form Card Skeleton */}
        <div className={`${AUTH_CARD} space-y-4`}>
          {isSignUp ? (
            <>
              {/* Role Cross Link Skeleton */}
              <SkeletonBlock className="h-10 w-full rounded-2xl mb-5" />

              {/* Name Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SkeletonBlock className="h-12 w-full rounded-xl" />
                <SkeletonBlock className="h-12 w-full rounded-xl" />
              </div>

              {/* Email & Password Fields */}
              <SkeletonBlock className="h-12 w-full rounded-xl" />
              <SkeletonBlock className="h-12 w-full rounded-xl" />

              {/* Primary Button */}
              <SkeletonBlock className="h-12 w-full rounded-xl bg-emerald-700/20" />

              {/* Bottom Prompt Link */}
              <div className="pt-2 text-center">
                <SkeletonBlock className="h-4 w-48 mx-auto rounded-md" />
              </div>
            </>
          ) : (
            <>
              {/* Email & Password Fields */}
              <SkeletonBlock className="h-12 w-full rounded-xl" />
              <SkeletonBlock className="h-12 w-full rounded-xl" />

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <SkeletonBlock className="h-4 w-32 rounded-md" />
              </div>

              {/* Submit Button */}
              <SkeletonBlock className="h-12 w-full rounded-xl bg-emerald-700/20" />

              {/* Bottom Sign Up Prompt */}
              <div className="pt-2 text-center">
                <SkeletonBlock className="h-4 w-52 mx-auto rounded-md" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Auth Footer Skeleton */}
      <footer className="w-full py-6 border-t border-slate-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SkeletonBlock className="h-3 w-40 rounded-md" />
        <div className="flex gap-4">
          <SkeletonBlock className="h-3 w-16 rounded-md" />
          <SkeletonBlock className="h-3 w-16 rounded-md" />
          <SkeletonBlock className="h-3 w-16 rounded-md" />
        </div>
      </footer>
    </div>
  );

  const marketingColumn = (
    <div className="hidden lg:flex lg:w-1/2 lg:min-h-screen lg:sticky lg:top-0 relative overflow-hidden bg-slate-900/90 p-12 flex-col justify-center">
      <div className="relative z-10 mx-auto w-full max-w-lg space-y-8">
        <div className="space-y-4">
          <SkeletonBlock className="h-3 w-24 rounded-md bg-white/20" />
          <SkeletonBlock className="h-9 w-4/5 rounded-xl bg-white/20" />
          <SkeletonBlock className="h-4 w-full rounded-md bg-white/15" />
          <SkeletonBlock className="h-4 w-3/4 rounded-md bg-white/15" />
        </div>
        <div className="space-y-4 pt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl bg-white/20" />
              <div className="space-y-2 flex-1">
                <SkeletonBlock className="h-4 w-32 rounded-md bg-white/20" />
                <SkeletonBlock className="h-3 w-full rounded-md bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#f8fafe] lg:flex-row animate-pulse">
      {marketingPosition === "left" ? marketingColumn : null}
      {formColumn}
      {marketingPosition === "right" ? marketingColumn : null}
    </main>
  );
}

