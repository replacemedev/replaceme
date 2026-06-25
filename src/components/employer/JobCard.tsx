import React from "react";
import Link from "next/link";
import { JobPost } from "@/types/employer";

interface JobCardProps {
  job: JobPost;
}

export function JobCard({ job }: JobCardProps) {
  const formattedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300 gap-5 relative overflow-hidden">
      {/* Visual Accent top border showing on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#006e2f] transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

      {/* Top Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold text-[#006e2f] bg-[#ebfdf2] border border-[#006e2f]/25 tracking-wide uppercase select-none">
            ACTIVE
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Created on {formattedDate}
          </span>
        </div>

        <Link
          href={`/employer/jobs/${job.id}`}
          className="block text-lg font-bold text-[#006e2f] hover:text-[#005321] hover:underline leading-snug tracking-tight truncate-2-lines transition-colors"
        >
          {job.title}
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center gap-6 text-sm py-1 border-y border-slate-50 select-none">
        <span className="text-slate-500 font-medium">
          <strong className="text-slate-900 font-extrabold text-base mr-1">{job.applicants_count}</strong> Applicants
        </span>
        <span className="text-slate-500 font-medium">
          <strong className="text-slate-900 font-extrabold text-base mr-1">{job.hits_count}</strong> Hits
        </span>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-3 pt-1 text-xs font-bold text-slate-400 select-none">
        <Link 
          href={`/employer/jobs/${job.id}`}
          className="text-[#006e2f] hover:text-[#005321] transition-colors uppercase hover:underline"
        >
          VIEW
        </Link>
        <span className="text-slate-200">|</span>
        <button 
          className="text-[#006e2f] hover:text-[#005321] transition-colors uppercase hover:underline cursor-pointer"
        >
          DELETE
        </button>
        <span className="text-slate-200">|</span>
        <button 
          className="text-[#006e2f] hover:text-[#005321] transition-colors uppercase hover:underline cursor-pointer"
        >
          REFRESH
        </button>
      </div>
    </div>
  );
}
