"use client";

import { useMemo, useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Briefcase, Check, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import {
  bulkApproveJobPosts,
  bulkRejectJobPosts,
} from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";
import type { AdminJobRow, JobRejectionCategory } from "@/types/admin.types";
import {
  JOB_REJECTION_CATEGORY_HINTS,
  JOB_REJECTION_CATEGORY_LABELS,
  JOB_REJECTION_CATEGORY_VALUES,
} from "@/types/admin.types";
import { formatMoney } from "@/lib/format/currency";
import {
  AdminDataTable,
  AdminMobileCard,
} from "@/components/admin/shared/AdminDataTable";
import { JobRowActionsMenu } from "@/components/admin/jobs/JobRowActionsMenu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  discoverySlaSortWeight,
  getDiscoverySlaState,
  type DiscoverySlaTone,
} from "@/lib/jobs/moderation-sla";
import { DISCOVERY_JOB_APPROVAL_SLA } from "@/lib/data/legal";

const PLAN_LABELS: Record<string, string> = {
  discovery: "Discovery",
  starter: "Starter",
  growth: "Growth",
  scale: "Scale",
};

const PAGE_SIZE = 20;

const SLA_BADGE_CLASS: Record<DiscoverySlaTone, string> = {
  overdue: "bg-red-50 text-red-800 ring-red-600/20",
  due_soon: "bg-amber-50 text-amber-900 ring-amber-600/20",
  ok: "bg-slate-50 text-slate-600 ring-slate-500/15",
};

function SlaBadge({ tone, label }: { tone: DiscoverySlaTone; label: string }) {
  return (
    <span
      className={`inline-flex max-w-full items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${SLA_BADGE_CLASS[tone]}`}
      title={label}
    >
      {tone === "overdue" ? "Overdue" : tone === "due_soon" ? "Due soon" : "In queue"}
    </span>
  );
}

function PlanStack({
  planSlug,
  requiresManualApproval,
  submittedAt,
  sla,
}: {
  planSlug: string | null;
  requiresManualApproval: boolean;
  submittedAt: string | null;
  sla: ReturnType<typeof getDiscoverySlaState>;
}) {
  const slug = planSlug ?? "discovery";
  const label = PLAN_LABELS[slug] ?? slug;

  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-sm font-medium text-slate-800 whitespace-nowrap">{label}</span>
      <span className="text-xs text-slate-500 whitespace-nowrap">
        {requiresManualApproval ? "2-day approval queue" : "Instant publish"}
      </span>
      {submittedAt ? (
        <span className="text-xs text-slate-400 whitespace-nowrap">
          Submitted {new Date(submittedAt).toLocaleDateString()}
        </span>
      ) : null}
      {sla ? <SlaBadge tone={sla.tone} label={sla.label} /> : null}
    </div>
  );
}

interface JobsModerationClientProps {
  jobs: AdminJobRow[];
  pendingCount: number;
}

