"use client";

import React from "react";
import { GripVertical } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import { ApplicationStatus } from "@/types/applications";
import { ApplicantCard } from "./ApplicantCard";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

const KANBAN_COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: "PENDING", label: "New" },
  { status: "UNDER_REVIEW", label: "Review" },
  { status: "INTERVIEW_SCHEDULED", label: "Interview" },
  { status: "HIRED", label: "Hired" },
  { status: "REJECTED", label: "Declined" },
];

interface ApplicantKanbanProps {
  applicants: Applicant[];
  jobId: string;
  onMessageClick: (candidateId: string) => void;
  messagingEnabled?: boolean;
  planSlug: string;
  resumeDownloadEnabled?: boolean;
}

export function ApplicantKanban({
  applicants,
  jobId,
  onMessageClick,
  messagingEnabled = true,
  planSlug,
  resumeDownloadEnabled = true,
}: ApplicantKanbanProps) {
  return (
    <div
      className="flex gap-4 overflow-x-auto pb-4"
      data-testid="applicant-kanban"
    >
      {KANBAN_COLUMNS.map((column) => {
        const columnApps = applicants.filter((a) => a.status === column.status);

        return (
          <section
            key={column.status}
            className={`w-[min(100%,280px)] shrink-0 ${EMPLOYER_CARD} rounded-lg bg-slate-50/80 p-3`}
            aria-label={column.label}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-600">
                {column.label}
              </h3>
              <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 tabular-nums">
                {columnApps.length}
              </span>
            </header>

            <div className="space-y-3 min-h-[80px]">
              {columnApps.length === 0 ? (
                <p className="px-1 text-[11px] font-medium text-slate-400">
                  No candidates
                </p>
              ) : (
                columnApps.map((app) => (
                  <div
                    key={app.id}
                    className="group relative cursor-grab active:cursor-grabbing"
                    title="Drag to reorder (coming soon)"
                  >
                    <span
                      className="absolute left-1 top-3 z-10 opacity-0 group-hover:opacity-60 text-slate-400 pointer-events-none"
                      aria-hidden
                    >
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <ApplicantCard
                      applicant={app}
                      jobId={jobId}
                      planSlug={planSlug}
                      messagingEnabled={messagingEnabled}
                      resumeDownloadEnabled={resumeDownloadEnabled}
                      onMessageClick={
                        messagingEnabled
                          ? () => onMessageClick(app.candidateId)
                          : undefined
                      }
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
