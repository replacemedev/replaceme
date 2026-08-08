"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, ScrollText, UserRound } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  extractAuditDiff,
  formatAuditAction,
} from "@/lib/admin/audit-target";
import { logAdminAction } from "@/actions/admin-actions";
import type { AdminAuditLogRow } from "@/types/admin.types";

interface AuditLogClientProps {
  logs: AdminAuditLogRow[];
  actionTypes: string[];
}

const FILTER_SELECT =
  "h-10 w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 min-w-0";

const ITEMS_PER_PAGE = 20;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(logs: AdminAuditLogRow[]) {
  const header = [
    "timestamp",
    "actor_name",
    "actor_email",
    "actor_type",
    "action",
    "target_type",
    "target_id",
    "target_label",
    "ip_address",
    "metadata",
  ];
  const lines = [
    header.join(","),
    ...logs.map((log) =>
      [
        log.created_at,
        log.actor_display_name ?? "",
        log.actor_email ?? "",
        log.actor_type,
        log.action_type,
        log.target_type ?? "",
        log.target_id ?? "",
        log.target_label ?? "",
        log.ip_address ?? "",
        JSON.stringify(log.metadata ?? {}),
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ActorCell({ log }: { log: AdminAuditLogRow }) {
  const name =
    log.actor_display_name ??
    (log.actor_type === "system"
      ? "System"
      : log.actor_type === "worker"
        ? "Worker"
        : "Unknown admin");
  const email = log.actor_email;

  return (
    <div className="flex items-center gap-2.5 min-w-0 max-w-[220px]">
      <div className="relative shrink-0">
        {log.actor_avatar_url ? (
          <AvatarImage
            src={log.actor_avatar_url}
            alt=""
            initials={name.slice(0, 2)}
            size="xs"
            containerClassName="bg-slate-100 ring-1 ring-slate-200/80"
          />
        ) : (
          <span className="flex size-8 min-h-8 min-w-8 shrink-0 aspect-square items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200/80">
            <UserRound className="h-3.5 w-3.5" aria-hidden />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-800">{name}</p>
        {email ? (
          <p className="truncate text-[11px] text-slate-400">{email}</p>
        ) : (
          <p className="truncate text-[11px] capitalize text-slate-400">
            {log.actor_type}
          </p>
        )}
      </div>
    </div>
  );
}

function TargetCell({ log }: { log: AdminAuditLogRow }) {
  const label = log.target_label ?? "—";
  if (log.target_href) {
    return (
      <Link
        href={log.target_href}
        onClick={(e) => e.stopPropagation()}
        className="block min-w-0 max-w-[200px] text-left text-xs font-medium text-[#006e2f] hover:underline"
      >
        <span className="truncate block">{label}</span>
      </Link>
    );
  }
  return (
    <span className="block min-w-0 max-w-[200px] truncate text-xs text-slate-500">
      {label}
    </span>
  );
}

function JsonBlock({ value, tone }: { value: unknown; tone: "before" | "after" | "neutral" }) {
  const border =
    tone === "before"
      ? "border-rose-100 bg-rose-50/40"
      : tone === "after"
        ? "border-emerald-100 bg-emerald-50/40"
        : "border-slate-100 bg-slate-50/60";
  return (
    <pre
      className={`overflow-x-auto rounded-xl border p-3 text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap break-all min-w-0 ${border}`}
    >
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function AuditLogClient({ logs, actionTypes }: AuditLogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const action = searchParams.get("action") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const [searchDraft, setSearchDraft] = useState(q);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  useEffect(() => {
    setCurrentPage(1);
  }, [q, action, from, to, logs.length]);

  function pushParams(patch: Record<string, string>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all") next.delete(key);
      else next.set(key, value);
    }
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (searchDraft !== q) pushParams({ q: searchDraft });
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce search only
  }, [searchDraft]);

  const selected = useMemo(
    () => logs.find((l) => l.id === selectedId) ?? null,
    [logs, selectedId]
  );

  const diff = useMemo(
    () => extractAuditDiff(selected?.metadata ?? null),
    [selected]
  );

  const totalItems = logs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const pageLogs = logs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  async function handleExport() {
    downloadCsv(logs);
    try {
      await logAdminAction("export_audit_logs", "audit_logs", undefined, {
        row_count: logs.length,
        filters: { q, action, from, to },
      });
    } catch {
      // Export already downloaded; audit write is best-effort.
    }
  }

  return (
    <section className={`space-y-4 min-w-0 ${isPending ? "opacity-70" : ""}`}>
      <AdminFilterBar
        searchValue={searchDraft}
        onSearchChange={setSearchDraft}
        searchPlaceholder="Search actor, action, target, IP…"
      >
        <select
          value={action}
          onChange={(e) => pushParams({ action: e.target.value })}
          className={FILTER_SELECT}
          aria-label="Filter by action"
        >
          <option value="all">All actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>
              {formatAuditAction(a)}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto">
          <input
            type="date"
            value={from}
            onChange={(e) => pushParams({ from: e.target.value })}
            className={`${FILTER_SELECT} min-w-0`}
            aria-label="From date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => pushParams({ to: e.target.value })}
            className={`${FILTER_SELECT} min-w-0`}
            aria-label="To date"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleExport()}
          disabled={logs.length === 0}
          className="h-10 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </AdminFilterBar>

      <div className="flex items-center justify-between gap-3 min-w-0">
        <AdminSectionLabel>Event log</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f] shrink-0">
          {logs.length} entries
        </span>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-5 w-5" aria-hidden />}
          title="No audit entries"
          description="Try adjusting search or date filters. Privileged admin actions appear here."
        />
      ) : (
        <>
          <AdminDataTable
            mobileCards={pageLogs.map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => setSelectedId(log.id)}
                className="block w-full text-left min-w-0"
              >
                <AdminMobileCard>
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <ActorCell log={log} />
                    <time className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatAuditAction(log.action_type)}
                  </p>
                  <TargetCell log={log} />
                  {log.ip_address ? (
                    <p className="font-mono text-[10px] text-slate-400 truncate min-w-0">
                      {log.ip_address}
                    </p>
                  ) : null}
                </AdminMobileCard>
              </button>
            ))}
          >
            <table className="w-full text-sm">
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
                {pageLogs.map((log) => (
                  <tr
                    key={log.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => setSelectedId(log.id)}
                  >
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
                    <td className={ADMIN_TABLE_TD}>
                      <TargetCell log={log} />
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
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <AdminDrawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={
          selected
            ? formatAuditAction(selected.action_type)
            : "Audit detail"
        }
        description={
          selected
            ? new Date(selected.created_at).toLocaleString()
            : undefined
        }
        size="wide"
      >
        {selected ? (
          <div className="space-y-5 min-w-0 overflow-x-hidden">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 min-w-0">
              <ActorCell log={selected} />
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs min-w-0">
                <div className="min-w-0">
                  <dt className="text-slate-400 font-semibold uppercase tracking-wide">
                    Target
                  </dt>
                  <dd className="mt-1 text-slate-800 min-w-0">
                    <TargetCell log={selected} />
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-slate-400 font-semibold uppercase tracking-wide">
                    IP address
                  </dt>
                  <dd className="mt-1 font-mono text-slate-700 truncate">
                    {selected.ip_address ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {diff.before != null || diff.after != null ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-rose-600">
                    Previous
                  </p>
                  <JsonBlock value={diff.before ?? {}} tone="before" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                    New
                  </p>
                  <JsonBlock value={diff.after ?? {}} tone="after" />
                </div>
              </div>
            ) : null}

            <div className="min-w-0 space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {diff.before != null || diff.after != null
                  ? "Additional metadata"
                  : "Payload"}
              </p>
              <JsonBlock
                value={
                  Object.keys(diff.rest).length > 0
                    ? diff.rest
                    : (selected.metadata ?? {})
                }
                tone="neutral"
              />
            </div>
          </div>
        ) : null}
      </AdminDrawer>
    </section>
  );
}