export function JobsModerationClient({
  jobs,
  pendingCount,
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkCategory, setBulkCategory] =
    useState<JobRejectionCategory>("tos_violation");
  const [bulkReason, setBulkReason] = useState("");
  const [pending, startTransition] = useTransition();

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

  const pushFilter = (key: string, val: string, clearWhen = "all") => {
    const params = new URLSearchParams(window.location.search);
    if (val && val !== clearWhen) params.set(key, val);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = jobs;

    if (activeSearch) {
      const q = activeSearch.toLowerCase().trim();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.company_name?.toLowerCase().includes(q) ?? false) ||
          j.id.toLowerCase().includes(q) ||
          j.employer_id.toLowerCase().includes(q)
      );
    }

    if (activeStatus !== "all") {
      list = list.filter((j) => j.status === activeStatus);
    }

    if (activePlan !== "all") {
      list = list.filter((j) => j.plan_slug === activePlan);
    }

    if (activeEmploymentType !== "all") {
      list = list.filter((j) => j.employment_type === activeEmploymentType);
    }

    // Discovery queue: overdue first, then due soon, then oldest submission.
    if (activeStatus !== "Pending Review") {
      return list;
    }

    return [...list].sort((a, b) => {
      const slaA = getDiscoverySlaState({
        status: a.status,
        requiresManualApproval: a.requires_manual_approval,
        submittedForReviewAt: a.submitted_for_review_at,
      });
      const slaB = getDiscoverySlaState({
        status: b.status,
        requiresManualApproval: b.requires_manual_approval,
        submittedForReviewAt: b.submitted_for_review_at,
      });
      const weight =
        discoverySlaSortWeight(slaA?.tone ?? null) -
        discoverySlaSortWeight(slaB?.tone ?? null);
      if (weight !== 0) return weight;
      const ta = a.submitted_for_review_at ?? a.created_at;
      const tb = b.submitted_for_review_at ?? b.created_at;
      return new Date(ta).getTime() - new Date(tb).getTime();
    });
  }, [jobs, activeSearch, activeStatus, activePlan, activeEmploymentType]);

  const slaSummary = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    for (const job of jobs) {
      const sla = getDiscoverySlaState({
        status: job.status,
        requiresManualApproval: job.requires_manual_approval,
        submittedForReviewAt: job.submitted_for_review_at,
      });
      if (sla?.tone === "overdue") overdue += 1;
      else if (sla?.tone === "due_soon") dueSoon += 1;
    }
    return { overdue, dueSoon };
  }, [jobs]);

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE);
  const activePage = Math.min(currentPage, totalPages || 1);
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedJobs = useMemo(
    () => filtered.slice(startIndex, startIndex + PAGE_SIZE),
    [filtered, startIndex]
  );

  const pageIds = paginatedJobs.map((j) => j.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedPendingIds = useMemo(() => {
    const byId = new Map(jobs.map((j) => [j.id, j]));
    return [...selectedIds].filter(
      (id) => byId.get(id)?.status === "Pending Review"
    );
  }, [selectedIds, jobs]);

  const handleBulkApprove = () => {
    if (selectedPendingIds.length === 0) {
      toast.error("Select at least one pending job to approve.");
      return;
    }
    startTransition(async () => {
      const result = await bulkApproveJobPosts(selectedPendingIds);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Approved ${result.approved ?? selectedPendingIds.length} job(s)`
      );
      clearSelection();
      router.refresh();
    });
  };

  const handleBulkReject = () => {
    if (selectedPendingIds.length === 0) {
      toast.error("Select at least one pending job to reject.");
      return;
    }
    startTransition(async () => {
      const result = await bulkRejectJobPosts({
        jobIds: selectedPendingIds,
        category: bulkCategory,
        reason: bulkReason.trim() || undefined,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Rejected ${result.rejected ?? selectedPendingIds.length} job(s) — employers notified`
      );
      setBulkRejectOpen(false);
      setBulkReason("");
      setBulkCategory("tos_violation");
      clearSelection();
      router.refresh();
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

  const selectClassName =
    "w-full px-3 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-700 bg-white cursor-pointer";

  return (
    <div className="space-y-4">
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
          <div className="flex-1 md:flex-initial min-w-[140px]">
            <select
              value={activeStatus}
              onChange={(e) => {
                const params = new URLSearchParams(window.location.search);
                params.set("status", e.target.value);
                params.delete("page");
                router.push(`${pathname}?${params.toString()}`, {
                  scroll: false,
                });
              }}
              className={selectClassName}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
              <option value="Deleted">Deleted</option>
              <option value="Closed">Closed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <div className="flex-1 md:flex-initial min-w-[140px]">
            <select
              value={activePlan}
              onChange={(e) => pushFilter("plan", e.target.value)}
              className={selectClassName}
              aria-label="Filter by plan"
            >
              <option value="all">All Plans</option>
              <option value="discovery">Discovery</option>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="scale">Scale</option>
            </select>
          </div>

          <div className="flex-1 md:flex-initial min-w-[150px]">
            <select
              value={activeEmploymentType}
              onChange={(e) => pushFilter("employment_type", e.target.value)}
              className={selectClassName}
              aria-label="Filter by employment type"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {isFilterActive ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {someSelected ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <p className="text-sm font-medium text-slate-800">
            {selectedIds.size} selected
            {selectedPendingIds.length !== selectedIds.size
              ? ` · ${selectedPendingIds.length} pending`
              : null}
            {pendingCount > 0 ? (
              <span className="text-slate-500 font-normal">
                {" "}
                · {pendingCount} awaiting review overall
              </span>
            ) : null}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending || selectedPendingIds.length === 0}
              onClick={handleBulkApprove}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:pointer-events-none disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Check className="h-3.5 w-3.5" aria-hidden />
              )}
              {pending ? "Approving…" : "Bulk Approve"}
            </button>
            <button
              type="button"
              disabled={pending || selectedPendingIds.length === 0}
              onClick={() => setBulkRejectOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-50 disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
              Bulk Reject
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-white/80"
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      {(slaSummary.overdue > 0 || slaSummary.dueSoon > 0) &&
      activeStatus === "Pending Review" ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            slaSummary.overdue > 0
              ? "border-red-200 bg-red-50/70 text-red-950"
              : "border-amber-200 bg-amber-50/70 text-amber-950"
          }`}
          role="status"
        >
          <p className="font-semibold">
            Discovery SLA · {DISCOVERY_JOB_APPROVAL_SLA.targetBusinessDays} business-day review
          </p>
          <p className="mt-1 text-xs sm:text-sm opacity-90 leading-relaxed">
            {slaSummary.overdue > 0
              ? `${slaSummary.overdue} overdue (past ${DISCOVERY_JOB_APPROVAL_SLA.overdueAfterHours}h). `
              : null}
            {slaSummary.dueSoon > 0
              ? `${slaSummary.dueSoon} due soon (past ${DISCOVERY_JOB_APPROVAL_SLA.remindAfterHours}h). `
              : null}
            Paid plans stay instant. Discovery never auto-publishes — clear the queue manually.
          </p>
        </div>
      ) : null}

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
                actionsPlacement="header"
                actions={
                  <JobRowActionsMenu
                    jobId={job.id}
                    title={job.title}
                    status={job.status}
                    rejectionCategory={job.rejection_category}
                    rejectionReason={job.rejection_reason}
                    onMutated={clearSelection}
                  />
                }
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.has(job.id)}
                    onChange={() => toggleOne(job.id)}
                    className="mt-0.5 shrink-0"
                    aria-label={`Select ${job.title}`}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="font-bold text-slate-900 hover:text-emerald-700 hover:underline block"
                      >
                        {job.title}
                      </Link>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                      {job.company_name ? ` · ${job.company_name}` : null}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span>{job.employment_type}</span>
                      <span>
                        {formatMoney(
                          job.monthly_salary,
                          job.salary_currency ?? "PHP"
                        )}
                        /mo
                      </span>
                    </div>
                    <PlanStack
                      planSlug={job.plan_slug}
                      requiresManualApproval={job.requires_manual_approval}
                      submittedAt={job.submitted_for_review_at}
                      sla={getDiscoverySlaState({
                        status: job.status,
                        requiresManualApproval: job.requires_manual_approval,
                        submittedForReviewAt: job.submitted_for_review_at,
                      })}
                    />
                  </div>
                </div>
              </AdminMobileCard>
            ))}
          >
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="w-10 px-4 py-3 shrink-0">
                    <Checkbox
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      className="shrink-0"
                      aria-label="Select all on this page"
                    />
                  </th>
                  <th className="px-4 py-3 min-w-[200px]">Job</th>
                  <th className="px-4 py-3 min-w-[140px] whitespace-nowrap">Employer</th>
                  <th className="px-4 py-3 min-w-[140px] whitespace-nowrap">Plan</th>
                  <th className="px-4 py-3 min-w-[110px] whitespace-nowrap">Type</th>
                  <th className="px-4 py-3 min-w-[120px] whitespace-nowrap">Salary</th>
                  <th className="px-4 py-3 min-w-[130px] whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 min-w-[80px] text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 align-middle shrink-0">
                      <Checkbox
                        checked={selectedIds.has(job.id)}
                        onChange={() => toggleOne(job.id)}
                        className="shrink-0"
                        aria-label={`Select ${job.title}`}
                      />
                    </td>
                    <td className="px-4 py-3 align-middle min-w-[200px]">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="font-medium text-slate-900 hover:text-emerald-700 hover:underline"
                        >
                          {job.title}
                        </Link>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-600 min-w-[140px]">
                      {job.company_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 align-middle min-w-[140px] whitespace-nowrap">
                      <PlanStack
                        planSlug={job.plan_slug}
                        requiresManualApproval={job.requires_manual_approval}
                        submittedAt={job.submitted_for_review_at}
                        sla={getDiscoverySlaState({
                          status: job.status,
                          requiresManualApproval: job.requires_manual_approval,
                          submittedForReviewAt: job.submitted_for_review_at,
                        })}
                      />
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-600 min-w-[110px] whitespace-nowrap">
                      {job.employment_type}
                    </td>
                    <td className="px-4 py-3 align-middle text-slate-600 font-mono text-xs min-w-[120px] whitespace-nowrap">
                      {formatMoney(
                        job.monthly_salary,
                        job.salary_currency ?? "PHP"
                      )}
                      /mo
                    </td>
                    <td className="px-4 py-3 align-middle min-w-[130px] whitespace-nowrap">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-4 py-3 align-middle text-right min-w-[80px] whitespace-nowrap">
                      <JobRowActionsMenu
                        jobId={job.id}
                        title={job.title}
                        status={job.status}
                        rejectionCategory={job.rejection_category}
                        rejectionReason={job.rejection_reason}
                        onMutated={clearSelection}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminDataTable>
          <TablePagination
            currentPage={activePage}
            totalItems={totalItems}
            pageSize={PAGE_SIZE}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ConfirmDialog
        open={bulkRejectOpen}
        title="Bulk reject job posts?"
        description={`${selectedPendingIds.length} pending job(s) will be closed. Each employer receives the same reason category by email and in-app notification.`}
        confirmLabel="Reject all & notify"
        variant="danger"
        loading={pending}
        size="lg"
        onCancel={() => {
          setBulkRejectOpen(false);
          setBulkReason("");
          setBulkCategory("tos_violation");
        }}
        onConfirm={handleBulkReject}
      >
        <div className="space-y-4 text-left">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reason category <span className="text-red-500">*</span>
            </span>
            <select
              value={bulkCategory}
              onChange={(e) =>
                setBulkCategory(e.target.value as JobRejectionCategory)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {JOB_REJECTION_CATEGORY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {JOB_REJECTION_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 leading-relaxed">
              {JOB_REJECTION_CATEGORY_HINTS[bulkCategory]}
            </p>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Additional explanation{" "}
              <span className="font-normal normal-case text-slate-400">
                (optional)
              </span>
            </span>
            <textarea
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              rows={3}
              placeholder="Optional shared note for employers…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </label>
        </div>
      </ConfirmDialog>
    </div>
  );
}
