"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle, LayoutGrid, Table2, KanbanSquare, AlertTriangle } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
import { useOpenEmployerMessagingThread } from "@/components/shared/messaging/useOpenEmployerMessagingThread";
import {
  ApplicantsToolbar,
  type ApplicantSortKey,
  type ApplicantStatusFilter,
} from "./ApplicantsToolbar";
import { ApplicantCard } from "./ApplicantCard";
import {
  ApplicantTrackerTable,
  type ApplicantTrackerRow,
} from "./ApplicantTrackerTable";
import { JobApplicantUsageBar } from "@/components/shared/entitlements/JobApplicantUsageBar";
import { EntitlementProvider } from "@/components/shared/entitlements/EntitlementProvider";
import { PlanUsageStrip } from "@/components/shared/entitlements/PlanUsageStrip";
import { ContextualUpgradeBanner } from "@/components/shared/entitlements/ContextualUpgradeBanner";
import { HiddenApplicantsBanner } from "@/components/shared/entitlements/HiddenApplicantsBanner";
import { EmployerPageHeader } from "@/components/employer/layout/EmployerPageHeader";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";
import { updateApplicationStatus, deleteApplication } from "@/actions/applications";
import { ApplicationStatus } from "@/types/applications";
import { toast } from "sonner";

interface ApplicantsClientProps {
  initialApplicants: Applicant[];
  identityMode: "full" | "anonymous_preview";
  jobId: string;
  jobTitle: string;
  planUsage: EmployerPlanUsage | null;
  messagingEnabled: boolean;
  resumeDownloadEnabled: boolean;
  applicantsPerJobLimit: number | null;
  hiddenApplicantCount: number;
}

