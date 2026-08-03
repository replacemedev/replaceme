"use client";

import { useState } from "react";
import { Flag, MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  AdminFilterPills,
  AdminSectionLabel,
} from "@/components/admin/shared/AdminFilterPills";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { ModerationRowActionsMenu } from "@/components/admin/moderation/ModerationRowActionsMenu";
import {
  formatChatModerationReason,
  CHAT_MODERATION_STATUS_LABELS,
  type ChatModerationStatus,
} from "@/lib/reporting/messaging-moderation";
import type { AdminChatModerationFlagRow } from "@/types/admin.types";

type QueueFilter = "active" | ChatModerationStatus;

const FILTER_OPTIONS = [
  "Active",
  "Open",
  "Investigating",
  "Dismissed",
  "Resolved",
] as const;

function filterKey(label: string): QueueFilter {
  switch (label) {
    case "Open":
      return "open";
    case "Investigating":
      return "investigating";
    case "Dismissed":
      return "dismissed";
    case "Resolved":
      return "resolved";
    default:
      return "active";
  }
}

function statusBadgeClass(status: ChatModerationStatus): string {
  switch (status) {
    case "open":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "investigating":
      return "bg-sky-50 text-sky-800 ring-sky-200";
    case "dismissed":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    case "resolved":
      return "bg-[#ebfdf2] text-[#006e2f] ring-[#b7f0c8]";
  }
}

interface ModerationClientProps {
  flags: AdminChatModerationFlagRow[];
}

export function ModerationClient({ flags }: ModerationClientProps) {
  const [filterLabel, setFilterLabel] =
    useState<(typeof FILTER_OPTIONS)[number]>("Active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filter = filterKey(filterLabel);
  const filtered =
    filter === "active"
      ? flags.filter((f) => f.status === "open" || f.status === "investigating")
      : flags.filter((f) => f.status === filter);

  const counts: Partial<Record<string, number>> = {
    Active: flags.filter(
      (f) => f.status === "open" || f.status === "investigating"
    ).length,
    Open: flags.filter((f) => f.status === "open").length,
    Investigating: flags.filter((f) => f.status === "investigating").length,
    Dismissed: flags.filter((f) => f.status === "dismissed").length,
    Resolved: flags.filter((f) => f.status === "resolved").length,
  };

  if (flags.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-5 w-5" aria-hidden />}
        title="No flagged conversations"
        description="Threads appear here only when auto-flagged for safety signals or reported by a user. Admins do not browse private messages without cause."
      />
    );
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const pageRows = filtered.slice(startIndex, startIndex + itemsPerPage);

  const rowActions = (row: AdminChatModerationFlagRow) => (
    <ModerationRowActionsMenu
      flagId={row.flag_id}
      threadId={row.thread_id}
      workerId={row.worker_id}
      workerLabel={row.worker_name ?? "Worker"}
      employerUserId={row.employer_user_id}
      employerLabel={row.company_name ?? "Employer"}
    />
  );

  return (
    <section className="space-y-4 min-w-0 w-full max-w-full">
      <AdminFilterPills
        options={FILTER_OPTIONS}
        value={filterLabel}
        onChange={(v) => {
          setFilterLabel(v as (typeof FILTER_OPTIONS)[number]);
          setCurrentPage(1);
        }}
        counts={counts}
      />

      <div className="flex items-center justify-between gap-3 min-w-0">
        <AdminSectionLabel>Flagged &amp; reported threads</AdminSectionLabel>
        <span className="shrink-0 rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {filtered.length} in view
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-5 w-5" aria-hidden />}
          title="Nothing in this filter"
          description="Try Active to see open and investigating cases."
        />
      ) : (
        <div className="space-y-4 min-w-0">
          <AdminDataTable
            mobileCards={pageRows.map((row) => (
              <AdminMobileCard
                key={row.flag_id}
                actions={rowActions(row)}
                actionsPlacement="header"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="truncate font-semibold text-slate-900 min-w-0">
                      {row.worker_name ?? "—"}
                    </p>
                    <VerifiedBadge show={row.worker_is_verified} size="sm" />
                  </div>
                  <p className="truncate text-sm text-slate-600 min-w-0">
                    {row.company_name ?? "—"}
                  </p>
                  <p className="truncate text-xs text-slate-500 min-w-0">
                    {row.job_title ?? "No job context"}
                  </p>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {formatChatModerationReason(row.source, row.reason_code)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusBadgeClass(row.status)}`}
                    >
                      {CHAT_MODERATION_STATUS_LABELS[row.status]}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {row.message_count} msgs
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {row.last_message_at
                        ? new Date(row.last_message_at).toLocaleString()
                        : new Date(row.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className={ADMIN_TABLE_HEAD}>
                  <th className={`${ADMIN_TABLE_TH} min-w-[150px]`}>Worker</th>
                  <th className={`${ADMIN_TABLE_TH} min-w-[130px]`}>Company</th>
                  <th className={`${ADMIN_TABLE_TH} min-w-[160px]`}>Job context</th>
                  <th className={`${ADMIN_TABLE_TH} min-w-[200px]`}>Reason</th>
                  <th className={`${ADMIN_TABLE_TH} min-w-[70px]`}>Msgs</th>
                  <th className={`${ADMIN_TABLE_TH} min-w-[130px]`}>Activity</th>
                  <th className={`${ADMIN_TABLE_TH} min-w-[60px] text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pageRows.map((row) => (
                  <tr key={row.flag_id} className={ADMIN_TABLE_ROW}>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                        <span className="truncate min-w-0 font-medium text-slate-900">
                          {row.worker_name ?? "—"}
                        </span>
                        <VerifiedBadge
                          show={row.worker_is_verified}
                          size="sm"
                        />
                      </span>
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <span className="block truncate text-slate-600 min-w-0">
                        {row.company_name ?? "—"}
                      </span>
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <span className="block truncate text-slate-600 min-w-0">
                        {row.job_title ?? "—"}
                      </span>
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {formatChatModerationReason(
                            row.source,
                            row.reason_code
                          )}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusBadgeClass(row.status)}`}
                        >
                          {CHAT_MODERATION_STATUS_LABELS[row.status]}
                        </span>
                      </div>
                    </td>
                    <td className={`${ADMIN_TABLE_TD} font-mono text-xs text-slate-600`}>
                      {row.message_count}
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-xs text-slate-500 whitespace-nowrap`}>
                      {row.last_message_at
                        ? new Date(row.last_message_at).toLocaleString()
                        : new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-right overflow-visible`}>
                      <div className="flex justify-end">{rowActions(row)}</div>
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
      )}
    </section>
  );
}
