export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <header>
        <div className="h-7 w-56 bg-slate-200/70 rounded-lg" />
        <div className="h-4 w-80 bg-slate-200/50 rounded mt-2" />
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 h-[100px]"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2.5">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-8 w-16 bg-slate-200/70 rounded-lg" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 h-[260px]">
            <div className="h-4 w-36 bg-slate-100 rounded mb-4" />
            <div className="h-48 rounded-xl bg-slate-50" />
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 h-[260px]">
            <div className="h-4 w-44 bg-slate-100 rounded mb-4" />
            <div className="h-48 rounded-xl bg-slate-50" />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 h-[200px]">
            <div className="h-4 w-28 bg-slate-100 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-50" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 h-[260px]">
            <div className="h-4 w-40 bg-slate-100 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-50" />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
