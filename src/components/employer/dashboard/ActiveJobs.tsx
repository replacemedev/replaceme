import React from "react";
import Link from "next/link";
import { Briefcase, ChevronRight, Plus } from "lucide-react";
import { JobPost } from "@/types/employer/dashboard";

interface ActiveJobsProps {
  jobs: JobPost[];
}

export function ActiveJobs({ jobs }: ActiveJobsProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Active Job Posts</h2>
        <Link 
          href="/employer/jobs" 
          className="text-sm font-bold text-[#22c55e] hover:underline flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {jobs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Briefcase size={14} /> {job.type}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span>{job.postedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-900">{job.applicantsCount}</p>
                    <p className="text-xs text-slate-500">Applicants</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    {job.status}
                  </span>
                  <Link
                    href={`/employer/jobs/${job.id}`}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#22c55e]"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <Briefcase className="text-[#22c55e]" size={22} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No active job posts yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Create your first job listing to connect with remote talent across industries.
            </p>
            <Link 
              href="/employer/jobs/create" 
              className="mt-4 bg-[#22c55e] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#16a34a] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 shadow-sm focus-visible:outline-2 focus-visible:outline-[#22c55e]"
            >
              <Plus size={14} />
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
