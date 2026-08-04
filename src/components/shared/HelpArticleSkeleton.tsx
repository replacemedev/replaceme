export function HelpArticleSkeleton() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8 md:py-12 lg:py-16 animate-pulse">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Back Link Skeleton */}
        <div className="h-5 w-36 bg-slate-200 rounded-md mb-6" />

        {/* Header Skeleton */}
        <header className="mb-8 max-w-2xl">
          <div className="h-8 sm:h-9 md:h-10 w-3/4 sm:w-2/3 bg-slate-200 rounded-xl mb-3" />
          <div className="space-y-2 pt-1">
            <div className="h-5 w-full bg-slate-100 rounded-lg" />
            <div className="h-5 w-4/5 bg-slate-100 rounded-lg" />
          </div>
        </header>

        {/* Article Card Skeleton */}
        <article className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <section className="space-y-3">
            <div className="h-6 w-52 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-11/12 bg-slate-100 rounded" />
              <div className="h-4 w-4/5 bg-slate-100 rounded" />
            </div>
          </section>

          <section className="space-y-3">
            <div className="h-6 w-44 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          </section>

          <section className="space-y-3">
            <div className="h-6 w-36 bg-slate-200 rounded-md" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
