"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ImageIcon, Paperclip } from "lucide-react";
import Link from "next/link";
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
import { REPORT_STATUSES } from "@/lib/reporting/constants";
import { AdminFilterPills } from "@/components/admin/shared/AdminFilterPills";
import { AdminDrawer } from "@/components/admin/shared/AdminDrawer";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { TablePagination } from "@/components/shared/TablePagination";

const STATUS_FILTERS = ["open", "in_progress", "resolved"] as const;
const ROLE_FILTERS = ["all", "worker", "employer"] as const;
const JOB_STATUS_FILTERS = ["PENDING", "REVIEWED", "DISMISSED", "ALL"] as const;

function prettyStatus(s: string) {
  return s === "in_progress" ? "In progress" : s.charAt(0).toUpperCase() + s.slice(1);
}

export function AdminReportsClient({
  initial,
}: {
  initial: { items: AdminReportRow[]; total: number };
}) {
  const [activeTab, setActiveTab] = useState<"general" | "jobs">("general");
  const [pending, startTransition] = useTransition();

  // General Platform Reports State
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("open");
  const [role, setRole] = useState<(typeof ROLE_FILTERS)[number]>("all");
  const [q, setQ] = useState("");
  const [data, setData] = useState(initial);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminReportDeepDive | null>(null);

  // Job Reports State
  const [jobReportsData, setJobReportsData] = useState<{ items: AdminJobReportRow[]; total: number }>({ items: [], total: 0 });
  const [jobPage, setJobPage] = useState(1);
  const [jobStatus, setJobStatus] = useState<"PENDING" | "REVIEWED" | "DISMISSED" | "ALL">("PENDING");
  const [jobQuery, setJobQuery] = useState("");
  const [selectedJobReport, setSelectedJobReport] = useState<AdminJobReportRow | null>(null);

  // Shared Admin Notes Draft
  const [notesDraft, setNotesDraft] = useState("");

  const itemsPerPage = 20;

  // Compute counts based on currently loaded list items
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_FILTERS) counts[s] = 0;
    for (const r of data.items) {
      if (counts[r.status] != null) counts[r.status] += 1;
    }
    return counts;
  }, [data.items]);

  const jobStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { PENDING: 0, REVIEWED: 0, DISMISSED: 0 };
    for (const r of jobReportsData.items) {
      if (counts[r.status] != null) counts[r.status] += 1;
    }
    return counts;
  }, [jobReportsData.items]);

  // Fetch functions
  const fetchPage = (page: number) => {
    startTransition(async () => {
      const next = await getAdminReports({
        status,
        reporterRole: role === "all" ? undefined : role,
        q: q.trim() || undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });
      if (!next) {
        toast.error("Failed to load reports");
        return;
      }
      setData(next);
      setCurrentPage(page);
    });
  };

  const fetchJobPage = (page: number) => {
    startTransition(async () => {
      const next = await getAdminJobReports({
        status: jobStatus === "ALL" ? undefined : jobStatus,
        q: jobQuery.trim() || undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });
      if (!next) {
        toast.error("Failed to load job reports");
        return;
      }
      setJobReportsData(next);
      setJobPage(page);
    });
  };

  const refresh = () => fetchPage(1);

  // Trigger loading when general filters change
  useEffect(() => {
    if (activeTab === "general") {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, role]);

  // Trigger loading when job filters change
  useEffect(() => {
    fetchJobPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatus]);

  // Trigger when general report is selected
  useEffect(() => {
    if (!selectedId) return;
    startTransition(async () => {
      const full = await getAdminReportById(selectedId);
      if (!full) {
        toast.error("Failed to load report");
        return;
      }
      setSelected(full);
      setNotesDraft(full.adminNotes ?? "");
    });
  }, [selectedId]);

  const openPanel = (id: string) => {
    setSelectedId(id);
    setSelected(null);
  };

  const saveStatus = (nextStatus: (typeof REPORT_STATUSES)[number]) => {
    if (!selected) return;
    startTransition(async () => {
      const result = await updateReportStatus({
        reportId: selected.id,
        status: nextStatus,
        adminNotes: notesDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Report updated");
      await refresh();
      const full = await getAdminReportById(selected.id);
      setSelected(full);
    });
  };

  const saveJobReportStatus = (nextStatus: "PENDING" | "REVIEWED" | "DISMISSED") => {
    if (!selectedJobReport) return;
    startTransition(async () => {
      const result = await updateJobReportStatus({
        reportId: selectedJobReport.id,
        status: nextStatus,
        adminNotes: notesDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Job report status updated");
      setSelectedJobReport(null);
      await fetchJobPage(jobPage);
    });
  };

  const handleSearch = () => {
    if (activeTab === "general") {
      refresh();
    } else {
      fetchJobPage(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab bar header */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
            activeTab === "general"
              ? "border-[#006e2f] text-[#006e2f] bg-[#ebfdf2]/20"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-350"
          }`}
        >
          <span>Platform Issues</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {data.total}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${
            activeTab === "jobs"
              ? "border-[#006e2f] text-[#006e2f] bg-[#ebfdf2]/20"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-350"
          }`}
        >
          <span>Job Reports</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {jobReportsData.total}
          </span>
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          {activeTab === "general" ? (
            <>
              <AdminFilterPills
                options={STATUS_FILTERS.map(prettyStatus)}
                value={prettyStatus(status)}
                onChange={(v) => {
                  setStatus(
                    v === "In progress" ? "in_progress" : (v.toLowerCase() as typeof status)
                  );
                  setCurrentPage(1);
                }}
                counts={{
                  Open: statusCounts.open ?? 0,
                  "In progress": statusCounts.in_progress ?? 0,
                  Resolved: statusCounts.resolved ?? 0,
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      role === r
                        ? "border-[#006e2f]/30 bg-[#ebfdf2] text-[#006e2f]"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {r === "all" ? "All roles" : r}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <AdminFilterPills
              options={JOB_STATUS_FILTERS.map(s => s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase())}
              value={jobStatus === "ALL" ? "All" : jobStatus.charAt(0) + jobStatus.slice(1).toLowerCase()}
              onChange={(v) => {
                const statusKey = (v === "All" ? "ALL" : v.toUpperCase()) as typeof jobStatus;
                setJobStatus(statusKey);
                setJobPage(1);
              }}
              counts={{
                Pending: jobStatusCounts.PENDING ?? 0,
                Reviewed: jobStatusCounts.REVIEWED ?? 0,
                Dismissed: jobStatusCounts.DISMISSED ?? 0,
                All: jobReportsData.total,
              }}
            />
          )}
        </div>

        <div className="flex gap-2">
          <input
            value={activeTab === "general" ? q : jobQuery}
            onChange={(e) => activeTab === "general" ? setQ(e.target.value) : setJobQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeTab === "general" ? "Search title, URL, description…" : "Search reason, description…"}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30 sm:w-[320px]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={pending}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {activeTab === "general" ? (
        <div className="space-y-4">
          <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Attachment</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.items.map((r) => (
                  <tr
                    key={r.id}
                    className="cursor-pointer hover:bg-slate-50/60"
                    onClick={() => openPanel(r.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {r.title || r.category.replace(/_/g, " ")}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">
                        {r.reportedUrl ?? "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.reporterRole}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={prettyStatus(r.status)} />
                    </td>
                    <td className="px-4 py-3">
                      {r.hasEvidence ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPanel(r.id);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#006e2f]/20 bg-[#ebfdf2] px-2.5 py-1 text-xs font-bold text-[#006e2f] transition-colors hover:bg-[#d8f9e6]"
                        >
                          <Paperclip className="h-3.5 w-3.5" aria-hidden />
                          View image
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalItems={data.total}
            pageSize={itemsPerPage}
            onPageChange={fetchPage}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Report Details</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-55">
                {jobReportsData.items.map((r) => {
                  const isSkillsIssue = r.reason.toLowerCase().includes("skills") || r.reason.toLowerCase().includes("ponytail");
                  return (
                    <tr
                      key={r.id}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/60 ${
                        isSkillsIssue ? "bg-amber-50/30 hover:bg-amber-50/50" : ""
                      }`}
                      onClick={() => {
                        setSelectedJobReport(r);
                        setNotesDraft(r.adminNotes ?? "");
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {isSkillsIssue && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 uppercase tracking-wide shrink-0">
                              Agent Skills
                            </span>
                          )}
                          <p className="font-semibold text-slate-900 leading-tight">
                            {r.reason}
                          </p>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          Job: <span className="font-bold text-slate-700">{r.jobTitle}</span>
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 text-xs">{r.reporterName}</p>
                        <p className="text-[11px] text-slate-400">{r.reporterEmail}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status.toLowerCase()} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                {jobReportsData.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm italic text-slate-400">
                      No job reports found matching your selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <TablePagination
            currentPage={jobPage}
            totalItems={jobReportsData.total}
            pageSize={itemsPerPage}
            onPageChange={fetchJobPage}
          />
        </div>
      )}

      {/* Drawer for Platform Issue */}
      <AdminDrawer
        open={Boolean(selectedId)}
        onClose={() => {
          setSelectedId(null);
          setSelected(null);
        }}
        title={selected?.title || "Report details"}
        description={selected ? `${selected.category.replace(/_/g, " ")} • ${prettyStatus(selected.status)}` : "Loading…"}
        footer={
          selected ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => saveStatus("open")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Mark open
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveStatus("in_progress")}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
              >
                Mark in progress
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveStatus("resolved")}
                className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50 cursor-pointer"
              >
                Resolve
              </button>
            </div>
          ) : null
        }
      >
        {!selected ? (
          <p className="text-sm font-medium text-slate-500">Loading report…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reporter
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selected.reporterRole}
                </p>
                <p className="mt-1 text-xs font-mono text-slate-500">
                  {selected.reporterId}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reported URL
                </p>
                {selected.reportedUrl ? (
                  <a
                    href={selected.reportedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-all text-sm font-semibold text-[#006e2f] hover:underline"
                  >
                    {selected.reportedUrl}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-medium text-slate-600">—</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description (Markdown)
              </p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
                {selected.descriptionMarkdown}
              </pre>
            </div>

            {selected.evidenceStoragePath ? (
              <div className="space-y-3 rounded-2xl border border-[#006e2f]/15 bg-[#fafdfb] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Screenshot evidence
                  </p>
                  {selected.evidenceSignedUrl ? (
                    <a
                      href={selected.evidenceSignedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#006e2f] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
                    >
                      <ImageIcon className="h-4 w-4" aria-hidden />
                      View attachment
                    </a>
                  ) : null}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      {selected.evidenceSignedUrl ? (
                    <OptimizedImage
                      src={selected.evidenceSignedUrl}
                      alt="Report screenshot evidence"
                      fill
                      sizes="(max-width: 768px) 100vw, 640px"
                      loading="lazy"
                      className="object-contain p-2"
                      containerClassName="relative aspect-video w-full max-h-80"
                    />
                  ) : (
                    <p className="px-4 py-6 text-center text-sm font-medium text-amber-700">
                      Attachment is on file but the preview could not be loaded.
                      Try reopening this report.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-2">
                    <p className="text-xs font-medium text-slate-500">
                      {selected.evidenceFileSizeBytes
                        ? `${(selected.evidenceFileSizeBytes / 1024).toFixed(0)} KB`
                        : "Attached file"}
                      {selected.evidenceMimeType
                        ? ` • ${selected.evidenceMimeType}`
                        : ""}
                    </p>
                    {selected.evidenceSignedUrl ? (
                      <a
                        href={selected.evidenceSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[#006e2f] hover:underline"
                      >
                        Open full size
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin notes
              </p>
              <AdminNotesTextarea
                value={notesDraft}
                onChange={setNotesDraft}
                placeholder="Enter admin notes..."
              />
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* Drawer for Job Report */}
      <AdminDrawer
        open={Boolean(selectedJobReport)}
        onClose={() => {
          setSelectedJobReport(null);
        }}
        title="Job Report Details"
        description={selectedJobReport ? `${selectedJobReport.reason}` : "Loading…"}
        footer={
          selectedJobReport ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => saveJobReportStatus("PENDING")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Mark Pending
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveJobReportStatus("REVIEWED")}
                className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-50 cursor-pointer"
              >
                Mark Reviewed
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => saveJobReportStatus("DISMISSED")}
                className="rounded-xl bg-slate-500 px-4 py-2 text-xs font-bold text-white hover:bg-slate-600 disabled:opacity-50 cursor-pointer"
              >
                Dismiss Report
              </button>
            </div>
          ) : null
        }
      >
        {!selectedJobReport ? (
          <p className="text-sm font-medium text-slate-500">Loading report…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reporter
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {selectedJobReport.reporterName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedJobReport.reporterEmail}
                </p>
                <p className="mt-1 text-[10px] font-mono text-slate-400">
                  ID: {selectedJobReport.reporterId}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reported Job
                </p>
                <Link
                  href={`/admin/jobs/${selectedJobReport.jobId}`}
                  target="_blank"
                  className="mt-1 block text-sm font-bold text-[#006e2f] hover:underline leading-tight"
                >
                  {selectedJobReport.jobTitle}
                </Link>
                <p className="mt-2 text-[10px] font-mono text-slate-400">
                  Job ID: {selectedJobReport.jobId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Reason for Reporting
              </p>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800">
                {selectedJobReport.reason}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Report Description / Context
              </p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-800 font-sans leading-relaxed">
                {selectedJobReport.description}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admin Notes
              </p>
              <AdminNotesTextarea
                value={notesDraft}
                onChange={setNotesDraft}
                placeholder="Enter moderation audit notes..."
              />
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}

// Stable top-level component defined outside the render body to prevent React unmounting/focus loss
function AdminNotesTextarea({
  value,
  onChange,
  placeholder = "Enter moderation audit notes...",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
    />
  );
}


