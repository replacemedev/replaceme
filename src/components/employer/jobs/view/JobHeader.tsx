"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { MapPin, Clock, DollarSign, Share2, Edit3, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { deactivateJob } from "@/actions/employer/jobs";
import { useRouter } from "next/navigation";

interface JobHeaderProps {
  jobId: string;
  title: string;
  status: "Active" | "Closed" | "Pending Review";
  location: string;
  employmentType: string;
  monthlySalary: number;
}

export function JobHeader({
  jobId,
  title,
  status,
  location,
  employmentType,
  monthlySalary,
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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
      {/* Title & Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBadgeClasses}`}>
            {status}
          </span>
        </div>

        {/* Metadata info row */}
        <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-slate-400" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-slate-400" />
            <span>{employmentType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={16} className="text-slate-400" />
            <span>${monthlySalary.toLocaleString()}/mo</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/employer/jobs/${jobId}/applicants`}
          className="h-10 px-4 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Users size={14} />
          View Pipeline
        </Link>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Share2 size={14} className="text-slate-400" />
          Share
        </button>

        {/* Edit Button */}
        <Link
          href={`/employer/jobs/create?edit=${jobId}`}
          className="h-10 px-4 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/10 text-emerald-700 font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Edit3 size={14} />
          Edit Job
        </Link>

        {/* Deactivate Button */}
        {status !== "Closed" && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeactivate}
            className="h-10 w-10 rounded-xl border border-red-150 hover:border-red-200 bg-white hover:bg-red-50/30 text-red-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            aria-label="Deactivate job listing"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin text-red-400" />
            ) : (
              <X size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
