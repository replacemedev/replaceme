export function JobCardSkeleton() {
  const cardStyles =
    "bg-gradient-to-b from-white to-slate-50 border border-slate-200 border-t-4 border-t-slate-200 rounded-xl shadow-sm relative overflow-hidden";

  return (
    <article className={`flex flex-col h-full p-5 md:p-8 gap-5 ${cardStyles}`}>
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-grow">
          {/* Logo Skeleton */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-200 animate-pulse" />
          
          <div className="min-w-0 flex-grow space-y-2">
            {/* Title Skeleton */}
            <div className="h-5 bg-slate-200 rounded-md w-3/4 animate-pulse" />
            {/* Company Skeleton */}
            <div className="h-3.5 bg-slate-200 rounded-md w-1/2 animate-pulse" />
          </div>
        </div>

        {/* Bookmark Button Skeleton */}
        <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
      </header>

      {/* Badges Skeleton */}
      <div className="flex flex-wrap gap-2">
        <div className="h-5 w-20 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-5 w-28 rounded-full bg-slate-200 animate-pulse" />
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2.5 flex-grow">
        <div className="h-4 bg-slate-200 rounded-md w-full animate-pulse" />
        <div className="h-4 bg-slate-200 rounded-md w-11/12 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded-md w-4/5 animate-pulse" />
      </div>

      {/* Footer Skeleton */}
      <footer className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-auto w-full">
        {/* Clock/Posted Date Skeleton */}
        <div className="h-3.5 w-24 bg-slate-200 rounded-md animate-pulse" />

        {/* View Details Button Skeleton */}
        <div className="h-10 w-full md:w-32 bg-slate-200 rounded-lg animate-pulse" />
      </footer>
    </article>
  );
}
