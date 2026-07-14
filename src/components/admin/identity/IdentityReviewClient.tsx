"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Fingerprint,
  Check,
  X,
  FileImage,
  ChevronDown,
  ChevronUp,
  Clock,
  Files,
  Eye,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchWorkerVerificationDocuments,
  reviewWorkerVerification,
} from "@/actions/admin-actions";
import { getAdminWorkerProfileDeepDive, type AdminWorkerProfileDeepDive } from "@/actions/admin/deep-dive";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { AdminSectionLabel } from "@/components/admin/shared/AdminFilterPills";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { AdminSlideover } from "@/components/admin/shared/AdminSlideover";
import { TablePagination } from "@/components/shared/TablePagination";
import { formatFullName } from "@/lib/format/name";
import type {
  AdminVerificationDocument,
  AdminVerificationQueueRow,
} from "@/types/admin.types";

interface IdentityReviewClientProps {
  queue: AdminVerificationQueueRow[];
}

export function IdentityReviewClient({ queue }: IdentityReviewClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") ?? "pending";
  const searchQuery = searchParams.get("search") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";

  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);

  if (searchQuery !== prevSearchQuery) {
    setSearchTerm(searchQuery);
    setPrevSearchQuery(searchQuery);
  }

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<
    Record<string, AdminVerificationDocument[]>
  >({});
  const [loadingDocs, setLoadingDocs] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState<{
    workerId: string;
    name: string;
    type: "approved" | "rejected";
  } | null>(null);
  const [viewTarget, setViewTarget] = useState<{
    workerId: string;
    name: string;
  } | null>(null);
  const [viewData, setViewData] = useState<AdminWorkerProfileDeepDive | null>(
    null
  );
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

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(window.location.search);
    if (tabId && tabId !== "pending") {
      params.set("tab", tabId);
    } else {
      params.delete("tab");
    }
    params.delete("page"); // Reset page on tab change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (sortVal: string) => {
    const params = new URLSearchParams(window.location.search);
    if (sortVal && sortVal !== "newest") {
      params.set("sort", sortVal);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleExpand = async (workerId: string) => {
    if (expandedId === workerId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(workerId);
    if (!documents[workerId]) {
      setLoadingDocs(workerId);
      try {
        const docs = await fetchWorkerVerificationDocuments(workerId);
        setDocuments((prev) => ({ ...prev, [workerId]: docs }));
      } catch {
        toast.error("Failed to load verification documents");
      } finally {
        setLoadingDocs(null);
      }
    }
  };

  const handleDecision = () => {
    if (!decision) return;
    startTransition(async () => {
      const result = await reviewWorkerVerification(
        decision.workerId,
        decision.type,
        reason || undefined
      );
      if (result.success) {
        toast.success(
          decision.type === "approved"
            ? "Worker verified"
            : "Verification rejected"
        );
        setDecision(null);
        setReason("");
        setExpandedId(null);
        setViewTarget(null);
        setViewData(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const openDeepDive = (workerId: string, name: string) => {
    setViewTarget({ workerId, name });
    setViewData(null);
    setLoadingDocs(workerId);
    startTransition(async () => {
      try {
        const [full, docs] = await Promise.all([
          getAdminWorkerProfileDeepDive(workerId),
          documents[workerId]
            ? Promise.resolve(documents[workerId]!)
            : fetchWorkerVerificationDocuments(workerId),
        ]);
        if (!full) {
          toast.error("Failed to load worker profile");
          setViewTarget(null);
          return;
        }
        setDocuments((prev) =>
          prev[workerId] ? prev : { ...prev, [workerId]: docs }
        );
        setViewData(full);
      } catch {
        toast.error("Failed to load worker profile");
        setViewTarget(null);
      } finally {
        setLoadingDocs(null);
      }
    });
  };

  // Filter queue records based on tab status
  const filteredRows = queue.filter((worker) => {
    // Tab filtering
    if (activeTab === "pending") {
      if (
        worker.verification_status !== "documents_submitted" &&
        worker.verification_status !== "under_review"
      ) {
        return false;
      }
    } else if (activeTab === "approved") {
      if (worker.verification_status !== "approved") {
        return false;
      }
    } else if (activeTab === "rejected") {
      if (worker.verification_status !== "rejected") {
        return false;
      }
    }

    // Search query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const first = worker.first_name?.toLowerCase() ?? "";
      const last = worker.last_name?.toLowerCase() ?? "";
      const email = worker.email?.toLowerCase() ?? "";
      const full = `${first} ${last}`.trim();
      if (
        !first.includes(query) &&
        !last.includes(query) &&
        !email.includes(query) &&
        !full.includes(query)
      ) {
        return false;
      }
    }

    return true;
  });

  // Sort rows based on newest/oldest
  const sortedRows = [...filteredRows].sort((a, b) => {
    const timeA = new Date(a.created_at).getTime();
    const timeB = new Date(b.created_at).getTime();
    if (activeSort === "oldest") {
      return timeA - timeB;
    }
    return timeB - timeA;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilterKey, setPrevFilterKey] = useState(searchQuery + activeTab + activeSort);
  const itemsPerPage = 20;

  const currentFilterKey = searchQuery + activeTab + activeSort;
  if (currentFilterKey !== prevFilterKey) {
    setCurrentPage(1);
    setPrevFilterKey(currentFilterKey);
  }

  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalItems = sortedRows.length;

  // Totals for Stats
  const totalPending = queue.filter(
    (w) =>
      w.verification_status === "documents_submitted" ||
      w.verification_status === "under_review"
  ).length;
  const totalDocuments = queue.reduce((sum, w) => sum + w.document_count, 0);

  const tabs = [
    { id: "pending", label: "Pending Review" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All History" },
  ];

  return (
    <div className="space-y-6">
      {/* Tabbed Navigation Interface */}
      <div className="border-b border-slate-200">
        <div
          className="flex overflow-x-auto whitespace-nowrap -mb-px"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabCount = queue.filter((worker) => {
              if (tab.id === "pending") {
                return (
                  worker.verification_status === "documents_submitted" ||
                  worker.verification_status === "under_review"
                );
              }
              if (tab.id === "approved") {
                return worker.verification_status === "approved";
              }
              if (tab.id === "rejected") {
                return worker.verification_status === "rejected";
              }
              return true; // all
            }).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 py-4 px-6 text-sm font-semibold transition-all ${
                  isActive
                    ? "border-emerald-600 text-emerald-700 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tabCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* URL-Driven Search & Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-4 rounded-xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search worker name or email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 rounded-lg text-sm transition-colors text-slate-800 placeholder-slate-400 bg-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial min-w-[140px]">
            <select
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
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
              value={totalPending}
              icon={<Clock className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-amber-50"
              iconColorClass="text-amber-600"
            />
            <StatCard
              variant="dashboard"
              title="Documents Submitted"
              value={totalDocuments}
              icon={<Files className="h-4 w-4" aria-hidden />}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
            />
            <StatCard
              variant="dashboard"
              title="Workers in Queue"
              value={totalPending}
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

        {sortedRows.length === 0 ? (
          <EmptyState
            icon={<Fingerprint className="h-5 w-5 text-slate-400" aria-hidden />}
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
        ) : activeTab === "pending" ? (
          <div className="space-y-4">
            <ul className="space-y-3">
              {paginatedRows.map((worker) => {
                const name =
                  formatFullName(worker.first_name, worker.middle_name, worker.last_name) ||
                  worker.email ||
                  "Unknown worker";
                const isExpanded = expandedId === worker.id;
                const docs = documents[worker.id] ?? [];

                return (
                  <li
                    key={worker.id}
                    className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-400">{worker.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusBadge status={worker.verification_status} />
                          <span className="text-xs text-slate-500">
                            {worker.document_count} document
                            {worker.document_count === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openDeepDive(worker.id, name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden />
                          Deep dive
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(worker.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                          Documents
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setDecision({
                              workerId: worker.id,
                              name,
                              type: "approved",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-xl bg-[#006e2f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#005c26] disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            setDecision({
                              workerId: worker.id,
                              name,
                              type: "rejected",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                          Reject
                        </button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="space-y-4 border-t border-slate-100 px-4 py-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <KycField label="ID type" value={worker.id_type} />
                          <KycField label="ID number" value={worker.id_number} />
                          <KycField
                            label="ID expiration"
                            value={
                              worker.id_expiration_date
                                ? new Date(
                                    worker.id_expiration_date
                                  ).toLocaleDateString()
                                : null
                            }
                          />
                          <KycField
                            label="Issuing country"
                            value={worker.id_issuing_country}
                          />
                          <KycField label="TIN" value={worker.tin_number} />
                          <KycField label="Username" value={worker.username} />
                          <KycField label="Phone" value={worker.phone_number} />
                          <KycField
                            label="Registered"
                            value={new Date(
                              worker.created_at
                            ).toLocaleDateString()}
                          />
                        </div>

                        {loadingDocs === worker.id ? (
                          <p className="text-sm font-medium text-slate-400">
                            Loading documents…
                          </p>
                        ) : docs.length === 0 ? (
                          <p className="text-sm font-medium text-slate-400">
                            No documents on file.
                          </p>
                        ) : (
                          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {docs.map((doc) => (
                              <li
                                key={doc.id}
                                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                              >
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                  <FileImage className="h-4 w-4 text-slate-400" />
                                  {doc.document_type.replace(/_/g, " ")}
                                </div>
                                <p className="mt-1 truncate text-[11px] text-slate-400">
                                  {doc.file_name}
                                </p>
                                {doc.signed_url ? (
                                  <a
                                    href={doc.signed_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block text-xs font-semibold text-[#006e2f] hover:underline"
                                  >
                                    View / download
                                  </a>
                                ) : (
                                  <p className="mt-2 text-xs font-semibold text-red-500">
                                    Unable to generate preview URL
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <TablePagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
              label="workers"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto w-full max-w-full rounded-lg shadow-sm border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3 w-[30%]">Worker</th>
                    <th className="px-6 py-3 w-[20%]">Submission Date</th>
                    <th className="px-6 py-3 w-[20%]">Status</th>
                    <th className="px-6 py-3 w-[20%]">Reviewed By</th>
                    <th className="px-6 py-3 w-[10%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedRows.map((worker) => {
                    const name =
                      formatFullName(worker.first_name, worker.middle_name, worker.last_name) ||
                      worker.email ||
                      "Unknown worker";
                    return (
                      <tr
                        key={worker.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{name}</p>
                          <p className="text-xs text-slate-400">
                            {worker.email}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(worker.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={worker.verification_status} />
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          System Admin
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openDeepDive(worker.id, name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            Deep dive
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="block md:hidden space-y-3">
              {paginatedRows.map((worker) => {
                const name =
                  formatFullName(worker.first_name, worker.middle_name, worker.last_name) ||
                  worker.email ||
                  "Unknown worker";
                return (
                  <div
                    key={worker.id}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{name}</p>
                        <p className="text-xs text-slate-400">{worker.email}</p>
                      </div>
                      <StatusBadge status={worker.verification_status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-50 pt-2">
                      <div>
                        <p className="text-slate-400 font-medium">Submitted</p>
                        <p className="text-slate-700 font-semibold mt-0.5">
                          {new Date(worker.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 font-medium">
                          Reviewed By
                        </p>
                        <p className="text-slate-700 font-semibold mt-0.5">
                          System Admin
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end border-t border-slate-50 pt-3">
                      <button
                        type="button"
                        onClick={() => openDeepDive(worker.id, name)}
                        className="w-full inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        Deep dive
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <TablePagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={itemsPerPage}
              onPageChange={setCurrentPage}
              label="workers"
            />
          </div>
        )}
      </section>

      <ConfirmDialog
        open={decision !== null}
        title={
          decision?.type === "approved"
            ? "Approve verification?"
            : "Reject verification?"
        }
        description={
          decision?.type === "approved"
            ? `Mark ${decision?.name} as identity-verified.`
            : `Reject identity documents for ${decision?.name}.`
        }
        confirmLabel={decision?.type === "approved" ? "Approve" : "Reject"}
        variant={decision?.type === "rejected" ? "danger" : "default"}
        loading={pending}
        onCancel={() => {
          setDecision(null);
          setReason("");
        }}
        onConfirm={handleDecision}
      >
        <label className="block">
          <span className="text-xs font-medium text-slate-600">
            {decision?.type === "approved"
              ? "Approval note (optional, sent to worker)"
              : "Rejection feedback (recommended, sent to worker)"}
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Add custom feedback for the worker…"
            className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
      </ConfirmDialog>

      <AdminSlideover
        open={viewTarget !== null}
        onClose={() => {
          setViewTarget(null);
          setViewData(null);
        }}
        title={viewTarget?.name ?? "Worker profile"}
        description={
          viewData
            ? `${viewData.professionalTitle ?? "Worker"} • ${
                viewData.verificationStatus?.replace(/_/g, " ") ?? "unverified"
              }`
            : "Loading…"
        }
      >
        {!viewData ? (
          <p className="text-sm font-medium text-slate-500">Loading profile…</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Core profile
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatFullName(
                    viewData.firstName,
                    viewData.middleName,
                    viewData.lastName,
                    viewData.suffix
                  ) || "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {viewData.email ?? "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  @{viewData.username?.trim() || "—"} ·{" "}
                  {viewData.phoneNumber ?? "No phone"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Registered{" "}
                  {new Date(viewData.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {viewData.id}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Verification status
                </p>
                <div className="mt-2">
                  <StatusBadge
                    status={viewData.verificationStatus ?? "unverified"}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  {viewData.location ?? "—"}
                  {viewData.isRemote ? " • Remote" : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {viewData.availability ?? "Availability not set"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Statutory identification
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <KycField label="ID type" value={viewData.idType} />
                <KycField label="ID number" value={viewData.idNumber} />
                <KycField
                  label="ID expiration"
                  value={
                    viewData.idExpirationDate
                      ? new Date(
                          viewData.idExpirationDate
                        ).toLocaleDateString()
                      : null
                  }
                />
                <KycField
                  label="Issuing country"
                  value={viewData.idIssuingCountry}
                />
                <KycField label="TIN" value={viewData.tinNumber} />
                <KycField label="SSS" value={viewData.sssNumber} />
                <KycField label="PhilHealth" value={viewData.philhealthNumber} />
                <KycField label="Pag-IBIG" value={viewData.pagibigNumber} />
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verification documents
              </p>
              {loadingDocs === viewData.id ? (
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Loading documents…
                </p>
              ) : (documents[viewData.id] ?? []).length === 0 ? (
                <p className="mt-3 text-sm font-medium text-slate-500">
                  No documents on file.
                </p>
              ) : (
                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(documents[viewData.id] ?? []).map((doc) => (
                    <li
                      key={doc.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <FileImage className="h-4 w-4 text-slate-400" />
                        {doc.document_type.replace(/_/g, " ")}
                      </div>
                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        {doc.file_name}
                      </p>
                      {doc.signed_url ? (
                        <a
                          href={doc.signed_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs font-semibold text-[#006e2f] hover:underline"
                        >
                          View / download
                        </a>
                      ) : (
                        <p className="mt-2 text-xs font-semibold text-red-500">
                          Unable to generate preview URL
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {(viewData.verificationStatus === "documents_submitted" ||
              viewData.verificationStatus === "under_review") && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    setDecision({
                      workerId: viewData.id,
                      name:
                        formatFullName(
                          viewData.firstName,
                          viewData.middleName,
                          viewData.lastName
                        ) ||
                        viewData.email ||
                        "Worker",
                      type: "approved",
                    })
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#006e2f] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#005c26] disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  Approve verification
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    setDecision({
                      workerId: viewData.id,
                      name:
                        formatFullName(
                          viewData.firstName,
                          viewData.middleName,
                          viewData.lastName
                        ) ||
                        viewData.email ||
                        "Worker",
                      type: "rejected",
                    })
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Reject / suspend
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Bio
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-800">
                {viewData.bio?.trim() ? viewData.bio : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Top skills
              </p>
              {viewData.skills.length === 0 ? (
                <p className="mt-2 text-sm font-medium text-slate-500">—</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {viewData.skills.map((s) => (
                    <span
                      key={s.skillName}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {s.skillName}
                      <span className="text-[11px] font-bold text-slate-400">
                        {s.proficiency}%
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminSlideover>
    </div>
  );
}

function KycField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">
        {value?.trim() ? value : "—"}
      </p>
    </div>
  );
}
