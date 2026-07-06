"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag } from "lucide-react";
import { WorkerJobDetails, formatPostedDate } from "@/types/job-details";
import { ApplyActionButtons } from "./ApplyActionButtons";
import { ReportJobModal } from "./ReportJobModal";

interface JobDetailsHeroProps {
  job: WorkerJobDetails;
}

export function JobDetailsHero({ job }: JobDetailsHeroProps) {
  const [isReportOpen, setIsReportOpen] = useState(false);

  return (
    <header className="relative bg-[#0a4a29] text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M10 0h2v2h-2V0zm0 18h2v2h-2v-2zM0 10h2v2H0v-2zm18 0h2v2h-2v-2zM4 4h2v2H4V4zm10 0h2v2h-2V4zM4 14h2v2H4v-2zm10 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 sm:pb-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/worker/jobs"
            className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
          >
            ← Back to search results
          </Link>
          <button
            type="button"
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden />
            Report
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base font-medium text-white/80">
              {job.companyName} • Posted on {formatPostedDate(job.createdAt)}
            </p>
          </div>

          <div className="hidden lg:block shrink-0">
            <ApplyActionButtons
              jobId={job.id}
              isSaved={job.isSaved}
              hasApplied={job.hasApplied}
            />
          </div>
        </div>
      </div>

      <ReportJobModal
        open={isReportOpen}
        jobId={job.id}
        jobTitle={job.title}
        onClose={() => setIsReportOpen(false)}
      />
    </header>
  );
}

