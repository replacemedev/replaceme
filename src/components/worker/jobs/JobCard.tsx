"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Bookmark, Clock, Loader2, Sparkles } from "lucide-react";
import { LogoImage } from "@/components/shared/media/LogoImage";
import { toggleSavedJob } from "@/actions/worker/job-search";
import {
  JobSearchResult,
  daysSincePosted,
  formatEmploymentBadge,
  formatSalaryBadge,
} from "@/types/job-search";
import { toast } from "sonner";

interface JobCardProps {
  job: JobSearchResult;
  onSavedChange: (jobId: string, saved: boolean) => void;
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

export function JobCard({ job, onSavedChange }: JobCardProps) {
  const [isPending, startTransition] = useTransition();
  const colorClass = avatarColor(job.companyName);
  const locationLabel = job.location.toLowerCase().includes("remote")
    ? `REMOTE (${job.location.replace(/remote/i, "").trim() || "PH"})`.toUpperCase()
    : job.location.toUpperCase();
  const isPriorityListing = (job.priorityScore ?? 0) > 0;

  const handleSave = () => {
    startTransition(async () => {
      const result = await toggleSavedJob(job.id);
      if (!result.success) {
        toast.error(result.error ?? "Could not update bookmark.");
        return;
      }
      onSavedChange(job.id, result.saved);
    });
  };

  const cardStyles =
    "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-200 hover:shadow-md";

  return (
    <article className={`flex flex-col h-full rounded-2xl p-5 md:p-8 transition-all duration-200 gap-5 ${cardStyles}`}>
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="relative shrink-0 w-12 h-12 rounded-xl overflow-hidden">
            <LogoImage
              src={job.companyLogoUrl}
              alt={`${job.companyName} logo`}
              label={job.companyName}
              sizePx={48}
              rounded="xl"
              colorClass={`flex items-center justify-center font-bold text-sm ${colorClass}`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-bold text-slate-900 break-words leading-snug">
              {job.title}
            </h3>
            <p className="text-xs font-semibold text-slate-500 truncate mt-1">
              {job.companyName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-[#006e2f] hover:bg-[#ebfdf2] transition-colors disabled:opacity-50 cursor-pointer"
          aria-label={job.isSaved ? "Remove bookmark" : "Save job"}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bookmark
              className={`h-4 w-4 ${job.isSaved ? "fill-[#006e2f] text-[#006e2f]" : ""}`}
            />
          )}
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {isPriorityListing ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 tracking-wide whitespace-nowrap">
            <Sparkles className="h-3 w-3" aria-hidden />
            Priority
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 uppercase tracking-wide whitespace-nowrap">
          {formatEmploymentBadge(job.employmentType)}
        </span>
        <span className="inline-flex items-center rounded-full bg-[#ebfdf2] border border-[#006e2f]/15 px-2.5 py-0.5 text-xs font-semibold text-[#006e2f] uppercase tracking-wide whitespace-nowrap">
          {formatSalaryBadge(job.monthlySalary, job.hoursPerWeek, job.salaryCurrency)}
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-650 uppercase tracking-wide whitespace-nowrap">
          {locationLabel}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-3 flex-1">
        {job.description}
      </p>

      <footer className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto w-full">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {daysSincePosted(job.createdAt)}
          </span>
          {job.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500 whitespace-nowrap"
            >
              {skill}
            </span>
          ))}
        </div>

        <Link
          href={`/worker/jobs/${job.id}`}
          className="text-sm font-bold text-[#006e2f] hover:translate-x-0.5 transition-transform shrink-0 whitespace-nowrap"
        >
          View Details →
        </Link>
      </footer>
    </article>
  );
}
