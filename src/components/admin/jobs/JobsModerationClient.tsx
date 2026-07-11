"use client";

import { useMemo, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Briefcase, Check, Trash2, X, Eye, Search } from "lucide-react";
import { toast } from "sonner";
import {
  approveJobPost,
  deleteJobPost,
  rejectJobPost,
} from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminJobRow } from "@/types/admin.types";
import { AdminSlideover } from "@/components/admin/shared/AdminSlideover";
import { getAdminJobDeepDive, type AdminJobDeepDive } from "@/actions/admin/deep-dive";
import { formatMoney } from "@/lib/format/currency";
import {
  AdminDataTable,
  AdminMobileCard,
} from "@/components/admin/shared/AdminDataTable";

const PLAN_LABELS: Record<string, string> = {
  discovery: "Discovery",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

function PlanTierBadge({ planSlug, requiresManualApproval }: {
  planSlug: string | null;
  requiresManualApproval: boolean;
}) {
  const slug = planSlug ?? "discovery";
  const label = PLAN_LABELS[slug] ?? slug;

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600 whitespace-nowrap">
        {label}
      </span>
      {requiresManualApproval ? (
        <span className="text-xs font-medium text-amber-700 whitespace-nowrap">
          2-day approval queue
        </span>
      ) : (
        <span className="text-xs font-medium text-emerald-700 whitespace-nowrap">
          Instant publish
        </span>
      )}
    </div>
  );
}

interface JobsModerationClientProps {
  jobs: AdminJobRow[];
  initialFilter?: string;
}

