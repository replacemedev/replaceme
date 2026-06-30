import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobOverviewCard } from "@/components/worker/jobs/details/JobOverviewCard";
import { JobSidebarCards } from "@/components/worker/jobs/details/JobSidebarCards";
import { PublicJobAuthWall } from "@/components/public/PublicJobAuthWall";
import { formatPostedDate, type WorkerJobDetails } from "@/types/job-details";

interface PublicJobDetailProps {
  job: WorkerJobDetails;
}

export function PublicJobDetail({ job }: PublicJobDetailProps) {
  return (
    <div className="min-h-screen bg-[#f4f7f6] pb-28 md:pb-12">
      <header className="bg-[#0a4a29] text-white">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pb-20 lg:px-8">
          <Link
            href="/jobs"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to job board
          </Link>

          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              {job.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/80 sm:text-base">
              {job.companyName} • Posted {formatPostedDate(job.createdAt)}
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <JobOverviewCard job={job} />
            <PublicJobAuthWall jobId={job.id} variant="inline" />
          </div>
          <JobSidebarCards job={job} />
        </div>
      </main>

      <PublicJobAuthWall jobId={job.id} variant="sticky" />
    </div>
  );
}
