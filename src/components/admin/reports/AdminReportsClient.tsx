"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { ImageIcon, Paperclip } from "lucide-react";
import { OptimizedImage } from "@/components/shared/media/OptimizedImage";
import { toast } from "sonner";
import {
  getAdminReportById,
  getAdminReports,
  updateReportStatus,
  getAdminJobReports,
  updateJobReportStatus,
  type AdminReportDeepDive,
  type AdminReportRow,
  type AdminJobReportRow,
} from "@/actions/reports";
import {
  REPORT_STATUSES,
  type AdminReportsTab,
} from "@/lib/reporting/constants";
import { AdminFilterPills } from "@/components/admin/shared/AdminFilterPills";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
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
const PLATFORM_STATUSES = ["open", "in_progress", "resolved"] as const;
const JOB_STATUSES = ["PENDING", "REVIEWED", "DISMISSED", "ALL"] as const;
function prettyPlatformStatus(s: string) {
  return s === "in_progress"
    ? "In progress"
    : s.charAt(0).toUpperCase() + s.slice(1);
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StackedCell({
  primary,
  secondary,
}: {
  primary: string;
  secondary?: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="truncate text-sm font-semibold text-slate-900">{primary}</p>
      {secondary ? (
        <p className="truncate text-xs text-slate-500">{secondary}</p>
      ) : null}
    </div>
  );
}

export function AdminReportsClient({
  initial,
}: {
  initial: { items: AdminReportRow[]; total: number };
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "platform";
  const activeTab = (
    ["platform", "jobs"].includes(tabParam) ? tabParam : "platform"
  ) as AdminReportsTab;

  const [pending, startTransition] = useTransition();

  const [platformStatus, setPlatformStatus] =
    useState<(typeof PLATFORM_STATUSES)[number]>("open");
  const [platformQ, setPlatformQ] = useState("");
  const [platformData, setPlatformData] = useState(initial);
  const [platformPage, setPlatformPage] = useState(1);
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(
    null
  );
  const [selectedPlatform, setSelectedPlatform] =
    useState<AdminReportDeepDive | null>(null);

  const [jobStatus, setJobStatus] = useState<
    "PENDING" | "REVIEWED" | "DISMISSED" | "ALL"
  >("PENDING");
  const [jobQ, setJobQ] = useState("");
  const [jobData, setJobData] = useState<{
    items: AdminJobReportRow[];
    total: number;
  }>({ items: [], total: 0 });
  const [jobPage, setJobPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<AdminJobReportRow | null>(
    null
  );


  const [notesDraft, setNotesDraft] = useState("");
  const itemsPerPage = 20;

  const fetchPlatform = (page: number) => {
    startTransition(async () => {
      const next = await getAdminReports({
        status: platformStatus,
        q: platformQ.trim() || undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });
      if (!next) {
        toast.error("Failed to load platform issues");
        return;
      }
      setPlatformData(next);
      setPlatformPage(page);
    });
  };

  const fetchJobs = (page: number) => {
    startTransition(async () => {
      const next = await getAdminJobReports({
        status: jobStatus === "ALL" ? undefined : jobStatus,
        q: jobQ.trim() || undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });
      if (!next) {
        toast.error("Failed to load job reports");
        return;
      }
      setJobData(next);
      setJobPage(page);
    });
  };


  useEffect(() => {
    if (activeTab === "platform") fetchPlatform(1);
    else fetchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, platformStatus, jobStatus]);

  useEffect(() => {
    if (!selectedPlatformId) return;
    startTransition(async () => {
      const full = await getAdminReportById(selectedPlatformId);
      if (!full) {
        toast.error("Failed to load report");
        return;
      }
      setSelectedPlatform(full);
      setNotesDraft(full.adminNotes ?? "");
    });
  }, [selectedPlatformId]);


  const searchPlaceholder =
    activeTab === "platform"
      ? "Search title, URL, description…"
      : "Search reason, description…";

  const handleSearch = () => {
    if (activeTab === "platform") fetchPlatform(1);
    else fetchJobs(1);
  };

  const savePlatformStatus = (next: (typeof REPORT_STATUSES)[number]) => {
    if (!selectedPlatform) return;
    startTransition(async () => {
      const result = await updateReportStatus({
        reportId: selectedPlatform.id,
        status: next,
        adminNotes: notesDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Report updated");
      fetchPlatform(platformPage);
      const full = await getAdminReportById(selectedPlatform.id);
      setSelectedPlatform(full);
    });
  };

  const saveJobStatus = (next: "PENDING" | "REVIEWED" | "DISMISSED") => {
    if (!selectedJob) return;
    startTransition(async () => {
      const result = await updateJobReportStatus({
        reportId: selectedJob.id,
        status: next,
        adminNotes: notesDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Job report updated");
      setSelectedJob(null);
      fetchJobs(jobPage);
    });
  };


  const tabs = [
    { id: "platform", label: "Platform Issues", count: platformData.total },
    { id: "jobs", label: "Job Reports", count: jobData.total },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
        Platform and job listing flags only. Employer→worker reports are retired so workers are not
        surfaced as defendants here. Worker→employer safety cases live in{" "}
        <a href="/admin/disputes" className="font-semibold text-[#006e2f] hover:underline">
          Disputes
        </a>
        . For product issues, employers still use “Report an issue” or{" "}
        <a href="mailto:support@replaceme.ph" className="font-semibold text-[#006e2f] hover:underline">
          support@replaceme.ph
        </a>
        .
      </div>
      <AdminTabs tabs={tabs} />

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          {activeTab === "platform" ? (
            <AdminFilterPills
              options={PLATFORM_STATUSES.map(prettyPlatformStatus)}
              value={prettyPlatformStatus(platformStatus)}
              onChange={(v) => {
                setPlatformStatus(
                  v === "In progress"
                    ? "in_progress"
                    : (v.toLowerCase() as typeof platformStatus)
                );
              }}
            />
          ) : (
            <AdminFilterPills
              options={JOB_STATUSES.map((s) =>
                s === "ALL"
                  ? "All"
                  : s.charAt(0) + s.slice(1).toLowerCase()
              )}
              value={
                jobStatus === "ALL"
                  ? "All"
                  : jobStatus.charAt(0) + jobStatus.slice(1).toLowerCase()
              }
              onChange={(v) => {
                setJobStatus(
                  (v === "All" ? "ALL" : v.toUpperCase()) as typeof jobStatus
                );
              }}
            />
          )}
        </div>

        <div className="flex min-w-0 gap-2">
          <input
            value={activeTab === "platform" ? platformQ : jobQ}
            onChange={(e) => {
              const v = e.target.value;
              if (activeTab === "platform") setPlatformQ(v);
              else setJobQ(v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder={searchPlaceholder}
            className="min-w-0 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 sm:w-[320px]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={pending}
            className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {activeTab === "platform" ? (
        <div className="min-w-0 space-y-4">
          <AdminDataTable
            mobileCards={
              platformData.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
                  No platform issues found.
                </p>
              ) : (
                platformData.items.map((r) => (
                  <AdminMobileCard key={r.id}>
                    <button
                      type="button"
                      className="w-full min-w-0 space-y-2 text-left"
                      onClick={() => setSelectedPlatformId(r.id)}
                    >
                      <StackedCell
                        primary={r.title || r.category.replace(/_/g, " ")}
                        secondary={r.reportedUrl ?? "No URL"}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={prettyPlatformStatus(r.status)} />
                        <span className="text-xs text-slate-400">
                          {formatWhen(r.createdAt)}
                        </span>
                      </div>
                      {r.hasEvidence ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#006e2f]">
                          <Paperclip className="h-3.5 w-3.5" aria-hidden />
                          Evidence attached
                        </span>
                      ) : null}
                    </button>
                  </AdminMobileCard>
                ))
              )
            }
          >
            <table className="w-full min-w-0 table-fixed text-sm">
              <thead>
                <tr className={ADMIN_TABLE_HEAD}>
                  <th className={`${ADMIN_TABLE_TH} w-[40%]`}>Report</th>
                  <th className={`${ADMIN_TABLE_TH} w-[14%]`}>Category</th>
                  <th className={`${ADMIN_TABLE_TH} w-[14%]`}>Status</th>
                  <th className={`${ADMIN_TABLE_TH} w-[14%]`}>Attachment</th>
                  <th className={`${ADMIN_TABLE_TH} w-[18%]`}>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {platformData.items.map((r) => (
                  <tr
                    key={r.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => setSelectedPlatformId(r.id)}
                  >
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <StackedCell
                        primary={r.title || r.category.replace(/_/g, " ")}
                        secondary={r.reportedUrl ?? "—"}
                      />
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-slate-600`}>
                      {r.category.replace(/_/g, " ")}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <StatusBadge status={prettyPlatformStatus(r.status)} />
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      {r.hasEvidence ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006e2f]">
                          <Paperclip className="h-3.5 w-3.5" aria-hidden />
                          View
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-xs text-slate-500`}>
                      {formatWhen(r.createdAt)}
                    </td>
                  </tr>
                ))}
                {platformData.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm italic text-slate-400"
                    >
                      No platform issues found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </AdminDataTable>
          <TablePagination
            currentPage={platformPage}
            totalItems={platformData.total}
            pageSize={itemsPerPage}
            onPageChange={fetchPlatform}
          />
        </div>
      ) : null}

      {activeTab === "jobs" ? (
        <div className="min-w-0 space-y-4">
          <AdminDataTable
            mobileCards={
              jobData.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
                  No job reports found.
                </p>
              ) : (
                jobData.items.map((r) => (
                  <AdminMobileCard key={r.id}>
                    <button
                      type="button"
                      className="w-full min-w-0 space-y-2 text-left"
                      onClick={() => {
                        setSelectedJob(r);
                        setNotesDraft(r.adminNotes ?? "");
                      }}
                    >
                      <StackedCell primary={r.reason} secondary={r.jobTitle} />
                      <StackedCell
                        primary={r.reporterName ?? "Unknown"}
                        secondary={r.reporterEmail}
                      />
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={r.status.toLowerCase()} />
                        <span className="text-xs text-slate-400">
                          {formatWhen(r.createdAt)}
                        </span>
                      </div>
                    </button>
                  </AdminMobileCard>
                ))
              )
            }
          >
            <table className="w-full min-w-0 table-fixed text-sm">
              <thead>
                <tr className={ADMIN_TABLE_HEAD}>
                  <th className={`${ADMIN_TABLE_TH} w-[40%]`}>Report</th>
                  <th className={`${ADMIN_TABLE_TH} w-[24%]`}>Reporter</th>
                  <th className={`${ADMIN_TABLE_TH} w-[16%]`}>Status</th>
                  <th className={`${ADMIN_TABLE_TH} w-[20%]`}>Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobData.items.map((r) => (
                  <tr
                    key={r.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => {
                      setSelectedJob(r);
                      setNotesDraft(r.adminNotes ?? "");
                    }}
                  >
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <StackedCell primary={r.reason} secondary={r.jobTitle} />
                    </td>
                    <td className={`${ADMIN_TABLE_TD} min-w-0`}>
                      <StackedCell
                        primary={r.reporterName ?? "Unknown"}
                        secondary={r.reporterEmail}
                      />
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <StatusBadge status={r.status.toLowerCase()} />
                    </td>
                    <td className={`${ADMIN_TABLE_TD} text-xs text-slate-500`}>
                      {formatWhen(r.createdAt)}
                    </td>
                  </tr>
                ))}
                {jobData.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm italic text-slate-400"
                    >
                      No job reports found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </AdminDataTable>
          <TablePagination
            currentPage={jobPage}
            totalItems={jobData.total}
            pageSize={itemsPerPage}
            onPageChange={fetchJobs}
          />
        </div>
      ) : null}


      {/* Platform drawer */}
      <AdminDrawer
        open={Boolean(selectedPlatformId)}
        onClose={() => {
          setSelectedPlatformId(null);
          setSelectedPlatform(null);
        }}
        title={selectedPlatform?.title || "Report details"}
        description={
          selectedPlatform
            ? `${selectedPlatform.category.replace(/_/g, " ")} • ${prettyPlatformStatus(selectedPlatform.status)}`
            : "Loading…"
        }
        footer={
          selectedPlatform ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => savePlatformStatus("open")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Mark open
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => savePlatformStatus("in_progress")}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Investigating
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => savePlatformStatus("resolved")}
                className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50"
              >
                Resolve
              </button>
            </div>
          ) : null
        }
      >
        {!selectedPlatform ? (
          <p className="text-sm text-slate-500">Loading report…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reporter
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedPlatform.reporterRole}
                </p>
                <p className="mt-1 truncate font-mono text-xs text-slate-500">
                  {selectedPlatform.reporterId}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reported URL
                </p>
                {selectedPlatform.reportedUrl ? (
                  <a
                    href={selectedPlatform.reportedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block truncate text-sm font-semibold text-[#006e2f] hover:underline"
                  >
                    {selectedPlatform.reportedUrl}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-600">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {selectedPlatform.descriptionMarkdown}
              </p>
            </div>
            {selectedPlatform.evidenceSignedUrl ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <OptimizedImage
                  src={selectedPlatform.evidenceSignedUrl}
                  alt="Report evidence"
                  width={640}
                  height={400}
                  className="h-auto w-full object-contain"
                />
              </div>
            ) : selectedPlatform.evidenceStoragePath ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
                <ImageIcon className="h-4 w-4" aria-hidden />
                Evidence on file
              </div>
            ) : null}
            <label className="block text-sm font-semibold text-slate-700">
              Admin notes
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}
      </AdminDrawer>

      {/* Job drawer */}
      <AdminDrawer
        open={Boolean(selectedJob)}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.reason ?? "Job report"}
        description={selectedJob?.jobTitle}
        footer={
          selectedJob ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => saveJobStatus("PENDING")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Pending
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveJobStatus("REVIEWED")}
                className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Reviewed
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveJobStatus("DISMISSED")}
                className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Dismiss
              </button>
            </div>
          ) : null
        }
      >
        {selectedJob ? (
          <div className="space-y-4">
            <StackedCell
              primary={selectedJob.reporterName ?? "Unknown"}
              secondary={selectedJob.reporterEmail}
            />
            <p className="whitespace-pre-wrap text-sm text-slate-700">
              {selectedJob.description}
            </p>
            <label className="block text-sm font-semibold text-slate-700">
              Admin notes
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        ) : null}
      </AdminDrawer>

    </div>
  );
}
