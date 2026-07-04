"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminApplicationRow } from "@/types/admin.types";

interface ApplicationsClientProps {
  applications: AdminApplicationRow[];
}

export function ApplicationsClient({ applications }: ApplicationsClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (applications.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" aria-hidden />}
        title="No applications yet"
        description="Cross-platform job applications will appear here for oversight."
      />
    );
  }

  const totalItems = applications.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const paginatedApps = applications.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <AdminSectionLabel>Platform applications</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {applications.length} total
        </span>
      </div>
      <div className="space-y-4">
        <AdminDataTable
          mobileCards={paginatedApps.map((app) => (
            <AdminMobileCard key={app.id}>
              <p className="font-semibold text-slate-900">
                {app.worker_name ?? "—"}
              </p>
              <p className="text-xs text-slate-500">{app.worker_email}</p>
              <p className="text-sm text-slate-700">{app.job_title ?? "—"}</p>
              <p className="text-sm text-slate-600">{app.company_name ?? "—"}</p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={app.status} />
                <span className="text-xs font-mono text-slate-500">
                  {app.match_score}% match
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {new Date(app.created_at).toLocaleDateString()}
              </p>
            </AdminMobileCard>
          ))}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className={ADMIN_TABLE_HEAD}>
                <th className={ADMIN_TABLE_TH}>Worker</th>
                <th className={ADMIN_TABLE_TH}>Job</th>
                <th className={ADMIN_TABLE_TH}>Employer</th>
                <th className={ADMIN_TABLE_TH}>Status</th>
                <th className={ADMIN_TABLE_TH}>Match</th>
                <th className={ADMIN_TABLE_TH}>Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedApps.map((app) => (
                <tr key={app.id} className={ADMIN_TABLE_ROW}>
                  <td className={ADMIN_TABLE_TD}>
                    <p className="font-medium text-slate-900">
                      {app.worker_name ?? "—"}
                    </p>
                    <p className="text-xs text-slate-400">{app.worker_email}</p>
                  </td>
                  <td className={`${ADMIN_TABLE_TD} text-slate-700`}>
                    {app.job_title ?? "—"}
                  </td>
                  <td className={`${ADMIN_TABLE_TD} text-slate-600`}>
                    {app.company_name ?? "—"}
                  </td>
                  <td className={ADMIN_TABLE_TD}>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className={`${ADMIN_TABLE_TD} font-mono text-xs text-slate-600`}>
                    {app.match_score}%
                  </td>
                  <td
                    className={`${ADMIN_TABLE_TD} text-xs text-slate-500 whitespace-nowrap`}
                  >
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminDataTable>
        <TablePagination
          currentPage={activePage}
          totalItems={totalItems}
          pageSize={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
