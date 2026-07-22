import { SkeletonBlock } from "@/components/shared/skeletons/primitives";

interface CitationBlockProps {
  label?: string;
  headline: string;
  body: string;
  stat?: string;
  statLabel?: string;
  className?: string;
}

export function CitationBlock({
  label,
  headline,
  body,
  stat,
  statLabel,
  className = "",
}: CitationBlockProps) {
  return (
    <article
      className={`h-full flex flex-col bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${className}`}
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      {label && (
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-[#22c55e] mb-2 sm:mb-3">
            {label}
          </p>
        </header>
      )}

      <section className="flex-1 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3 leading-snug">
          {headline}
        </h3>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{body}</p>
      </section>

      {stat && (
        <aside
          className="mt-auto pt-4 sm:pt-6 border-t border-slate-100 flex items-baseline gap-2 sm:gap-2.5"
          aria-label={`Key statistic: ${stat} — ${statLabel}`}
        >
          <span
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#22c55e] tracking-tight"
            itemProp="value"
          >
            {stat}
          </span>
          {statLabel && (
            <span className="text-xs sm:text-sm font-semibold text-slate-500">
              {statLabel}
            </span>
          )}
        </aside>
      )}
    </article>
  );
}

export function CitationBlockSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-full flex flex-col bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 md:p-8 shadow-sm animate-pulse ${className}`}
    >
      {/* Kicker Skeleton */}
      <SkeletonBlock className="h-3.5 w-40 bg-slate-200 rounded mb-4" />

      {/* Headline Skeleton */}
      <SkeletonBlock className="h-6 w-5/6 bg-slate-200 rounded mb-3" />

      {/* Body Paragraph Skeleton */}
      <div className="space-y-2 mb-6 flex-1">
        <SkeletonBlock className="h-4 w-full bg-slate-100 rounded" />
        <SkeletonBlock className="h-4 w-11/12 bg-slate-100 rounded" />
        <SkeletonBlock className="h-4 w-4/5 bg-slate-100 rounded" />
      </div>

      {/* Footer Section (Pushed to bottom via mt-auto) */}
      <div className="mt-auto pt-6 border-t border-slate-100 flex items-baseline gap-2.5">
        <SkeletonBlock className="h-10 w-16 bg-emerald-100/70 rounded-lg" />
        <SkeletonBlock className="h-4 w-32 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export function CitationBlockGridSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch ${className}`}>
      <CitationBlockSkeleton />
      <CitationBlockSkeleton />
      <CitationBlockSkeleton />
    </div>
  );
}

