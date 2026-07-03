import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

export function VerificationSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header placeholder matching WorkerPageHeader */}
      <div className="space-y-2 text-center sm:text-left">
        <SkeletonBlock className="h-9 w-64 rounded-xl mx-auto sm:mx-0" />
        <SkeletonBlock className="h-4 w-full max-w-2xl rounded mx-auto sm:mx-0" />
      </div>

      {/* Stepper placeholder */}
      <nav aria-hidden className="mb-8 pt-4">
        <ol className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="flex sm:flex-1 sm:items-center min-w-0">
              <div className="flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center sm:flex-1 min-w-0">
                <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
                <SkeletonBlock className="h-4 w-24 rounded mx-auto sm:mx-0" />
              </div>
              {i < 2 && (
                <div className="hidden sm:block flex-1 h-0.5 mx-2 rounded-full bg-slate-200" />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Upload panels and sidebar grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm"
            >
              <SkeletonBlock className="h-4 w-40 rounded" />
              <SkeletonBlock className="h-3 w-full max-w-md rounded" />
              <div className="h-36 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/50" />
            </div>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 h-48 shadow-sm" />
          <div className="bg-[#ebfdf2]/20 border border-[#006e2f]/10 rounded-2xl p-5 h-40 shadow-sm" />
        </aside>
      </div>
    </div>
  );
}
