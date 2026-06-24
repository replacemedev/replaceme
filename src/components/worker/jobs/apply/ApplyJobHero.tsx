import Link from "next/link";
import type { ApplyJobSummary } from "@/types/job-application";

interface ApplyJobHeroProps {
  job: ApplyJobSummary;
}

export function ApplyJobHero({ job }: ApplyJobHeroProps) {
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

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 sm:pb-24">
        <Link
          href={`/worker/jobs/${job.id}`}
          className="inline-block text-sm font-semibold text-white/90 hover:text-white transition-colors mb-8"
        >
          ← Back to job details
        </Link>

        <span className="inline-flex items-center rounded-full bg-[#4ade80] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0a4a29]">
          {job.categoryBadge}
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight leading-tight">
          {job.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base font-medium text-white/85">
          {job.companyName}
        </p>
      </div>
    </header>
  );
}
