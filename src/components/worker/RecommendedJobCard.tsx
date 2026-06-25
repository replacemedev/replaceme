import React from "react";
import Link from "next/link";
import { DollarSign, Clock, Building2 } from "lucide-react";
import { RecommendedJob } from "@/types/worker";

interface RecommendedJobCardProps {
  job: RecommendedJob;
  onApply?: (jobId: string) => void;
}

export function RecommendedJobCard({ job, onApply }: RecommendedJobCardProps) {
  const isMatch = job.match_score && job.match_score >= 80;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-xs transition-shadow gap-6 select-none">
      {/* Job Details */}
      <div className="space-y-2">
        <h4 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
          {job.title}
        </h4>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
          {/* Company Name */}
          <span className="flex items-center gap-1">
            <Building2 size={14} className="text-slate-400" />
            {job.company_name}
          </span>

          {/* Salary */}
          <span className="flex items-center gap-1">
            <span className="text-slate-400">₱</span>
            {Number(job.monthly_salary).toLocaleString("en-US")}/mo
          </span>

          {/* Job Type */}
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-slate-400" />
            {job.employment_type}
          </span>

          {/* Match Badge */}
          {isMatch && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-[#006e2f] bg-[#ebfdf2] border border-[#006e2f]/20 uppercase tracking-wider">
              MATCH
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex-shrink-0">
        {onApply ? (
          <button
            onClick={() => onApply(job.id)}
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-[#006e2f] hover:text-white bg-transparent hover:bg-[#006e2f] border border-[#006e2f] rounded-xl transition-all duration-150 cursor-pointer select-none"
          >
            Apply Now
          </button>
        ) : (
          <Link
            href={`/worker/jobs/${job.id}`}
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-bold text-[#006e2f] hover:text-white bg-transparent hover:bg-[#006e2f] border border-[#006e2f] rounded-xl transition-all duration-150 cursor-pointer select-none"
          >
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}
