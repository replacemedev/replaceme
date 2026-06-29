"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LayoutGrid, Table2 } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import type { EmployerPlanUsage } from "@/lib/server/entitlements";
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
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicantStatusFilter>("all");
  const [sortKey, setSortKey] = useState<ApplicantSortKey>("newest");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const isDiscoveryPreview = identityMode === "anonymous_preview";
  const planSlug = planUsage?.planSlug ?? "discovery";

  useEffect(() => {
    setApplicants(initialApplicants);
  }, [initialApplicants]);

  const visibleApplicantCount = initialApplicants.length;

  const handleChatWithCandidate = (candidateId: string) => {
    const applicant = applicants.find((a) => a.candidateId === candidateId);
    const threadId = applicant?.messagingThreadId;
    router.push(
      threadId
        ? `/employer/messages?threadId=${threadId}`
        : "/employer/messages"
    );
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
          onClick={() => setViewMode("cards")}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            viewMode === "cards"
              ? "bg-[#006e2f] text-white"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
      ) : viewMode === "table" ? (
        <div className="hidden lg:block overflow-x-auto">
          <ApplicantTrackerTable
            rows={tableRows}
            planSlug={planSlug}
            messagingEnabled={messagingEnabled}
          />
        </div>
      ) : null}

      {filteredApplicants.length > 0 ? (
        <div
          className={
            viewMode === "cards" ? "space-y-4" : "space-y-4 lg:hidden"
          }
        >
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
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  if (planUsage) {
    return <EntitlementProvider usage={planUsage}>{content}</EntitlementProvider>;
  }

  return content;
}
