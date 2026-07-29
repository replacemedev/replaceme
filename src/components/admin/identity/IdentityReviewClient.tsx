"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Clock, Files, Fingerprint, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { AdminTabs } from "@/components/admin/shared/AdminTabs";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_HEAD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
} from "@/components/admin/shared/AdminDataTable";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatFullName } from "@/lib/format/name";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import type { IdentityQueueResult } from "@/types/admin.types";

interface IdentityReviewClientProps {
  queue: IdentityQueueResult;
}

export function IdentityReviewClient({ queue }: IdentityReviewClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") ?? "pending";
  const searchQuery = searchParams.get("search") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const currentPage = Number(searchParams.get("page") ?? "1");

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (searchQuery !== prevSearchQuery) {
    setSearchTerm(searchQuery);
    setPrevSearchQuery(searchQuery);
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

  const handleSortChange = (sortVal: string) => {
    const params = new URLSearchParams(window.location.search);
    if (sortVal && sortVal !== "newest") params.set("sort", sortVal);
    else params.delete("sort");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const tabs = [
    { id: "pending", label: "Pending Review", count: queue.counts.pending },
    { id: "approved", label: "Approved", count: queue.counts.approved },
    { id: "rejected", label: "Rejected", count: queue.counts.rejected },
    { id: "all", label: "All History", count: queue.counts.all },
  ];

  const completeRate =
    queue.counts.pending > 0
      ? Math.round(
          (queue.pendingDocumentCount / (queue.counts.pending * 3)) * 100
        )
      : 100;

  return (
    <div className="space-y-6 min-w-0">
      <AdminTabs tabs={tabs} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search worker name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-800 placeholder-slate-400 bg-white"
            aria-label="Search verification queue"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial min-w-[140px]">
            <label className="sr-only" htmlFor="identity-sort">
              Sort order
            </label>
            <select
              id="identity-sort"
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {(searchQuery !== "" || activeSort !== "newest") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                const params = new URLSearchParams(window.location.search);
                params.delete("search");
                params.delete("sort");
                params.delete("page");
                router.push(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className="px-3.5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {activeTab === "pending" && (
        <section className="space-y-4">
          <AdminSectionLabel>Review queue</AdminSectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <StatCard
              variant="dashboard"
              title="Pending Review"
              value={queue.counts.pending}
              icon={<Clock className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
            />
            <StatCard
              variant="dashboard"
              title="Docs in pending queue"
              value={queue.pendingDocumentCount}
              icon={<Files className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
            />
            <StatCard
              variant="dashboard"
              title="Packet completeness"
              value={`${Math.min(completeRate, 100)}%`}
              icon={<Fingerprint className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-[#ebfdf2]"
              iconColorClass="text-[#006e2f]"
            />
          </div>
        </section>
      )}

      <section className="space-y-4">
        <AdminSectionLabel>
          {activeTab === "pending" ? "Pending submissions" : "Verification history"}
        </AdminSectionLabel>

        {queue.rows.length === 0 ? (
          <EmptyState
            icon={
              <Fingerprint className="h-5 w-5 text-slate-400" aria-hidden />
            }
            title={
              searchQuery
                ? "No results found for your search"
                : activeTab === "pending"
                  ? "Verification queue is clear"
                  : "No history found"
            }
            description={
              searchQuery
                ? "Try clearing your search term or checking different tab views."
                : activeTab === "pending"
                  ? "Workers who submit identity documents will appear here for review."
                  : "No worker KYC verification history found in this category."
            }
          />
        ) : (
          <>
            <AdminDataTable
              mobileCards={queue.rows.map((worker) => {
                const name =
                  formatFullName(
                    worker.first_name,
                    worker.middle_name,
                    worker.last_name,
                    worker.suffix
                  ) ||
                  worker.email ||
                  "Unknown worker";
                return (
                  <AdminMobileCard
                    key={worker.id}
                    actions={
                      <Link
                        href={`/admin/identity/${worker.id}`}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-[#006e2f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#005c26]"
                      >
                        Review
                      </Link>
                    }
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 inline-flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
                          <span className="truncate min-w-0">{name}</span>
                          <VerifiedBadge show={worker.is_verified} size="sm" />
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {worker.email}
                        </p>
                      </div>
                      <StatusBadge status={worker.verification_status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <p className="text-slate-400 font-medium">Submitted</p>
                        <p className="text-slate-700 font-semibold mt-0.5">
                          {new Date(worker.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">Document</p>
                        <p className="text-slate-700 font-semibold mt-0.5 truncate">
                          {worker.id_type?.trim() || "ID + Selfie"}
                        </p>
                      </div>
                      {(activeTab === "approved" ||
                        activeTab === "rejected" ||
                        activeTab === "all") && (
                        <div className="col-span-2">
                          <p className="text-slate-400 font-medium">
                            Reviewed by
                          </p>
                          <p className="text-slate-700 font-semibold mt-0.5">
                            {worker.reviewer_name ?? "—"}
                          </p>
                        </div>
                      )}
                    </div>
                  </AdminMobileCard>
                );
              })}
            >
              <table className="w-full text-sm">
                <thead className={ADMIN_TABLE_HEAD}>
                  <tr>
                    <th className={ADMIN_TABLE_TH}>Worker</th>
                    <th className={ADMIN_TABLE_TH}>Date submitted</th>
                    <th className={ADMIN_TABLE_TH}>Document type</th>
                    <th className={ADMIN_TABLE_TH}>Status</th>
                    {(activeTab === "approved" ||
                      activeTab === "rejected" ||
                      activeTab === "all") && (
                      <th className={ADMIN_TABLE_TH}>Reviewed by</th>
                    )}
                    <th className={`${ADMIN_TABLE_TH} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {queue.rows.map((worker) => {
                    const name =
                      formatFullName(
                    worker.first_name,
                    worker.middle_name,
                    worker.last_name,
                    worker.suffix
                  ) ||
                      worker.email ||
                      "Unknown worker";
                    return (
                      <tr key={worker.id} className={ADMIN_TABLE_ROW}>
                        <td className={ADMIN_TABLE_TD}>
                          <p className="font-semibold text-slate-900 inline-flex items-center gap-1.5 flex-wrap min-w-0 max-w-full">
                            <span className="truncate min-w-0">{name}</span>
                            <VerifiedBadge
                              show={worker.is_verified}
                              size="sm"
                            />
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {worker.email}
                          </p>
                        </td>
                        <td className={`${ADMIN_TABLE_TD} text-xs text-slate-500`}>
                          {new Date(worker.submitted_at).toLocaleDateString()}
                        </td>
                        <td className={`${ADMIN_TABLE_TD} text-xs text-slate-600`}>
                          <span className="font-medium">
                            {worker.id_type?.trim() || "ID + Selfie"}
                          </span>
                          <span className="block text-slate-400 mt-0.5">
                            {worker.document_count}/3 files
                          </span>
                        </td>
                        <td className={ADMIN_TABLE_TD}>
                          <StatusBadge status={worker.verification_status} />
                        </td>
                        {(activeTab === "approved" ||
                          activeTab === "rejected" ||
                          activeTab === "all") && (
                          <td
                            className={`${ADMIN_TABLE_TD} text-xs text-slate-500`}
                          >
                            {worker.reviewer_name ?? "—"}
                          </td>
                        )}
                        <td className={`${ADMIN_TABLE_TD} text-right`}>
                          <Link
                            href={`/admin/identity/${worker.id}`}
                            className="inline-flex items-center rounded-xl bg-[#006e2f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#005c26]"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </AdminDataTable>

            <TablePagination
              currentPage={queue.page}
              totalItems={queue.total}
              pageSize={queue.pageSize}
              onPageChange={handlePageChange}
              label="workers"
            />
          </>
        )}
      </section>
    </div>
  );
}
