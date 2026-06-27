"use client";

import React from "react";
import Link from "next/link";
import { Applicant } from "@/types/employer/applicants";
import { ApplicationStatus } from "@/types/applications";
import { ApplicantCard } from "./ApplicantCard";

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
}

export function ApplicantKanban({
  applicants,
  jobId,
  onMessageClick,
  messagingEnabled = true,
  planSlug,
}: ApplicantKanbanProps) {
  return (
    <div
      className="grid gap-4 overflow-x-auto pb-2 md:grid-cols-5"
      data-testid="applicant-kanban"
    >
      {KANBAN_COLUMNS.map((column) => {
        const columnApps = applicants.filter((a) => a.status === column.status);

        return (
          <section
            key={column.status}
            className="min-w-[220px] rounded-2xl border border-slate-100 bg-slate-50/80 p-3"
            aria-label={column.label}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-600">
                {column.label}
              </h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {columnApps.length}
              </span>
            </header>

            <div className="space-y-3">
              {columnApps.length === 0 ? (
                <p className="px-1 text-[11px] font-medium text-slate-400">
                  No candidates
                </p>
              ) : (
                columnApps.map((app) => (
                    <ApplicantCard
                      key={app.id}
                      applicant={app}
                      jobId={jobId}
                      planSlug={planSlug}
                      messagingEnabled={messagingEnabled}
                      onMessageClick={
                        messagingEnabled
                          ? () => onMessageClick(app.candidateId)
                          : undefined
                      }
                    />
                  ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