export function JobsModerationClient({
  jobs,
}: JobsModerationClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSearch = searchParams.get("search") ?? "";
  const activeStatus = searchParams.get("status") ?? "Pending Review";
  const activePlan = searchParams.get("plan") ?? "all";
  const activeEmploymentType = searchParams.get("employment_type") ?? "all";
  const currentPage = Number(searchParams.get("page") ?? "1");

  const [searchTerm, setSearchTerm] = useState(activeSearch);
  const [prevActiveSearch, setPrevActiveSearch] = useState(activeSearch);

  if (activeSearch !== prevActiveSearch) {
    setSearchTerm(activeSearch);
    setPrevActiveSearch(activeSearch);
  }

  const [pending, startTransition] = useTransition();
  const [rejectTarget, setRejectTarget] = useState<AdminJobRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminJobRow | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminJobRow | null>(null);
  const [viewData, setViewData] = useState<AdminJobDeepDive | null>(null);
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

  const handlePlanChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("plan", val);
    } else {
      params.delete("plan");
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleEmploymentTypeChange = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== "all") {
      params.set("employment_type", val);
    } else {
      params.delete("employment_type");
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
    let list = jobs;

    // 1. Search Query filtering (multi-field)
    if (activeSearch) {
      const q = activeSearch.toLowerCase().trim();
      list = list.filter((j) => {
        return (
          j.title.toLowerCase().includes(q) ||
          (j.company_name?.toLowerCase().includes(q) ?? false) ||
          j.id.toLowerCase().includes(q) ||
          j.employer_id.toLowerCase().includes(q)
        );
      });
    }

    // 2. Status filtering
    if (activeStatus !== "all") {
      list = list.filter((j) => j.status === activeStatus);
    }

    // 3. Plan Tier filtering
    if (activePlan !== "all") {
      list = list.filter((j) => j.plan_slug === activePlan);
    }

    // 4. Employment Type filtering
    if (activeEmploymentType !== "all") {
      list = list.filter((j) => j.employment_type === activeEmploymentType);
    }

    return list;
  }, [jobs, activeSearch, activeStatus, activePlan, activeEmploymentType]);

  const handleApprove = (jobId: string) => {
    startTransition(async () => {
      const result = await approveJobPost(jobId);
      if (result.success) toast.success("Job approved and published");
      else toast.error(result.error);
      if (result.success) router.refresh();
    });
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    startTransition(async () => {
      const result = await rejectJobPost(
        rejectTarget.id,
        reason || "Did not meet posting guidelines"
      );
      if (result.success) {
        toast.success("Job rejected");
        setRejectTarget(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteJobPost(
        deleteTarget.id,
        reason || "Removed by admin"
      );
      if (result.success) {
        toast.success("Job deleted");
        setDeleteTarget(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };



  const isFilterActive =
    activeSearch !== "" ||
    activeStatus !== "Pending Review" ||
    activePlan !== "all" ||
    activeEmploymentType !== "all";

  const handleClearFilters = () => {
    setSearchTerm("");
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    params.set("status", "Pending Review");
    params.delete("plan");
    params.delete("employment_type");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const itemsPerPage = 20;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedJobs = useMemo(() => {
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, startIndex, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Search & Multi-faceted Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search job title, company, or ID..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-800 placeholder-slate-400 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex-1 md:flex-initial min-w-[140px]">
            <select
              value={activeStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Plan Tier Filter */}
          <div className="flex-1 md:flex-initial min-w-[140px]">
            <select
              value={activePlan}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Plans</option>
              <option value="discovery">Discovery</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="scale">Scale</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div className="flex-1 md:flex-initial min-w-[150px]">
            <select
              value={activeEmploymentType}
              onChange={(e) => handleEmploymentTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

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
          icon={<Briefcase className="h-5 w-5 text-slate-400" aria-hidden />}
          title={activeSearch ? "No matching jobs" : "No jobs in this queue"}
          description={
            activeSearch
              ? "Try adjusting your filters or search term."
              : "Job posts matching this filter will appear here."
          }
        />
      ) : (
        <div className="space-y-4">
          <AdminDataTable
            mobileCards={paginatedJobs.map((job) => (
              <AdminMobileCard
                key={job.id}
                actions={
                  <>
                    <ActionBtn
                      label="View"
                      icon={Eye}
                      className="text-slate-700 hover:bg-slate-100"
                      disabled={pending}
                      onClick={() => {
                        setViewTarget(job);
                        setViewData(null);
                        startTransition(async () => {
                          const full = await getAdminJobDeepDive(job.id);
                          if (!full) {
                            toast.error("Failed to load job details");
                            return;
                          }
                          setViewData(full);
                        });
                      }}
                    />
                    {job.status === "Pending Review" ? (
                      <>
                        <ActionBtn
                          label="Approve"
                          icon={Check}
                          className="text-[#006e2f] hover:bg-[#ebfdf2]"
                          disabled={pending}
                          onClick={() => handleApprove(job.id)}
                        />
                        <ActionBtn
                          label="Reject"
                          icon={X}
                          className="text-amber-700 hover:bg-amber-50"
                          disabled={pending}
                          onClick={() => setRejectTarget(job)}
                        />
                      </>
                    ) : null}
                    <ActionBtn
                      label="Delete"
                      icon={Trash2}
                      className="text-red-600 hover:bg-red-50"
                      disabled={pending}
                      onClick={() => setDeleteTarget(job)}
                    />
                  </>
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="font-bold text-slate-900 hover:text-[#006e2f] hover:underline block"
                  >
                    {job.title}
                  </Link>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs text-slate-500">{job.company_name ?? "—"}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>{job.employment_type}</span>
                  <span>{formatMoney(job.monthly_salary, job.salary_currency ?? "PHP")}/mo</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-[10px] text-slate-400">
                  <PlanTierBadge
                    planSlug={job.plan_slug}
                    requiresManualApproval={job.requires_manual_approval}
                  />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Employer</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="block font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-slate-400">
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <PlanTierBadge
                          planSlug={job.plan_slug}
                          requiresManualApproval={job.requires_manual_approval}
                        />
                        {job.submitted_for_review_at ? (
                          <p className="mt-1 text-[10px] text-slate-400 whitespace-nowrap">
                            Submitted{" "}
                            {new Date(job.submitted_for_review_at).toLocaleDateString()}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.employment_type}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                      {formatMoney(job.monthly_salary, job.salary_currency ?? "PHP")}/mo
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-start">
                        <StatusBadge status={job.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <ActionBtn
                          label="View"
                          icon={Eye}
                          className="text-slate-700 hover:bg-slate-100"
                          disabled={pending}
                          onClick={() => {
                            setViewTarget(job);
                            setViewData(null);
                            startTransition(async () => {
                              const full = await getAdminJobDeepDive(job.id);
                              if (!full) {
                                toast.error("Failed to load job details");
                                return;
                              }
                              setViewData(full);
                            });
                          }}
                        />
                        {job.status === "Pending Review" ? (
                          <>
                            <ActionBtn
                              label="Approve"
                              icon={Check}
                              className="text-[#006e2f] hover:bg-[#ebfdf2]"
                              disabled={pending}
                              onClick={() => handleApprove(job.id)}
                            />
                            <ActionBtn
                              label="Reject"
                              icon={X}
                              className="text-amber-700 hover:bg-amber-50"
                              disabled={pending}
                              onClick={() => setRejectTarget(job)}
                            />
                          </>
                        ) : null}
                        <ActionBtn
                          label="Delete"
                          icon={Trash2}
                          className="text-red-600 hover:bg-red-50"
                          disabled={pending}
                          onClick={() => setDeleteTarget(job)}
                        />
                      </div>
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
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmDialog
        open={rejectTarget !== null}
        title="Reject job post?"
        description={`"${rejectTarget?.title}" will be closed and hidden from workers.`}
        confirmLabel="Reject"
        variant="danger"
        loading={pending}
        onCancel={() => {
          setRejectTarget(null);
          setReason("");
        }}
        onConfirm={handleReject}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete job post?"
        description={`Permanently remove "${deleteTarget?.title}". This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={pending}
        onCancel={() => {
          setDeleteTarget(null);
          setReason("");
        }}
        onConfirm={handleDelete}
      />

      {(rejectTarget || deleteTarget) && (
        <label className="block max-w-md">
          <span className="text-xs font-medium text-slate-600">
            Reason (audit log)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      )}

      <AdminSlideover
        open={viewTarget !== null}
        onClose={() => {
          setViewTarget(null);
          setViewData(null);
        }}
        title={viewTarget?.title ?? "Job post"}
        description={viewData ? `${viewData.employmentType} • ${formatMoney(viewData.monthlySalary, viewData.salaryCurrency)}/mo` : "Loading…"}
      >
        {!viewData ? (
          <p className="text-sm font-medium text-slate-500">Loading details…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Employer
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {viewData.companyName ?? "—"}
                </p>
                <p className="mt-1 text-xs font-mono text-slate-500">
                  {viewData.employerId}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <div className="mt-1">
                  <StatusBadge status={viewData.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Posted {new Date(viewData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                {viewData.description}
              </pre>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Responsibilities
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {viewData.parsedSections.responsibilities.length > 0 ? (
                    viewData.parsedSections.responsibilities.map((i) => (
                      <li key={i} className="leading-relaxed">
                        - {i}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">—</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Requirements
                </p>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {viewData.parsedSections.requirements.length > 0 ? (
                    viewData.parsedSections.requirements.map((i) => (
                      <li key={i} className="leading-relaxed">
                        - {i}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">—</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </AdminSlideover>
    </div>
  );
}

function ActionBtn({
  label,
  icon: Icon,
  className,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold disabled:opacity-50 ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  );
}
