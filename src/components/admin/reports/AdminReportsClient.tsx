"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
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
  getAdminUserReports,
  getAdminUserReportById,
  updateUserReportStatus,
  type AdminReportDeepDive,
  type AdminReportRow,
  type AdminJobReportRow,
  type AdminUserReportRow,
  type AdminUserReportDeepDive,
} from "@/actions/reports";
import {
  REPORT_STATUSES,
  USER_REPORT_VIOLATION_LABELS,
  USER_REPORT_STATUS_LABELS,
  type AdminReportsTab,
  type UserReportStatus,
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
import { ReportRowActionsMenu } from "@/components/admin/reports/ReportRowActionsMenu";

const PLATFORM_STATUSES = ["open", "in_progress", "resolved"] as const;
const JOB_STATUSES = ["PENDING", "REVIEWED", "DISMISSED", "ALL"] as const;
const USER_STATUSES = ["open", "investigating", "resolved", "dismissed"] as const;

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
    ["platform", "jobs", "employers", "workers"].includes(tabParam)
      ? tabParam
      : "platform"
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

  const [userStatus, setUserStatus] = useState<UserReportStatus | "all">(
    "open"
  );
  const [userQ, setUserQ] = useState("");
  const [employerData, setEmployerData] = useState<{
    items: AdminUserReportRow[];
    total: number;
  }>({ items: [], total: 0 });
  const [workerData, setWorkerData] = useState<{
    items: AdminUserReportRow[];
    total: number;
  }>({ items: [], total: 0 });
  const [userPage, setUserPage] = useState(1);
  const [selectedUserReport, setSelectedUserReport] =
    useState<AdminUserReportDeepDive | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  const fetchUserReports = (
    reportedRole: "employer" | "worker",
    page: number
  ) => {
    startTransition(async () => {
      const next = await getAdminUserReports({
        reportedRole,
        status: userStatus === "all" ? undefined : userStatus,
        q: userQ.trim() || undefined,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      });
      if (!next) {
        toast.error("Failed to load user reports");
        return;
      }
      if (reportedRole === "employer") setEmployerData(next);
      else setWorkerData(next);
      setUserPage(page);
    });
  };

  useEffect(() => {
    if (activeTab === "platform") fetchPlatform(1);
    else if (activeTab === "jobs") fetchJobs(1);
    else if (activeTab === "employers") fetchUserReports("employer", 1);
    else fetchUserReports("worker", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, platformStatus, jobStatus, userStatus]);

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

  useEffect(() => {
    if (!selectedUserId) return;
    startTransition(async () => {
      const full = await getAdminUserReportById(selectedUserId);
      if (!full) {
        toast.error("Failed to load case");
        return;
      }
      setSelectedUserReport(full);
      setNotesDraft(full.adminNotes ?? "");
    });
  }, [selectedUserId]);

  const searchPlaceholder =
    activeTab === "platform"
      ? "Search title, URL, description…"
      : activeTab === "jobs"
        ? "Search reason, description…"
        : "Search title or description…";

  const handleSearch = () => {
    if (activeTab === "platform") fetchPlatform(1);
    else if (activeTab === "jobs") fetchJobs(1);
    else if (activeTab === "employers") fetchUserReports("employer", 1);
    else fetchUserReports("worker", 1);
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

  const saveUserStatus = (next: UserReportStatus) => {
    if (!selectedUserReport) return;
    startTransition(async () => {
      const result = await updateUserReportStatus({
        reportId: selectedUserReport.id,
        status: next,
        adminNotes: notesDraft,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Case updated");
      const role =
        selectedUserReport.reportedRole === "employer" ? "employer" : "worker";
      fetchUserReports(role, userPage);
      const full = await getAdminUserReportById(selectedUserReport.id);
      setSelectedUserReport(full);
    });
  };

  const userRows =
    activeTab === "employers" ? employerData : workerData;

  const tabs = [
    { id: "platform", label: "Platform Issues", count: platformData.total },
    { id: "jobs", label: "Job Reports", count: jobData.total },
    { id: "employers", label: "Employer Reports", count: employerData.total },
    { id: "workers", label: "Worker Reports", count: workerData.total },
  ];

  const renderUserCards = (rows: AdminUserReportRow[]) =>
    rows.length === 0 ? (
      <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
        No reports in this queue.
        {activeTab === "employers" ? (
          <>
            {" "}
            Legacy wage disputes may still appear under{" "}
            <Link href="/admin/disputes" className="font-semibold text-[#006e2f]">
              Disputes
            </Link>
            .
          </>
        ) : null}
      </p>
    ) : (
      rows.map((r) => (
        <AdminMobileCard
          key={r.id}
          actionsPlacement="header"
          actions={
            <ReportRowActionsMenu
              reportId={r.id}
              reportedUserId={r.reportedUserId}
              reportedLabel={r.reportedName}
              reportedEmail={r.reportedEmail}
              onReview={() => setSelectedUserId(r.id)}
              onChanged={() =>
                fetchUserReports(
                  activeTab === "employers" ? "employer" : "worker",
                  userPage
                )
              }
            />
          }
        >
          <button
            type="button"
            className="w-full min-w-0 space-y-2 text-left"
            onClick={() => setSelectedUserId(r.id)}
          >
            <StackedCell
              primary={r.title}
              secondary={USER_REPORT_VIOLATION_LABELS[r.violationCategory]}
            />
            <StackedCell
              primary={r.reportedName}
              secondary={`Reported · ${r.reportedEmail || "No email"}`}
            />
            <StackedCell
              primary={r.reporterName}
              secondary={`Reporter · confidential`}
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              <StatusBadge status={r.status} />
              <span className="text-xs text-slate-400">
                {formatWhen(r.createdAt)}
              </span>
            </div>
          </button>
        </AdminMobileCard>
      ))
    );

  const renderUserTable = (rows: AdminUserReportRow[]) => (
    <table className="w-full min-w-0 table-fixed text-sm">
      <thead>
        <tr className={ADMIN_TABLE_HEAD}>
          <th className={`${ADMIN_TABLE_TH} w-[28%]`}>Report</th>
          <th className={`${ADMIN_TABLE_TH} w-[18%]`}>Reporter</th>
          <th className={`${ADMIN_TABLE_TH} w-[18%]`}>Reported</th>
          <th className={`${ADMIN_TABLE_TH} w-[16%]`}>Violation</th>
          <th className={`${ADMIN_TABLE_TH} w-[12%]`}>Status</th>
          <th className={`${ADMIN_TABLE_TH} w-[8%] text-right`}>Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {rows.map((r) => (
          <tr key={r.id} className={ADMIN_TABLE_ROW}>
            <td className={`${ADMIN_TABLE_TD} min-w-0`}>
              <button
                type="button"
                className="w-full min-w-0 text-left"
                onClick={() => setSelectedUserId(r.id)}
              >
                <StackedCell
                  primary={r.title}
                  secondary={formatWhen(r.createdAt)}
                />
              </button>
            </td>
            <td className={`${ADMIN_TABLE_TD} min-w-0`}>
              <StackedCell
                primary={r.reporterName}
                secondary={r.reporterRole}
              />
            </td>
            <td className={`${ADMIN_TABLE_TD} min-w-0`}>
              <StackedCell
                primary={r.reportedName}
                secondary={r.reportedEmail || undefined}
              />
            </td>
            <td className={`${ADMIN_TABLE_TD} min-w-0`}>
              <span className="text-xs font-semibold text-slate-700">
                {USER_REPORT_VIOLATION_LABELS[r.violationCategory]}
              </span>
            </td>
            <td className={ADMIN_TABLE_TD}>
              <StatusBadge status={r.status} />
            </td>
            <td className={`${ADMIN_TABLE_TD} text-right`}>
              <ReportRowActionsMenu
                reportId={r.id}
                reportedUserId={r.reportedUserId}
                reportedLabel={r.reportedName}
                reportedEmail={r.reportedEmail}
                onReview={() => setSelectedUserId(r.id)}
                onChanged={() =>
                  fetchUserReports(
                    activeTab === "employers" ? "employer" : "worker",
                    userPage
                  )
                }
              />
            </td>
          </tr>
        ))}
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={6}
              className="px-4 py-10 text-center text-sm italic text-slate-400"
            >
              No reports in this queue.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );

  return (
    <div className="min-w-0 space-y-6">
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
          ) : activeTab === "jobs" ? (
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
          ) : (
            <AdminFilterPills
              options={[
                ...USER_STATUSES.map((s) => USER_REPORT_STATUS_LABELS[s]),
                "All",
              ]}
              value={
                userStatus === "all"
                  ? "All"
                  : USER_REPORT_STATUS_LABELS[userStatus]
              }
              onChange={(v) => {
                if (v === "All") {
                  setUserStatus("all");
                  return;
                }
                const entry = (
                  Object.entries(USER_REPORT_STATUS_LABELS) as [
                    UserReportStatus,
                    string,
                  ][]
                ).find(([, label]) => label === v);
                if (entry) setUserStatus(entry[0]);
              }}
            />
          )}
        </div>

        <div className="flex min-w-0 gap-2">
          <input
            value={
              activeTab === "platform"
                ? platformQ
                : activeTab === "jobs"
                  ? jobQ
                  : userQ
            }
            onChange={(e) => {
              const v = e.target.value;
              if (activeTab === "platform") setPlatformQ(v);
              else if (activeTab === "jobs") setJobQ(v);
              else setUserQ(v);
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

      {activeTab === "employers" || activeTab === "workers" ? (
        <div className="min-w-0 space-y-4">
          <AdminDataTable mobileCards={renderUserCards(userRows.items)}>
            {renderUserTable(userRows.items)}
          </AdminDataTable>
          <TablePagination
            currentPage={userPage}
            totalItems={userRows.total}
            pageSize={itemsPerPage}
            onPageChange={(page) =>
              fetchUserReports(
                activeTab === "employers" ? "employer" : "worker",
                page
              )
            }
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

      {/* User report drawer */}
      <AdminDrawer
        open={Boolean(selectedUserId)}
        onClose={() => {
          setSelectedUserId(null);
          setSelectedUserReport(null);
        }}
        title={selectedUserReport?.title ?? "Case details"}
        description={
          selectedUserReport
            ? `${USER_REPORT_VIOLATION_LABELS[selectedUserReport.violationCategory]} · ${USER_REPORT_STATUS_LABELS[selectedUserReport.status]}`
            : "Loading…"
        }
        footer={
          selectedUserReport ? (
            <div className="flex flex-wrap gap-2">
              {(
                Object.keys(USER_REPORT_STATUS_LABELS) as UserReportStatus[]
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={pending}
                  onClick={() => saveUserStatus(s)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50 ${
                    s === "dismissed"
                      ? "bg-slate-700 text-white"
                      : s === "resolved"
                        ? "bg-[#006e2f] text-white"
                        : s === "investigating"
                          ? "bg-amber-500 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {USER_REPORT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          ) : null
        }
      >
        {!selectedUserReport ? (
          <p className="text-sm text-slate-500">Loading case…</p>
        ) : (
          <div className="space-y-5">
            <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              Reporter identity is confidential. Do not disclose to the reported
              party (RA 10173 / GDPR).
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reporter (admin only)
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                  {selectedUserReport.reporterName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {selectedUserReport.reporterEmail || "—"}
                </p>
              </div>
              <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Reported user
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">
                  {selectedUserReport.reportedName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {selectedUserReport.reportedEmail || "—"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Details
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {selectedUserReport.description}
              </p>
            </div>
            <label className="block text-sm font-semibold text-slate-700">
              Admin notes
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={4}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <ReportRowActionsMenu
                reportId={selectedUserReport.id}
                reportedUserId={selectedUserReport.reportedUserId}
                reportedLabel={selectedUserReport.reportedName}
                reportedEmail={selectedUserReport.reportedEmail}
                onReview={() => undefined}
                onChanged={() => {
                  fetchUserReports(
                    selectedUserReport.reportedRole === "employer"
                      ? "employer"
                      : "worker",
                    userPage
                  );
                  void getAdminUserReportById(selectedUserReport.id).then(
                    setSelectedUserReport
                  );
                }}
              />
              <Link
                href={`/admin/users?search=${encodeURIComponent(selectedUserReport.reportedEmail || selectedUserReport.reportedUserId)}`}
                className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Open user in Users
              </Link>
            </div>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
