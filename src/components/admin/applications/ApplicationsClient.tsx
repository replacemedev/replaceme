import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type { AdminApplicationRow } from "@/types/admin.types";

interface ApplicationsClientProps {
  applications: AdminApplicationRow[];
}

export function ApplicationsClient({ applications }: ApplicationsClientProps) {
  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" aria-hidden />}
        title="No applications yet"
        description="Cross-platform job applications will appear here for oversight."
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <AdminSectionLabel>Platform applications</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {applications.length} total
        </span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3">Worker</th>
              <th className="px-4 py-3">Job</th>
              <th className="px-4 py-3">Employer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Applied</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">
                    {app.worker_name ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400">{app.worker_email}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{app.job_title ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">{app.company_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {app.match_score}%
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
