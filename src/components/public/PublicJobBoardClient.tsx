"use client";

import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import Link from "next/link";
import { LogoImage } from "@/components/shared/media/LogoImage";
import { daysSincePosted } from "@/types/job-search";
import { formatMoney } from "@/lib/format/currency";
import type { PublicJobListing } from "@/types/public-growth";

interface PublicJobBoardClientProps {
  jobs: PublicJobListing[];
}

function formatRate(hourlyRate: number, currency: string = "PHP") {
  if (hourlyRate <= 0) return "Rate posted on apply";
  return formatMoney(hourlyRate, currency, {
    perHour: true,
    maximumFractionDigits: 0,
  });
}

function cleanDescriptionSnippet(text: string | null): string {
  if (!text) return "No description provided.";
  const cleaned = text
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`]/g, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "No description provided.";
}

export function PublicJobBoardClient({ jobs }: PublicJobBoardClientProps) {
  return (
    <div
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 ${PUBLIC_PAGE_TOP}`}
    >
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Browse Jobs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2">
          Explore active roles from verified employers. Sign up free to apply.
        </p>
      </header>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
          <p className="text-sm sm:text-base font-semibold text-slate-800">
            No active jobs posted yet
          </p>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Check back soon or create a worker profile to get notified.
          </p>
          <Link
            href="/signup"
            className="inline-flex mt-5 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#006e2f] rounded-xl hover:bg-[#005c26] transition-colors"
          >
            Create free account
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {jobs.map((job) => (
            <li key={job.id} className="h-full">
              <Link
                href={`/jobs/${job.id}`}
                className="group flex flex-col justify-between h-full bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
              >
                <div>
                  {/* Header: Company Logo, Job Title, Company Name */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 overflow-hidden rounded-xl">
                      <LogoImage
                        src={job.companyLogoUrl}
                        alt={`${job.companyName} logo`}
                        label={job.companyName}
                        sizePx={48}
                        rounded="xl"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#006e2f] transition-colors line-clamp-1">
                        {job.title}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-slate-500 truncate mt-0.5">
                        {job.companyName}
                      </p>
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4 font-normal">
                    <span>{daysSincePosted(job.createdAt)}</span>
                    <span className="text-slate-300">•</span>
                    <span>{job.employmentType}</span>
                    <span className="text-slate-300">•</span>
                    <span>{job.location}</span>
                  </div>

                  {/* Description Snippet */}
                  <p className="line-clamp-2 text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                    {cleanDescriptionSnippet(job.description)}
                  </p>
                </div>

                {/* Footer: Salary & Action CTA */}
                <div className="mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <p className="text-sm sm:text-base font-bold text-[#006e2f]">
                    {formatRate(job.hourlyRate, job.salaryCurrency)}
                  </p>
                  <span className="inline-flex items-center justify-center bg-[#006e2f] text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-[#005c26] group-hover:bg-[#005c26] transition-colors shadow-sm shrink-0">
                    View Details
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
