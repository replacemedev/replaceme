import Link from "next/link";
import { Flag } from "lucide-react";
import { WorkerJobDetails, formatPostedDate } from "@/types/job-details";
import { ApplyActionButtons } from "./ApplyActionButtons";

interface JobDetailsHeroProps {
  job: WorkerJobDetails;
}

export function JobDetailsHero({ job }: JobDetailsHeroProps) {
  return (
    <header className="bg-[#0a4a29] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-20 sm:pb-24">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/worker/jobs"
            className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
          >
            ← Back to search results
          </Link>
          <button
            type="button"
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

          <ApplyActionButtons
            jobId={job.id}
            isSaved={job.isSaved}
            hasApplied={job.hasApplied}
          />
        </div>
      </div>
    </header>
  );
}
