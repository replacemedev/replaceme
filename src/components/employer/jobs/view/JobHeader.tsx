"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { MapPin, Clock, DollarSign, Share2, Edit3, X, Loader2, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { deactivateJob } from "@/actions/employer/jobs";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format/currency";

interface JobHeaderProps {
  jobId: string;
  title: string;
  status: "Active" | "Closed" | "Pending Review";
  location: string;
  employmentType: string;
  hourlyRate: number;
  monthlySalary: number;
  salaryCurrency: string;
  isPriorityListing?: boolean;
}

export function JobHeader({
  jobId,
  title,
  status,
  location,
  employmentType,
  hourlyRate,
  monthlySalary,
  salaryCurrency,
  isPriorityListing = false,
}: JobHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/worker/jobs/${jobId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success("Job post link copied to clipboard!");
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard.");
      });
  };

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate this job listing? It will no longer be visible to candidates.")) {
      startTransition(async () => {
        const toastId = toast.loading("Deactivating job post...");
        try {
          const result = await deactivateJob(jobId);
          if (result.error) {
            toast.error(result.error, { id: toastId });
          } else if (result.success) {
            toast.success(result.message, { id: toastId });
            router.refresh();
          }
        } catch (error) {
          toast.error("An unexpected error occurred. Please try again.", { id: toastId });
        }
      });
    }
  };

  // Determine status badge classes
  let statusBadgeClasses = "";
  switch (status) {
    case "Active":
      statusBadgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "Closed":
      statusBadgeClasses = "bg-red-50 text-red-700 border-red-200";
      break;
    case "Pending Review":
      statusBadgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
      break;
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-20 z-20 -mx-1 px-1 py-3 bg-[#fafdfb]/95 backdrop-blur-sm border-b border-slate-100/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title & Info */}
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 ${statusBadgeClasses}`}>
              {status}
            </span>
            {isPriorityListing ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-700 shadow-sm shrink-0">
                <Sparkles className="h-3 w-3" aria-hidden />
                Priority listing
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} className="text-slate-400" aria-hidden />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-slate-400" aria-hidden />
              <span>{employmentType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={16} className="text-slate-400" aria-hidden />
              <span className="text-emerald-600 font-bold">{formatMoney(hourlyRate, salaryCurrency, { perHour: true })}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 text-xs">{formatMoney(monthlySalary, salaryCurrency)}/mo</span>
            </div>
          </div>
        </div>

        {/* Action Buttons — desktop only; mobile uses JobDetailStickyActions */}
        <div className="hidden lg:flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/employer/jobs/${jobId}/applicants`}
            className="h-10 px-4 rounded-xl bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Users size={14} aria-hidden />
            View Pipeline
          </Link>

          <Link
            href={`/employer/jobs/create?edit=${jobId}`}
            className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Edit3 size={14} aria-hidden />
            Edit Job
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Share2 size={14} className="text-slate-400" aria-hidden />
            Share
          </button>

          {status !== "Closed" && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleDeactivate}
              className="h-10 px-4 rounded-xl border border-red-200 hover:border-red-300 bg-white hover:bg-red-50/50 text-red-600 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              aria-label="Pause job listing"
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" aria-hidden />
              ) : (
                <X size={14} aria-hidden />
              )}
              Pause
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
