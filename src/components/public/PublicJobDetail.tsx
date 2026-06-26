import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobOverviewCard } from "@/components/worker/jobs/details/JobOverviewCard";
import type { WorkerJobDetails } from "@/types/job-details";

interface PublicJobDetailProps {
  job: WorkerJobDetails;
}

export function PublicJobDetail({ job }: PublicJobDetailProps) {
  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <header className="bg-[#0a4a29] text-white pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-16">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft size={14} />
            Back to job board
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{job.title}</h1>
          <p className="mt-2 text-sm text-white/80">{job.companyName}</p>
          <Link
            href="/signup"
            className="inline-flex mt-6 px-6 py-3 text-sm font-bold text-[#0a4a29] bg-white rounded-xl hover:bg-slate-100"
          >
            Sign up to apply
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-8 -mt-8 pb-12 relative z-10">
        <JobOverviewCard job={job} />
      </main>
    </div>
  );
}
