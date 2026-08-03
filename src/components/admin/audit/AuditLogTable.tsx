"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollText, UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatAuditAction } from "@/lib/admin/audit-target";
import type { AdminAuditLogRow } from "@/types/admin.types";

interface AuditLogTableProps {
  logs: AdminAuditLogRow[];
}

function ActorCell({ log }: { log: AdminAuditLogRow }) {
  const name =
    log.actor_display_name ??
    log.admin_email ??
    (log.actor_type === "system"
      ? "System"
      : log.actor_type === "worker"
        ? "Worker"
        : "Unknown admin");

  return (
    <div className="flex items-center gap-2.5 min-w-0 max-w-[220px]">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
        {log.actor_avatar_url ? (
          <AvatarImage
            src={log.actor_avatar_url}
            alt=""
            initials={name.slice(0, 2)}
            size="xs"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-400">
            <UserRound className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
        {log.actor_email || log.admin_email ? (
          <p className="truncate text-[11px] text-slate-400">
            {log.actor_email ?? log.admin_email}
          </p>
        ) : null}
      </div>
    </div>
  );
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
    <section className="space-y-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <AdminSectionLabel>Event log</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {logs.length} entries
        </span>
      </div>

      <AdminDataTable
        mobileCards={paginatedLogs.map((log) => (
          <AdminMobileCard key={log.id}>
            <div className="flex items-start justify-between gap-3 min-w-0">
              <ActorCell log={log} />
              <time className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </time>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {formatAuditAction(log.action_type)}
            </p>
            {log.target_href ? (
              <Link
                href={log.target_href}
                className="block truncate text-xs font-medium text-[#006e2f] hover:underline min-w-0"
              >
                {log.target_label ?? "—"}
              </Link>
            ) : (
              <p className="truncate text-xs text-slate-500 min-w-0">
                {log.target_label ?? "—"}
              </p>
            )}
          </AdminMobileCard>
        ))}
      >
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className={ADMIN_TABLE_HEAD}>
              <th className={ADMIN_TABLE_TH}>Timestamp</th>
              <th className={ADMIN_TABLE_TH}>Admin</th>
              <th className={ADMIN_TABLE_TH}>Action</th>
              <th className={ADMIN_TABLE_TH}>Target</th>
              <th className={ADMIN_TABLE_TH}>IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className={ADMIN_TABLE_ROW}>
                <td
                  className={`${ADMIN_TABLE_TD} text-left text-xs text-slate-500 whitespace-nowrap`}
                >
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className={ADMIN_TABLE_TD}>
                  <ActorCell log={log} />
                </td>
                <td
                  className={`${ADMIN_TABLE_TD} text-left font-semibold text-slate-800 text-xs`}
                >
                  {formatAuditAction(log.action_type)}
                </td>
                <td className={`${ADMIN_TABLE_TD} text-left text-xs min-w-0`}>
                  {log.target_href ? (
                    <Link
                      href={log.target_href}
                      className="block truncate max-w-[200px] font-medium text-[#006e2f] hover:underline"
                    >
                      {log.target_label ?? "—"}
                    </Link>
                  ) : (
                    <span className="block truncate max-w-[200px] text-slate-500">
                      {log.target_label ?? "—"}
                    </span>
                  )}
                </td>
                <td
                  className={`${ADMIN_TABLE_TD} text-left text-xs font-mono text-slate-400 max-w-[120px]`}
                >
                  <span className="block truncate min-w-0">
                    {log.ip_address ?? "—"}
                  </span>
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
    </section>
  );
}
