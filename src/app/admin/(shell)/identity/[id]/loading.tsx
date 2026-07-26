import { AdminPageShell } from "@/components/admin/layout";

export default function AdminIdentityDetailLoading() {
  return (
    <AdminPageShell>
      <div className="animate-pulse space-y-6 min-w-0">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-8 w-64 max-w-full rounded bg-slate-200" />
        <div className="h-4 w-48 max-w-full rounded bg-slate-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="aspect-[3/2] w-full rounded-2xl bg-slate-100 overflow-hidden" />
          <div className="h-80 w-full rounded-2xl bg-slate-100" />
        </div>
      </div>
    </AdminPageShell>
  );
}
