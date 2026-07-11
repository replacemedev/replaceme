"use client";

import { useMemo, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserX, UserCheck, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";
import {
  AdminDataTable,
  AdminMobileCard,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
} from "@/components/admin/shared/AdminDataTable";
import { suspendUser, unsuspendUser } from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { TablePagination } from "@/components/shared/TablePagination";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type {
  AdminAdminRow,
  AdminEmployerRow,
  AdminUserTab,
  AdminWorkerRow,
} from "@/types/admin.types";
import { formatFullName } from "@/lib/format/name";

interface UsersClientProps {
  tab: AdminUserTab;
  workers: AdminWorkerRow[];
  employers: AdminEmployerRow[];
  admins: AdminAdminRow[];
}

function displayName(
  first: string | null | undefined,
  middle: string | null | undefined,
  last: string | null | undefined,
  fallback: string
): string {
  const name = formatFullName(first, middle, last).trim();
  return name || fallback;
}

const TAB_LABELS: Record<AdminUserTab, string> = {
  workers: "workers",
  employers: "employers",
  admins: "admins",
};

export function UsersClient({
  tab,
  workers,
  employers,
  admins,
}: UsersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") ?? "";
  const activeStatus = searchParams.get("status") ?? "all";
  const activeVerification = searchParams.get("verification") ?? "all";
  const currentPage = Number(searchParams.get("page") ?? "1");

  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [prevActiveSearch, setPrevActiveSearch] = useState(activeSearch);

  if (activeSearch !== prevActiveSearch) {
    setSearchTerm(activeSearch);
    setPrevActiveSearch(activeSearch);
  }

  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{
    userId: string;
    action: "suspend" | "unsuspend";
    label: string;
  } | null>(null);
  const [reason, setReason] = useState("");

  // Debounced search logic to sync input search query to URL query parameters
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentSearch = new URLSearchParams(window.location.search).get("search") ?? "";
      if (currentSearch === searchTerm) return;

      const params = new URLSearchParams(window.location.search);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.delete("page"); // Reset page when search query changes
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router]);

  const handleStatusChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("status", val);
    } else {
      params.delete("status");
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleVerificationChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("verification", val);
    } else {
      params.delete("verification");
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = activeSearch.toLowerCase().trim();
    let list: (AdminWorkerRow | AdminEmployerRow | AdminAdminRow)[] = [];
    if (tab === "workers") {
      list = workers;
    } else if (tab === "employers") {
      list = employers;
    } else {
      list = admins;
    }

    // 1. Search Query filtering (multi-field)
    if (q) {
      list = list.filter((row) => {
        if (tab === "workers") {
          const w = row as AdminWorkerRow;
          const name = displayName(w.first_name, w.middle_name, w.last_name, "");
          return (
            name.toLowerCase().includes(q) ||
            (w.email?.toLowerCase().includes(q) ?? false) ||
            (w.professional_title?.toLowerCase().includes(q) ?? false) ||
            w.id.toLowerCase().includes(q)
          );
        } else if (tab === "employers") {
          const e = row as AdminEmployerRow;
          return (
            e.company_name.toLowerCase().includes(q) ||
            (e.email?.toLowerCase().includes(q) ?? false) ||
            (e.industry?.toLowerCase().includes(q) ?? false) ||
            e.employer_id.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q)
          );
        } else {
          const a = row as AdminAdminRow;
          const name = displayName(a.first_name, a.middle_name, a.last_name, "");
          return (
            name.toLowerCase().includes(q) ||
            (a.email?.toLowerCase().includes(q) ?? false) ||
            a.id.toLowerCase().includes(q)
          );
        }
      });
    }

    // 2. Status filtering
    if (activeStatus !== "all") {
      list = list.filter((row) => row.account_status === activeStatus);
    }

    // 3. Verification filtering (only for Workers)
    if (tab === "workers" && activeVerification !== "all") {
      list = list.filter(
        (row) => (row as AdminWorkerRow).verification_status === activeVerification
      );
    }

    return list;
  }, [
    tab,
    activeSearch,
    activeStatus,
    activeVerification,
    workers,
    employers,
    admins,
  ]);

  const itemsPerPage = 20;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedFiltered = useMemo(() => {
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, startIndex, itemsPerPage]);

  const handleConfirm = () => {
    if (!confirm) return;
    startTransition(async () => {
      const result =
        confirm.action === "suspend"
          ? await suspendUser(confirm.userId, reason || "Policy violation")
          : await unsuspendUser(confirm.userId);

      if (result.success) {
        toast.success(
          confirm.action === "suspend" ? "User suspended" : "User reactivated"
        );
        setConfirm(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const isFilterActive =
    activeSearch !== "" ||
    activeStatus !== "all" ||
    activeVerification !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.delete("status");
    params.delete("verification");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4">
      {/* URL-driven Search & Multi-faceted Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              tab === "employers"
                ? "Search by company, email, industry, or ID…"
                : tab === "admins"
                  ? "Search by admin name, email, or ID…"
                  : "Search by name, email, title, or ID…"
            }
            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-800 placeholder-slate-400 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Account Status Filter */}
          <div className="flex-1 md:flex-initial min-w-[140px]">
            <select
              value={activeStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Verification Status Filter (only for Workers) */}
          {tab === "workers" && (
            <div className="flex-1 md:flex-initial min-w-[160px]">
              <select
                value={activeVerification}
                onChange={(e) => handleVerificationChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
              >
                <option value="all">All Verifications</option>
                <option value="unverified">Unverified</option>
                <option value="personal_complete">Personal Complete</option>
                <option value="documents_submitted">Documents Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}

          {/* Clear Filters Button */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={
            tab === "admins" ? (
              <ShieldCheck className="h-5 w-5 text-slate-400" aria-hidden />
            ) : (
              <Search className="h-5 w-5 text-slate-400" aria-hidden />
            )
          }
          title={activeSearch ? "No matches" : `No ${TAB_LABELS[tab]} yet`}
          description={
            activeSearch
              ? "Try a different search term or adjusting filters."
              : `Registered ${TAB_LABELS[tab]} will appear here.`
          }
        />
      ) : (
        <>
          <AdminDataTable
            mobileCards={paginatedFiltered.map((row) => {
              if (tab === "workers") {
                const worker = row as AdminWorkerRow;
                const name = displayName(
                  worker.first_name,
                  worker.middle_name,
                  worker.last_name,
                  "Unnamed"
                );
                return (
                  <AdminMobileCard
                    key={worker.id}
                    actions={
                      <UserActionButton
                        status={worker.account_status}
                        onSuspend={() =>
                          setConfirm({
                            userId: worker.id,
                            action: "suspend",
                            label: name,
                          })
                        }
                        onUnsuspend={() =>
                          setConfirm({
                            userId: worker.id,
                            action: "unsuspend",
                            label: name,
                          })
                        }
                      />
                    }
                  >
                    <p className="font-semibold text-slate-900">
                      <Link
                        href={`/admin/users/workers/${worker.id}`}
                        className="hover:text-emerald-700 hover:underline"
                      >
                        {name}
                      </Link>
                    </p>
                    <p className="text-xs text-slate-500">{worker.email}</p>
                    <p className="text-sm text-slate-600">
                      {worker.professional_title ?? "—"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={worker.verification_status} />
                      <StatusBadge status={worker.account_status} />
                    </div>
                    <p className="text-xs text-slate-400">
                      Joined {formatDate(worker.created_at)}
                    </p>
                  </AdminMobileCard>
                );
              }
              if (tab === "employers") {
                const employer = row as AdminEmployerRow;
                return (
                  <AdminMobileCard
                    key={employer.id}
                    actions={
                      <UserActionButton
                        status={employer.account_status}
                        onSuspend={() =>
                          setConfirm({
                            userId: employer.employer_id,
                            action: "suspend",
                            label: employer.company_name,
                          })
                        }
                        onUnsuspend={() =>
                          setConfirm({
                            userId: employer.employer_id,
                            action: "unsuspend",
                            label: employer.company_name,
                          })
                        }
                      />
                    }
                  >
                    <p className="font-semibold text-slate-900">
                      <Link
                        href={`/admin/users/employers/${employer.employer_id}`}
                        className="hover:text-emerald-700 hover:underline"
                      >
                        {employer.company_name}
                      </Link>
                    </p>
                    <p className="text-xs text-slate-500">{employer.email}</p>
                    <p className="text-sm text-slate-600">
                      {employer.industry ?? "—"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge
                        status={employer.subscription_status ?? "inactive"}
                      />
                      <StatusBadge status={employer.account_status} />
                    </div>
                  </AdminMobileCard>
                );
              }
              const admin = row as AdminAdminRow;
              const name = displayName(admin.first_name, admin.middle_name, admin.last_name, "Unnamed");
              return (
                <AdminMobileCard
                  key={admin.id}
                  actions={
                    <UserActionButton
                      status={admin.account_status}
                      onSuspend={() =>
                        setConfirm({
                          userId: admin.id,
                          action: "suspend",
                          label: name,
                        })
                      }
                      onUnsuspend={() =>
                        setConfirm({
                          userId: admin.id,
                          action: "unsuspend",
                          label: name,
                        })
                      }
                    />
                  }
                >
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{admin.email}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ebfdf2] px-2 py-0.5 text-[11px] font-semibold text-[#006e2f]">
                      <ShieldCheck className="h-3 w-3" aria-hidden />
                      Platform Admin
                    </span>
                    <StatusBadge status={admin.account_status} />
                  </div>
                </AdminMobileCard>
              );
            })}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className={ADMIN_TABLE_TH}>User</th>
                  {tab === "workers" ? (
                    <th className={ADMIN_TABLE_TH}>Title</th>
                  ) : tab === "employers" ? (
                    <th className={ADMIN_TABLE_TH}>Industry</th>
                  ) : (
                    <th className={ADMIN_TABLE_TH}>Role</th>
                  )}
                  {tab === "workers" ? (
                    <th className={ADMIN_TABLE_TH}>Verification</th>
                  ) : tab === "employers" ? (
                    <th className={ADMIN_TABLE_TH}>Plan</th>
                  ) : null}
                  <th className={ADMIN_TABLE_TH}>Status</th>
                  <th className={ADMIN_TABLE_TH}>Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tab === "workers"
                  ? (paginatedFiltered as AdminWorkerRow[]).map((worker) => {
                      const name = displayName(
                        worker.first_name,
                        worker.middle_name,
                        worker.last_name,
                        "Unnamed"
                      );
                      return (
                        <tr key={worker.id} className={ADMIN_TABLE_ROW}>
                          <td className={ADMIN_TABLE_TD}>
                            <p className="font-semibold text-slate-900">
                              <Link
                                href={`/admin/users/workers/${worker.id}`}
                                className="hover:text-emerald-700 hover:underline"
                              >
                                {name}
                              </Link>
                            </p>
                            <p className="text-xs text-slate-400">
                              {worker.email}
                            </p>
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            {worker.professional_title ?? "—"}
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            <StatusBadge status={worker.verification_status} />
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            <StatusBadge status={worker.account_status} />
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {formatDate(worker.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <UserActionButton
                              status={worker.account_status}
                              onSuspend={() =>
                                setConfirm({
                                  userId: worker.id,
                                  action: "suspend",
                                  label: name,
                                })
                              }
                              onUnsuspend={() =>
                                setConfirm({
                                  userId: worker.id,
                                  action: "unsuspend",
                                  label: name,
                                })
                              }
                            />
                          </td>
                        </tr>
                      );
                    })
                  : tab === "employers"
                    ? (paginatedFiltered as AdminEmployerRow[]).map((employer) => (
                        <tr key={employer.id} className={ADMIN_TABLE_ROW}>
                          <td className={ADMIN_TABLE_TD}>
                            <p className="font-semibold text-slate-900">
                              <Link
                                href={`/admin/users/employers/${employer.employer_id}`}
                                className="hover:text-emerald-700 hover:underline"
                              >
                                {employer.company_name}
                              </Link>
                            </p>
                            <p className="text-xs text-slate-400">
                              {employer.email}
                            </p>
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            {employer.industry ?? "—"}
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            <StatusBadge
                              status={employer.subscription_status ?? "inactive"}
                            />
                          </td>
                          <td className={ADMIN_TABLE_TD}>
                            <StatusBadge status={employer.account_status} />
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {formatDate(employer.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <UserActionButton
                              status={employer.account_status}
                              onSuspend={() =>
                                setConfirm({
                                  userId: employer.employer_id,
                                  action: "suspend",
                                  label: employer.company_name,
                                })
                              }
                              onUnsuspend={() =>
                                setConfirm({
                                  userId: employer.employer_id,
                                  action: "unsuspend",
                                  label: employer.company_name,
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))
                    : tab === "admins"
                      ? (paginatedFiltered as AdminAdminRow[]).map((admin) => (
                          <tr key={admin.id} className={ADMIN_TABLE_ROW}>
                            <td className={ADMIN_TABLE_TD}>
                              <p className="font-semibold text-slate-900">
                                {displayName(
                                  admin.first_name,
                                  admin.middle_name,
                                  admin.last_name,
                                  "Unnamed"
                                )}
                              </p>
                              <p className="text-xs text-slate-400">
                                {admin.email}
                              </p>
                            </td>
                            <td className={ADMIN_TABLE_TD}>
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-semibold text-[#006e2f]">
                                <ShieldCheck className="h-3 w-3" aria-hidden />
                                Platform Admin
                              </span>
                            </td>
                            <td className={ADMIN_TABLE_TD}>
                              <StatusBadge status={admin.account_status} />
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {formatDate(admin.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <UserActionButton
                                status={admin.account_status}
                                onSuspend={() =>
                                  setConfirm({
                                    userId: admin.id,
                                    action: "suspend",
                                    label: displayName(
                                      admin.first_name,
                                      admin.middle_name,
                                      admin.last_name,
                                      admin.email ?? "admin"
                                    ),
                                  })
                                }
                                onUnsuspend={() =>
                                  setConfirm({
                                    userId: admin.id,
                                    action: "unsuspend",
                                    label: displayName(
                                      admin.first_name,
                                      admin.middle_name,
                                      admin.last_name,
                                      admin.email ?? "admin"
                                    ),
                                  })
                                }
                              />
                            </td>
                          </tr>
                        ))
                      : null}
              </tbody>
            </table>
          </AdminDataTable>

          <TablePagination
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.action === "suspend" ? "Suspend user?" : "Reactivate user?"
        }
        description={
          confirm?.action === "suspend"
            ? `This will ban ${confirm?.label ?? "this user"} from signing in.`
            : `Restore access for ${confirm?.label ?? "this user"}.`
        }
        confirmLabel={confirm?.action === "suspend" ? "Suspend" : "Reactivate"}
        variant={confirm?.action === "suspend" ? "danger" : "default"}
        loading={pending}
        onCancel={() => {
          setConfirm(null);
          setReason("");
        }}
        onConfirm={handleConfirm}
      />

      {confirm?.action === "suspend" ? (
        <label className="block max-w-md">
          <span className="text-xs font-medium text-slate-600">
            Reason (logged to audit trail)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Policy violation, fraud report, etc."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      ) : null}
    </div>
  );
}

function UserActionButton({
  status,
  onSuspend,
  onUnsuspend,
}: {
  status: string;
  onSuspend: () => void;
  onUnsuspend: () => void;
}) {
  if (status === "suspended") {
    return (
      <button
        type="button"
        onClick={onUnsuspend}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#006e2f] hover:bg-[#ebfdf2]"
      >
        <UserCheck className="h-3.5 w-3.5" aria-hidden />
        Reactivate
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSuspend}
      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      <UserX className="h-3.5 w-3.5" aria-hidden />
      Suspend
    </button>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
