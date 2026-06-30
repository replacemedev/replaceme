"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bookmark, Loader2, MapPin } from "lucide-react";
import { LogoImage } from "@/components/shared/media/LogoImage";
import { toast } from "sonner";
import { unsaveJob } from "@/actions/saved-jobs";
import {
  SavedJob,
  formatEmploymentPill,
  formatSavedJobSalary,
} from "@/types/saved-jobs";

interface SavedJobCardProps {
  job: SavedJob;
}

const avatarColors = [
  "bg-[#ebfdf2] text-[#006e2f]",
  "bg-blue-50 text-blue-700",
  "bg-violet-50 text-violet-700",
  "bg-amber-50 text-amber-700",
];

function avatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

export function SavedJobCard({ job }: SavedJobCardProps) {
  const [isPending, startTransition] = useTransition();
  const colorClass = avatarColor(job.companyName);

  const handleUnsave = () => {
    startTransition(async () => {
      const result = await unsaveJob(job.id);
      if (!result.success) {
        toast.error(result.error ?? "Could not remove bookmark.");
        return;
      }
      toast.success("Job removed from saved list.");
    });
  };

  return (
    <article className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-emerald-200/80 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div className="relative shrink-0 w-12 h-12 overflow-hidden rounded-full">
          <LogoImage
            src={job.companyLogoUrl}
            alt={`${job.companyName} logo`}
            label={job.companyName}
            sizePx={48}
            rounded="full"
            colorClass={`flex items-center justify-center font-bold text-sm ${colorClass}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {job.title}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5 truncate">
            {job.companyName}
          </p>
          <p className="inline-flex items-center gap-1 mt-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="truncate">{job.location}</span>
          </p>

          <div className="flex flex-wrap gap-2 mt-3 md:hidden">
            <span className="inline-flex rounded-full bg-[#ebfdf2] border border-[#006e2f]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#006e2f]">
              {formatSavedJobSalary(job.monthlySalary, job.hoursPerWeek, job.salaryCurrency)}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 uppercase">
              {formatEmploymentPill(job.employmentType)}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-wrap items-center gap-2 shrink-0">
        <span className="inline-flex rounded-full bg-[#ebfdf2] border border-[#006e2f]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#006e2f]">
          {formatSavedJobSalary(job.monthlySalary, job.hoursPerWeek, job.salaryCurrency)}
        </span>
        <span className="inline-flex rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 uppercase">
          {formatEmploymentPill(job.employmentType)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center md:items-end gap-2 shrink-0">
        <button
          type="button"
          onClick={handleUnsave}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Remove from saved jobs"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark className="h-4 w-4 fill-[#006e2f] text-[#006e2f]" aria-hidden />
          )}
          Unsave
        </button>

        {job.hasApplied ? (
          <Link
            href={`/worker/jobs/${job.id}`}
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl border border-[#006e2f]/30 text-[#006e2f] text-sm font-bold hover:bg-[#ebfdf2] transition-colors text-center"
          >
            View Details
          </Link>
        ) : (
          <Link
            href={`/worker/jobs/${job.id}/apply`}
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#006e2f] hover:bg-[#005c26] text-white text-sm font-bold transition-colors text-center"
          >
            Apply Now
          </Link>
        )}
      </div>
    </article>
  );
}
