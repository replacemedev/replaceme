import {
  CardSkeleton,
  SkeletonBlock,
  TextLineSkeleton,
} from "@/components/shared/skeletons/primitives";

/** Matches `AdminPageHeader` — title + muted description (+ optional action slot). */
export function AdminPageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <header
      className={`flex flex-col gap-4 animate-pulse ${
        withAction ? "sm:flex-row sm:items-start sm:justify-between" : ""
      }`}
    >
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56 max-w-full rounded-lg bg-slate-200/70" />
        <TextLineSkeleton width="w-80 max-w-full" className="bg-slate-100" />
      </div>
      {withAction ? (
        <SkeletonBlock className="h-10 w-32 rounded-xl bg-slate-100 shrink-0" />
      ) : null}
    </header>
  );
}

/** Matches admin / dashboard `StatCard` (white card, icon top-right). */
export function AdminStatCardSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <SkeletonBlock className="h-3.5 w-20 rounded bg-slate-100" />
        <SkeletonBlock className="h-7 w-7 rounded-full bg-slate-100 shrink-0" />
      </div>
      <SkeletonBlock className="h-8 w-16 rounded-lg bg-slate-200/70" />
    </div>
  );
}

export function AdminStatGridSkeleton({
  count,
  columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6",
}: {
  count: number;
  columns?: string;
}) {
  return (
    <section className={`grid ${columns}`}>
      {Array.from({ length: count }).map((_, index) => (
        <AdminStatCardSkeleton key={index} />
      ))}
    </section>
  );
}

export function AdminTabsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex gap-2 border-b border-slate-200 pb-px animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} className="h-10 w-28 rounded-t-xl bg-slate-100" />
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden animate-pulse">
      <div className="border-b border-slate-100 px-5 py-4">
        <SkeletonBlock className="h-4 w-48 rounded bg-slate-100" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-5 py-4">
            <SkeletonBlock className="h-10 w-10 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <SkeletonBlock className="h-4 w-1/3 max-w-[12rem] rounded bg-slate-100" />
              <SkeletonBlock className="h-3 w-1/2 max-w-[16rem] rounded bg-slate-50" />
            </div>
            <SkeletonBlock className="h-8 w-20 rounded-lg bg-slate-100 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPanelSkeleton({
  height = "min-h-[200px]",
  titleWidth = "w-32",
  rows = 3,
}: {
  height?: string;
  titleWidth?: string;
  rows?: number;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] ${height} animate-pulse`}
    >
      <SkeletonBlock className={`h-4 ${titleWidth} rounded bg-slate-100 mb-4`} />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonBlock key={index} className="h-12 rounded-xl bg-slate-50" />
        ))}
      </div>
    </div>
  );
}

export function AdminChartSkeleton({ titleWidth = "w-36" }: { titleWidth?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] animate-pulse">
      <SkeletonBlock className={`h-4 ${titleWidth} rounded bg-slate-100 mb-4`} />
      <SkeletonBlock className="h-48 rounded-xl bg-slate-50" />
    </div>
  );
}

export function AdminSettingsListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-5 py-4">
          <SkeletonBlock className="h-4 w-32 rounded bg-slate-100" />
          <SkeletonBlock className="h-4 w-48 max-w-full rounded bg-slate-50" />
        </div>
      ))}
    </div>
  );
}

export function AdminCardGridSkeleton({
  count = 2,
  columns = "grid-cols-1 md:grid-cols-2",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} minHeight="min-h-[180px]" />
      ))}
    </div>
  );
}

export function AdminListPageSkeleton({ withTabs = false, tabCount = 2 }: { withTabs?: boolean; tabCount?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading admin page">
      <AdminPageHeaderSkeleton />
      {withTabs ? <AdminTabsSkeleton count={tabCount} /> : null}
      <AdminTableSkeleton />
    </div>
  );
}

export function AdminSettingsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading settings">
      <AdminPageHeaderSkeleton />
      <AdminSettingsListSkeleton />
      <CardSkeleton minHeight="min-h-[120px]" />
    </div>
  );
}

export function AdminRevenuePageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading revenue">
      <AdminPageHeaderSkeleton />
      <AdminStatGridSkeleton count={3} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" />
      <AdminChartSkeleton titleWidth="w-40" />
    </div>
  );
}

export function AdminBillingPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading billing">
      <AdminPageHeaderSkeleton />
      <AdminStatGridSkeleton count={4} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" />
      <AdminTableSkeleton />
    </div>
  );
}

export function AdminIdentityPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading identity review">
      <AdminPageHeaderSkeleton withAction />
      <AdminCardGridSkeleton count={2} />
      <AdminTableSkeleton rows={5} />
    </div>
  );
}

export function AdminSecurityPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading security">
      <AdminPageHeaderSkeleton />
      <AdminPanelSkeleton height="min-h-[160px]" rows={2} />
      <AdminPanelSkeleton height="min-h-[240px]" rows={4} />
    </div>
  );
}

export function AdminNotificationsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading notifications">
      <AdminPageHeaderSkeleton withAction />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <SkeletonBlock className="h-4 w-1/3 max-w-[14rem] rounded bg-slate-200/70" />
            <SkeletonBlock className="mt-3 h-3 w-full rounded bg-slate-100" />
            <SkeletonBlock className="mt-2 h-3 w-4/5 rounded bg-slate-50" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading details">
      <AdminPageHeaderSkeleton />
      <AdminCardGridSkeleton count={2} />
      <AdminPanelSkeleton height="min-h-[200px]" rows={4} />
    </div>
  );
}
