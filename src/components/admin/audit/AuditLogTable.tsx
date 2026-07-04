"use client";

import { useState } from "react";
import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import type { AdminAuditLogRow } from "@/types/admin.types";
import { TablePagination } from "@/components/shared/TablePagination";

interface AuditLogTableProps {
  logs: AdminAuditLogRow[];
}

function formatAction(action: string): string {
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<ScrollText className="h-5 w-5" aria-hidden />}
        title="No audit entries"
        description="Admin actions will be recorded here for accountability."
      />
    );
  }

  const totalItems = logs.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedLogs = logs.slice(startIndex, startIndex + itemsPerPage);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <AdminSectionLabel>Event log</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {logs.length} entries
        </span>
      </div>
      <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left whitespace-nowrap">Timestamp</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Admin</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Action</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Target</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-left text-xs text-slate-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-left text-xs text-slate-600">
                  {log.admin_email ?? "—"}
                </td>
                <td className="px-4 py-3 text-left font-semibold text-slate-800 text-xs">
                  {formatAction(log.action_type)}
                </td>
                <td className="px-4 py-3 text-left text-xs text-slate-500">
                  {log.target_type ? (
                    <>
                      <span className="text-slate-400">{log.target_type}</span>
                      {log.target_id ? (
                        <span className="block font-mono truncate max-w-[180px]">
                          {log.target_id}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-left text-xs font-mono text-slate-400">
                  {log.ip_address ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={activePage}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
