"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FileText } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { AdminFilterBar } from "@/components/admin/shared/AdminFilterBar";
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
import { ApplicationRowActionsMenu } from "@/components/admin/applications/ApplicationRowActionsMenu";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
} from "@/types/applications";
import type { AdminApplicationRow } from "@/types/admin.types";

interface ApplicationsClientProps {
  applications: AdminApplicationRow[];
  total: number;
  page: number;
  pageSize: number;
}

const FILTER_SELECT =
  "rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30";

function IdentityStack({
  href,
  name,
  email,
  verified,
}: {
  href?: string;
  name: string;
  email?: string | null;
  verified?: boolean;
}) {
  return (
    <div className="flex min-w-0 max-w-[14rem] flex-col overflow-hidden">
      <div className="flex min-w-0 items-center gap-1.5">
        {href ? (
          <Link
            href={href}
            title={name}
            className="min-w-0 truncate text-sm font-medium text-slate-900 hover:text-emerald-700 hover:underline"
          >
            {name}
          </Link>
        ) : (
          <span
            title={name}
            className="min-w-0 truncate text-sm font-medium text-slate-900"
          >
            {name}
          </span>
        )}
        {verified !== undefined ? (
          <VerifiedBadge show={verified} size="sm" />
        ) : null}
      </div>
      {email ? (
        <a
          href={`mailto:${email}`}
          title={email}
          className="block truncate text-xs text-slate-400 hover:text-emerald-700 hover:underline"
        >
          {email}
        </a>
      ) : null}
    </div>
  );
}

