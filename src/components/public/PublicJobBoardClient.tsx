"use client";

import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import Link from "next/link";
import { LogoImage } from "@/components/shared/media/LogoImage";
import type { PublicJobListing } from "@/types/public-growth";

interface PublicJobBoardClientProps {
  jobs: PublicJobListing[];
}

function formatRate(hourlyRate: number) {
  if (hourlyRate <= 0) return "Rate posted on apply";
  return `$${hourlyRate.toFixed(0)}/hr`;
}

export function PublicJobBoardClient({ jobs }: PublicJobBoardClientProps) {
  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-8 pb-10 ${PUBLIC_PAGE_TOP}`}>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Browse Jobs</h1>
        <p className="text-sm text-slate-500 mt-2">
          Explore active roles from verified employers. Sign up free to apply.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No active jobs posted yet
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Check back soon or create a worker profile to get notified.
          </p>
          <Link
            href="/signup"
            className="inline-flex mt-5 px-5 py-2.5 text-sm font-bold text-white bg-[#006e2f] rounded-xl hover:bg-[#005c26]"
          >
            Create free account
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/jobs/${job.id}`}
                className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg">
                    <LogoImage
                      src={job.companyLogoUrl}
                      alt={`${job.companyName} logo`}
                      label={job.companyName}
                      sizePx={40}
                      rounded="lg"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {job.title}
                    </h2>
                    <p className="text-sm text-slate-500 truncate">
                      {job.companyName}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-slate-500">
                  {job.employmentType} · {job.location}
                </p>
                <p className="mt-2 text-sm font-bold text-[#006e2f]">
                  {formatRate(job.hourlyRate)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
