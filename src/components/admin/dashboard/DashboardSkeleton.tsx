export function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <header>
        <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-slate-200/50" />
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={`primary-${index}`} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <StatCardSkeleton key={`secondary-${index}`} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ChartSkeleton titleWidth="w-36" />
          <ChartSkeleton titleWidth="w-44" />
        </div>
        <aside className="space-y-6">
          <PanelSkeleton height="h-[200px]" titleWidth="w-28" rows={3} rowHeight="h-12" />
          <PanelSkeleton height="h-[260px]" titleWidth="w-40" rows={4} rowHeight="h-10" />
        </aside>
      </section>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="h-[100px] rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2.5">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200/70" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function ChartSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="h-[260px] rounded-2xl border border-slate-200/80 bg-white p-6">
      <div className={`mb-4 h-4 ${titleWidth} animate-pulse rounded bg-slate-100`} />
      <div className="h-48 animate-pulse rounded-xl bg-slate-50" />
    </div>
  );
}

function PanelSkeleton({
  height,
  titleWidth,
  rows,
  rowHeight,
}: {
  height: string;
  titleWidth: string;
  rows: number;
  rowHeight: string;
}) {
  return (
    <div className={`${height} rounded-2xl border border-slate-200/80 bg-white p-5`}>
      <div className={`mb-4 h-4 ${titleWidth} animate-pulse rounded bg-slate-100`} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className={`${rowHeight} animate-pulse rounded-xl bg-slate-50`}
          />
        ))}
      </div>
    </div>
  );
}
