import { EmployerPageShell, EmployerPageHeader } from "@/components/employer/layout";

export default function EmployerReviewsLoading() {
  return (
    <EmployerPageShell width="content">
      <EmployerPageHeader
        title="Worker reviews"
        subhead="Leave testimonials for workers you have hired on your team."
      />

      <div className="space-y-6">
        {/* Search & Filter Toolbar Skeleton */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between animate-pulse">
          <div className="h-10 w-full rounded-xl bg-slate-200/70 md:w-72 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end flex-1">
            <div className="flex gap-1.5 overflow-hidden">
              <div className="h-9 w-20 rounded-xl bg-slate-200/70" />
              <div className="h-9 w-28 rounded-xl bg-slate-200/70" />
              <div className="h-9 w-24 rounded-xl bg-slate-200/70" />
            </div>
            <div className="h-10 w-28 rounded-xl bg-slate-200/70 shrink-0" />
          </div>
        </div>

        {/* Card Skeletons */}
        <div className="space-y-4 animate-pulse">
          {/* Pending Review Card Skeleton */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-full bg-slate-200/70 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-44 rounded bg-slate-200/70" />
                <div className="h-3 w-64 rounded bg-slate-200/70" />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <div className="h-3 w-20 rounded bg-slate-200/70" />
              <div className="h-6 w-36 rounded bg-slate-200/70" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-slate-200/70" />
              <div className="h-[110px] w-full rounded-xl bg-slate-200/70" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="h-3 w-36 rounded bg-slate-200/70" />
              <div className="h-10 w-32 rounded-xl bg-slate-200/70 shrink-0" />
            </div>
          </div>

          {/* Reviewed Card Skeleton */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-full bg-slate-200/70 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-36 rounded bg-slate-200/70" />
                <div className="h-3 w-48 rounded bg-slate-200/70" />
              </div>
            </div>
            <div className="h-7 w-24 rounded-full bg-slate-200/70 shrink-0" />
          </div>
        </div>
      </div>
    </EmployerPageShell>
  );
}
