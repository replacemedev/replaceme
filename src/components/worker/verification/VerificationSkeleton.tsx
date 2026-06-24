export function VerificationSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="text-center space-y-3 mb-8">
        <div className="h-8 w-56 bg-slate-200 rounded-lg mx-auto" />
        <div className="h-4 w-full max-w-xl bg-slate-100 rounded mx-auto" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex sm:flex-1 items-center gap-3 sm:flex-col">
            <div className="h-8 w-8 rounded-full bg-slate-200 shrink-0" />
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3"
            >
              <div className="h-4 w-40 bg-slate-200 rounded" />
              <div className="h-3 w-full max-w-md bg-slate-100 rounded" />
              <div className="h-36 rounded-xl border-2 border-dashed border-slate-100 bg-slate-50" />
            </div>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 h-48" />
          <div className="bg-[#ebfdf2]/40 border border-slate-100 rounded-2xl p-5 h-40" />
        </aside>
      </div>
    </div>
  );
}