export function ApplicationsClient({
  applications,
  total,
  page,
  pageSize,
}: ApplicationsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") ?? "";
  const activeStatus = searchParams.get("status") ?? "all";
  const activeModeration = searchParams.get("moderation") ?? "all";
  const activeFrom = searchParams.get("from") ?? "";
  const activeTo = searchParams.get("to") ?? "";

  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [prevActiveSearch, setPrevActiveSearch] = useState(activeSearch);

  if (activeSearch !== prevActiveSearch) {
    setSearchTerm(activeSearch);
    setPrevActiveSearch(activeSearch);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentSearch =
        new URLSearchParams(window.location.search).get("search") ?? "";
      if (currentSearch === searchTerm) return;

      const params = new URLSearchParams(window.location.search);
      if (searchTerm) params.set("search", searchTerm);
      else params.delete("search");
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router]);

  const pushParam = (key: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    if (resetPage) params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(window.location.search);
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (total === 0 && !activeSearch && activeStatus === "all" && !activeFrom) {
    return (
      <EmptyState
        icon={<FileText className="h-5 w-5" aria-hidden />}
        title="No applications yet"
        description="Cross-platform job applications will appear here for oversight."
      />
    );
  }

  return (
    <section className="space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSectionLabel>Platform applications</AdminSectionLabel>
        <span className="rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-bold text-[#006e2f]">
          {total} total
        </span>
      </div>

      <AdminFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search worker, email, job, company…"
      >
        <div className="hidden md:flex flex-wrap items-center gap-2 min-w-0">
          <select
            value={activeStatus}
            onChange={(e) => pushParam("status", e.target.value)}
            className={FILTER_SELECT}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={activeModeration}
            onChange={(e) => pushParam("moderation", e.target.value)}
            className={FILTER_SELECT}
            aria-label="Filter by moderation"
          >
            <option value="all">All moderation</option>
            <option value="clear">Clear</option>
            <option value="flagged">Flagged</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            type="date"
            value={activeFrom}
            onChange={(e) => pushParam("from", e.target.value)}
            className={FILTER_SELECT}
            aria-label="Applied from"
          />
          <input
            type="date"
            value={activeTo}
            onChange={(e) => pushParam("to", e.target.value)}
            className={FILTER_SELECT}
            aria-label="Applied to"
          />
        </div>
      </AdminFilterBar>

      <div className="flex md:hidden flex-col gap-2 min-w-0">
        <select
          value={activeStatus}
          onChange={(e) => pushParam("status", e.target.value)}
          className={`${FILTER_SELECT} w-full`}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={activeModeration}
          onChange={(e) => pushParam("moderation", e.target.value)}
          className={`${FILTER_SELECT} w-full`}
          aria-label="Filter by moderation"
        >
          <option value="all">All moderation</option>
          <option value="clear">Clear</option>
          <option value="flagged">Flagged</option>
          <option value="suspended">Suspended</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={activeFrom}
            onChange={(e) => pushParam("from", e.target.value)}
            className={`${FILTER_SELECT} w-full min-w-0`}
            aria-label="Applied from"
          />
          <input
            type="date"
            value={activeTo}
            onChange={(e) => pushParam("to", e.target.value)}
            className={`${FILTER_SELECT} w-full min-w-0`}
            aria-label="Applied to"
          />
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" aria-hidden />}
          title="No matching applications"
          description="Try adjusting search or filters."
        />
      ) : (
        <div className="space-y-4 min-w-0">
          <AdminDataTable
            mobileCards={applications.map((app) => (
              <AdminMobileCard
                key={app.id}
                actionsPlacement="header"
                actions={
                  <ApplicationRowActionsMenu
                    applicationId={app.id}
                    workerLabel={app.worker_name ?? "Worker"}
                    moderationStatus={app.moderation_status}
                  />
                }
              >
                <IdentityStack
                  href={`/admin/users/workers/${app.worker_id}`}
                  name={app.worker_name ?? "—"}
                  email={app.worker_email}
                  verified={app.worker_is_verified}
                />
                <p
                  className="text-sm text-slate-700 truncate min-w-0"
                  title={app.job_title ?? undefined}
                >
                  {app.job_title ?? "—"}
                </p>
                <p
                  className="text-sm text-slate-500 truncate min-w-0"
                  title={app.company_name ?? undefined}
                >
                  {app.company_name ?? "—"}
                </p>
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <StatusBadge status={app.status} />
                  {app.moderation_status !== "clear" ? (
                    <StatusBadge status={app.moderation_status} />
                  ) : null}
                  <span className="text-xs font-mono text-slate-500">
                    {app.match_score}% match
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(app.created_at).toLocaleDateString()}
                </p>
                <Link
                  href={`/admin/applications/${app.id}`}
                  className="inline-flex text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Open details
                </Link>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full min-w-0 table-fixed text-sm">
              <thead>
                <tr className={ADMIN_TABLE_HEAD}>
                  <th className={`${ADMIN_TABLE_TH} w-[22%]`}>Worker</th>
                  <th className={`${ADMIN_TABLE_TH} w-[18%]`}>Job</th>
                  <th className={`${ADMIN_TABLE_TH} w-[16%]`}>Employer</th>
                  <th className={`${ADMIN_TABLE_TH} w-[16%]`}>Status</th>
                  <th className={`${ADMIN_TABLE_TH} w-[10%]`}>Match</th>
                  <th className={`${ADMIN_TABLE_TH} w-[12%]`}>Applied</th>
                  <th className={`${ADMIN_TABLE_TH} w-[6%] text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.map((app) => (
                  <tr key={app.id} className={ADMIN_TABLE_ROW}>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <IdentityStack
                        href={`/admin/users/workers/${app.worker_id}`}
                        name={app.worker_name ?? "—"}
                        email={app.worker_email}
                        verified={app.worker_is_verified}
                      />
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <Link
                        href={`/admin/applications/${app.id}`}
                        title={app.job_title ?? undefined}
                        className="block truncate text-slate-700 hover:text-emerald-700 hover:underline"
                      >
                        {app.job_title ?? "—"}
                      </Link>
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <span
                        title={app.company_name ?? undefined}
                        className="block truncate text-slate-600"
                      >
                        {app.company_name ?? "—"}
                      </span>
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={app.status} />
                        {app.moderation_status !== "clear" ? (
                          <StatusBadge status={app.moderation_status} />
                        ) : null}
                      </div>
                    </td>
                    <td
                      className={`${ADMIN_TABLE_TD} font-mono text-xs text-slate-600 whitespace-nowrap`}
                    >
                      {app.match_score}%
                    </td>
                    <td
                      className={`${ADMIN_TABLE_TD} text-xs text-slate-500 whitespace-nowrap`}
                    >
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-right`}>
                      <div className="inline-flex justify-end">
                        <ApplicationRowActionsMenu
                          applicationId={app.id}
                          workerLabel={app.worker_name ?? "Worker"}
                          moderationStatus={app.moderation_status}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminDataTable>

          <TablePagination
            currentPage={page}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
}
