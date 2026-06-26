import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";

function SidebarSkeleton() {
  return (
    <aside
      className="hidden w-[260px] shrink-0 border-r border-slate-200/80 bg-white px-4 py-6 lg:flex lg:flex-col"
      aria-hidden
    >
      <div className="mb-6 h-16 animate-pulse rounded-2xl bg-slate-50 border border-slate-100" />
      <nav className="space-y-1.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-10 animate-pulse rounded-xl bg-slate-50"
          />
        ))}
      </nav>
    </aside>
  );
}

function HeaderSkeleton() {
  return (
    <header
      className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6"
      aria-hidden
    >
      <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
      </div>
    </header>
  );
}

export function AdminShellSkeleton() {
  return (
    <div
      className="flex min-h-screen bg-slate-50"
      aria-busy="true"
      aria-label="Loading admin panel"
    >
      <SidebarSkeleton />
      <div className="flex min-h-screen flex-1 flex-col min-w-0">
        <HeaderSkeleton />
        <main className="flex-1 bg-[#f8fafe] p-6 lg:p-8">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}
