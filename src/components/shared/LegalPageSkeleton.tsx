import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";

export function LegalPageSkeleton() {
  return (
    <main className={`${PUBLIC_PAGE_TOP} min-h-[calc(100vh-4rem)] bg-[#f8fafe] flex-1 animate-pulse`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <header className="text-center mb-10 sm:mb-12">
          <div className="h-6 w-32 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="h-9 sm:h-11 lg:h-12 w-64 sm:w-96 bg-slate-200 rounded-xl mx-auto mb-3" />
          <div className="h-4 w-40 bg-slate-200/80 rounded mx-auto" />
        </header>

        <div className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xs sm:px-10 sm:py-12">
          <div className="h-7 w-44 bg-slate-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-200/80 rounded" />
            <div className="h-4 w-11/12 bg-slate-200/80 rounded" />
            <div className="h-4 w-4/5 bg-slate-200/80 rounded" />
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 space-y-3">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-slate-200/80 rounded" />
              <div className="h-4 w-40 bg-slate-200/80 rounded" />
              <div className="h-4 w-52 bg-slate-200/80 rounded" />
              <div className="h-4 w-44 bg-slate-200/80 rounded" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="h-7 w-56 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200/80 rounded" />
              <div className="h-4 w-full bg-slate-200/80 rounded" />
              <div className="h-4 w-3/4 bg-slate-200/80 rounded" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="h-7 w-48 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200/80 rounded" />
              <div className="h-4 w-5/6 bg-slate-200/80 rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