export function ApplicantsClient({
  initialApplicants,
  identityMode,
  jobId,
  jobTitle,
  planUsage,
  messagingEnabled,
  resumeDownloadEnabled,
  applicantsPerJobLimit,
  hiddenApplicantCount,
}: ApplicantsClientProps) {
  const { openThread } = useOpenEmployerMessagingThread();
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicantStatusFilter>("all");
  const [sortKey, setSortKey] = useState<ApplicantSortKey>("newest");
  const [viewMode, setViewMode] = useState<"pipeline" | "cards" | "table">("pipeline");
  const [schedulingApp, setSchedulingApp] = useState<{ id: string; name: string } | null>(null);
  const [expandedMobileStage, setExpandedMobileStage] = useState<ApplicationStatus | null>("PENDING");
  const [deletingApp, setDeletingApp] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteApplication = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    const result = await deleteApplication(deletingApp.id);
    setIsDeleting(false);
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete application.");
      return;
    }
    toast.success("Applicant removed.");
    setApplicants((prev) => prev.filter((a) => a.id !== deletingApp.id));
    setDeletingApp(null);
  };

  const isDiscoveryPreview = identityMode === "anonymous_preview";
  const planSlug = planUsage?.planSlug ?? "discovery";

  useEffect(() => {
    setApplicants(initialApplicants);
  }, [initialApplicants]);

  const visibleApplicantCount = initialApplicants.length;

  const handleChatWithCandidate = (candidateId: string) => {
    openThread(jobId, candidateId);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const app = applicants.find((a) => a.id === id);
    if (!app || app.status === targetStatus) return;

    if (targetStatus === "INTERVIEW_SCHEDULED") {
      setSchedulingApp({ id, name: app.name });
    } else {
      await triggerStatusChange(id, targetStatus);
    }
  };

  const triggerStatusChange = async (id: string, nextStatus: ApplicationStatus) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: nextStatus } : a))
    );

    const result = await updateApplicationStatus(id, nextStatus);
    if (!result.success) {
      toast.error(result.error ?? "Failed to update status.");
      setApplicants(initialApplicants);
      return;
    }
    toast.success("Candidate status updated.");
  };

  const filteredApplicants = useMemo(() => {
    const query = searchQuery.toLowerCase();

    let result = applicants.filter((app) => {
      const matchesSearch =
        !query ||
        app.name.toLowerCase().includes(query) ||
        app.role.toLowerCase().includes(query) ||
        app.skills.some((s) => s.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "match":
          return b.matchScore - a.matchScore;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [applicants, searchQuery, statusFilter, sortKey]);

  const tableRows: ApplicantTrackerRow[] = useMemo(
    () =>
      filteredApplicants.map((app) => ({
        id: app.id,
        candidateId: app.candidateId,
        name: app.name,
        avatarUrl: app.avatarUrl,
        matchScore: app.matchScore,
        status: app.status,
        appliedAt: app.createdAt,
        isPreview: isDiscoveryPreview,
        jobId,
      })),
    [filteredApplicants, isDiscoveryPreview, jobId]
  );

  const nearApplicantCap =
    applicantsPerJobLimit !== null &&
    applicants.length >= Math.ceil(applicantsPerJobLimit * 0.8);

  const stages: { key: ApplicationStatus; label: string; bg: string; text: string }[] = [
    { key: "PENDING", label: "Applied", bg: "bg-slate-50/50 border-slate-200/50", text: "text-slate-700" },
    { key: "UNDER_REVIEW", label: "Shortlisted", bg: "bg-emerald-50/50 border-emerald-100/50", text: "text-[#006e2f]" },
    { key: "INTERVIEW_SCHEDULED", label: "Interview", bg: "bg-blue-50/50 border-blue-100/50", text: "text-blue-800" },
    { key: "HIRED", label: "Hired", bg: "bg-violet-50/50 border-violet-100/50", text: "text-violet-850" },
    { key: "REJECTED", label: "Declined", bg: "bg-red-50/50 border-red-100/50", text: "text-red-800" },
  ];

  const content = (
    <div className="space-y-6">
      <EmployerPageHeader
        bordered
        title={`Job: ${jobTitle}`}
        badge={
          <span className="text-sm font-black bg-[#ebfdf2] text-[#006e2f] border border-[#006e2f]/15 py-1 px-3 rounded-full shrink-0">
            {applicants.length}
            {applicantsPerJobLimit !== null
              ? ` / ${applicantsPerJobLimit}`
              : ""}{" "}
            applicants
          </span>
        }
        subhead="Applicant pipeline — review, shortlist, and move candidates through your hiring stages."
      />

      {planUsage ? <PlanUsageStrip usage={planUsage} /> : null}

      {applicantsPerJobLimit !== null ? (
        <JobApplicantUsageBar
          visibleCount={visibleApplicantCount}
          hiddenCount={hiddenApplicantCount}
          capLimit={applicantsPerJobLimit}
          currentPlan={planSlug}
        />
      ) : null}

      {hiddenApplicantCount > 0 ? (
        <HiddenApplicantsBanner
          hiddenCount={hiddenApplicantCount}
          visibleCount={applicants.length}
          capLimit={applicantsPerJobLimit}
          currentPlan={planSlug}
        />
      ) : null}

      {isDiscoveryPreview ? (
        <ContextualUpgradeBanner feature="identity" currentPlan={planSlug} />
      ) : null}

      {nearApplicantCap ? (
        <ContextualUpgradeBanner feature="applicant_cap" currentPlan={planSlug} />
      ) : null}

      <ApplicantsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredApplicants.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortKey={sortKey}
        onSortKeyChange={setSortKey}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setViewMode("pipeline")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            viewMode === "pipeline"
              ? "bg-[#006e2f] text-white"
              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
        >
          <KanbanSquare className="h-3.5 w-3.5" aria-hidden />
          Pipeline
        </button>
        <button
          type="button"
          onClick={() => setViewMode("cards")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            viewMode === "cards"
              ? "bg-[#006e2f] text-white"
              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          Cards
        </button>
        <button
          type="button"
          onClick={() => setViewMode("table")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            viewMode === "table"
              ? "bg-[#006e2f] text-white"
              : "bg-white border border-slate-200 text-slate-650 hover:bg-slate-50"
          }`}
        >
          <Table2 className="h-3.5 w-3.5" aria-hidden />
          Table
        </button>
      </div>

      {filteredApplicants.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No candidates found</h3>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
            No applicant matches the filter criteria or search keyword.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Kanban Pipeline View - Desktop */}
          {viewMode === "pipeline" && (
            <div className="hidden md:flex md:flex-row md:overflow-x-auto gap-6 pb-10 w-full snap-x scrollbar-thin">
              {stages.map((stage) => {
                const stageApps = filteredApplicants.filter((a) => a.status === stage.key);
                return (
                  <div
                    key={stage.key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, stage.key)}
                    className={`flex flex-col rounded-3xl border border-slate-200/60 p-4 min-h-[580px] transition-all bg-slate-50/10 min-w-[320px] max-w-[350px] w-full flex-shrink-0 snap-center shadow-xs hover:shadow-sm ${stage.bg}`}
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <h3 className={`text-[11px] font-black uppercase tracking-wider ${stage.text}`}>
                        {stage.label}
                      </h3>
                      <span className="rounded-full bg-white border border-slate-150 px-2 py-0.5 text-[10px] font-black text-slate-500 shadow-2xs">
                        {stageApps.length}
                      </span>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-0.5">
                      {stageApps.length === 0 ? (
                        <div className="h-32 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-[10px] font-bold text-slate-400 bg-white/40">
                          Drop here
                        </div>
                      ) : (
                        stageApps.map((app) => (
                          <div
                            key={app.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", app.id);
                            }}
                            className="cursor-grab active:cursor-grabbing hover:scale-[1.01] transition-transform duration-150"
                          >
                            <ApplicantCard
                              applicant={app}
                              jobId={jobId}
                              planSlug={planSlug}
                              messagingEnabled={messagingEnabled}
                              resumeDownloadEnabled={resumeDownloadEnabled}
                              onMessageClick={
                                messagingEnabled
                                  ? () => handleChatWithCandidate(app.candidateId)
                                  : undefined
                              }
                              onDeleteClick={() => setDeletingApp({ id: app.id, name: app.name })}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Kanban Pipeline View - Mobile Accordion */}
          {viewMode === "pipeline" && (
            <div className="md:hidden space-y-3">
              {stages.map((stage) => {
                const stageApps = filteredApplicants.filter((a) => a.status === stage.key);
                const isExpanded = expandedMobileStage === stage.key;

                return (
                  <div key={stage.key} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setExpandedMobileStage(isExpanded ? null : stage.key)}
                      className="flex items-center justify-between w-full p-4 font-bold text-sm text-slate-800 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${
                          stage.key === "PENDING" ? "bg-slate-400" :
                          stage.key === "UNDER_REVIEW" ? "bg-emerald-500" :
                          stage.key === "INTERVIEW_SCHEDULED" ? "bg-blue-500" :
                          stage.key === "HIRED" ? "bg-violet-500" : "bg-red-500"
                        }`} />
                        <span>{stage.label}</span>
                        <span className="rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          {stageApps.length}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{isExpanded ? "Collapse" : "Expand"}</span>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-slate-50 bg-slate-50/20 space-y-4">
                        {stageApps.length === 0 ? (
                          <p className="text-xs text-slate-400 font-semibold text-center py-8">
                            No candidates in this stage.
                          </p>
                        ) : (
                          stageApps.map((app) => (
                            <ApplicantCard
                              key={app.id}
                              applicant={app}
                              jobId={jobId}
                              planSlug={planSlug}
                              messagingEnabled={messagingEnabled}
                              resumeDownloadEnabled={resumeDownloadEnabled}
                              onMessageClick={
                                messagingEnabled
                                  ? () => handleChatWithCandidate(app.candidateId)
                                  : undefined
                              }
                              onDeleteClick={() => setDeletingApp({ id: app.id, name: app.name })}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. Cards View */}
          {viewMode === "cards" && (
            <div className="space-y-4">
              {filteredApplicants.map((app) => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  jobId={jobId}
                  planSlug={planSlug}
                  messagingEnabled={messagingEnabled}
                  resumeDownloadEnabled={resumeDownloadEnabled}
                  onMessageClick={
                    messagingEnabled
                      ? () => handleChatWithCandidate(app.candidateId)
                      : undefined
                  }
                  onDeleteClick={() => setDeletingApp({ id: app.id, name: app.name })}
                />
              ))}
            </div>
          )}

          {/* 4. Table View */}
          {viewMode === "table" && (
            <div className="hidden lg:block overflow-x-auto">
              <ApplicantTrackerTable
                rows={tableRows}
                planSlug={planSlug}
                messagingEnabled={messagingEnabled}
              />
            </div>
          )}

          {/* Table fallback for small screen sizes */}
          {viewMode === "table" && (
            <div className="lg:hidden space-y-4">
              {filteredApplicants.map((app) => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  jobId={jobId}
                  planSlug={planSlug}
                  messagingEnabled={messagingEnabled}
                  resumeDownloadEnabled={resumeDownloadEnabled}
                  onMessageClick={
                    messagingEnabled
                      ? () => handleChatWithCandidate(app.candidateId)
                      : undefined
                  }
                  onDeleteClick={() => setDeletingApp({ id: app.id, name: app.name })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Scheduling interview popup */}
      {schedulingApp && (
        <ScheduleInterviewModal
          open={!!schedulingApp}
          onClose={() => setSchedulingApp(null)}
          applicationId={schedulingApp.id}
          candidateName={schedulingApp.name}
          onSuccess={() => {
            // Re-fetch or locally update is handled by server action revalidating paths.
            // But we can reset list/state locally to be sure.
            setSchedulingApp(null);
          }}
        />
      )}

      {deletingApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-xl max-w-md w-full w-[calc(100vw-2rem)] mx-auto animate-scaleIn border border-slate-100">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <span className="p-2 rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <h4 className="text-base font-bold text-slate-900">Delete Application?</h4>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-slate-500">
              Are you sure you want to permanently remove <strong className="text-slate-800">{deletingApp.name}</strong> from your pipeline? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeletingApp(null)}
                disabled={isDeleting}
                className="h-10 rounded-xl px-4 text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteApplication}
                disabled={isDeleting}
                className="h-10 rounded-xl px-4 text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (planUsage) {
    return <EntitlementProvider usage={planUsage}>{content}</EntitlementProvider>;
  }

  return content;
}
