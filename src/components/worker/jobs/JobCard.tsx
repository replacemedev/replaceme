"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { Bookmark, Clock, Loader2, Sparkles } from "lucide-react";
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

function companyInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

function avatarColor(name: string) {
  return avatarColors[name.charCodeAt(0) % avatarColors.length];
}

export function JobCard({ job, onSavedChange }: JobCardProps) {
  const [isPending, startTransition] = useTransition();
  const initial = companyInitial(job.companyName);
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

  return (
    <article className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all duration-200 hover:border-emerald-200 hover:shadow-md">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`relative shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden ${colorClass}`}
          >
            {job.companyLogoUrl ? (
              <Image
                src={job.companyLogoUrl}
                alt={`${job.companyName} logo`}
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight line-clamp-2">
              {job.title}
            </h3>
            <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
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

      <div className="flex flex-wrap gap-1.5 mb-3">
        {isPriorityListing ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 uppercase tracking-wide">
            <Sparkles className="h-3 w-3" aria-hidden />
            Priority
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
          {formatEmploymentBadge(job.employmentType)}
        </span>
        <span className="inline-flex items-center rounded-md bg-[#ebfdf2] border border-[#006e2f]/15 px-2 py-0.5 text-[10px] font-bold text-[#006e2f] uppercase tracking-wide">
          {formatSalaryBadge(job.monthlySalary, job.hoursPerWeek)}
        </span>
        <span className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase tracking-wide">
          {locationLabel}
        </span>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
        {job.description}
      </p>

      <footer className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {daysSincePosted(job.createdAt)}
          </span>
          {job.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="inline-flex rounded-md bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
            >
              {skill}
            </span>
          ))}
        </div>

        <Link
          href={`/worker/jobs/${job.id}`}
          className="text-sm font-bold text-[#006e2f] hover:translate-x-0.5 transition-transform shrink-0"
        >
          View Details →
        </Link>
      </footer>
    </article>
  );
}
