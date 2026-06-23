import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Briefcase, Users, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecentJobs, getRecentApplicants } from "@/actions/employer/dashboard";
import { JobCard } from "@/components/employer/JobCard";
import { RecentApplicantRow } from "@/components/employer/RecentApplicantRow";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

export default async function EmployerDashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch employer profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/login");
  }

  const employerName = profile.first_name 
    ? (profile.last_name ? `${profile.first_name} ${profile.last_name}` : profile.first_name) 
    : "Employer";

  // Parallel data fetching for premium dashboard widgets
  const [jobs, recentApplicants] = await Promise.all([
    getRecentJobs(profile.id),
    getRecentApplicants(profile.id),
  ]);

  // Calculate active jobs count for the red badge
  const activeJobsCount = jobs.filter(
    (job) => job.status.toLowerCase() === "active"
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Top Header Row - Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            Welcome back, {employerName}!
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
            Manage your specialized job postings and review recent applications.
          </p>
        </div>
        <Link
          href="/jobs/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] rounded-xl transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer select-none"
        >
          <Plus size={18} />
          Post a New Job
        </Link>
      </div>

      {/* Dashboard Main Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) - Job Posts & Recent Applicants */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Section: Your Job Posts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Your Job Posts
                </h2>
                {jobs.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-extrabold text-white bg-red-500 rounded-full select-none">
                    {jobs.length}
                  </span>
                )}
              </div>
            <Link
              href="/jobs"
              className="text-sm font-semibold text-[#006e2f] hover:text-[#005321] hover:underline transition-colors"
            >
              View All
            </Link>
            </div>

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Briefcase size={22} />}
                description="You haven't posted any jobs yet. Create your first listing to start hiring."
                actionLabel="Post a New Job"
                actionHref="/jobs/create"
              />
            )}
          </div>

          {/* Section: Recent Applications */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recent Applications
            </h2>

            {recentApplicants.length > 0 ? (
              <div className="flex flex-col gap-4">
                {recentApplicants.map((applicant) => (
                  <RecentApplicantRow key={applicant.id} applicant={applicant} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users size={22} />}
                description="Recent applicant profiles will appear here once candidates apply to your jobs."
              />
            )}
          </div>

        </div>

        {/* Right Column (1/3 width) - Your Workers sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Your Workers
          </h2>
          <EmptyState
            icon={<UserCheck size={22} />}
            description="Your hires will appear here"
            actionLabel="BROWSE TALENT POOL"
            actionHref="/employer/dashboard"
          />
        </div>
      </div>

      {/* Added Section at the Bottom - Quick Insights & Account Resources */}
      <div className="border-t border-slate-200 pt-10 mt-6 space-y-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Quick Insights & Account Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Subscription Benefits & Usage */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Subscription Benefits & Usage
              </h3>
              <span className="text-[10px] font-extrabold text-[#006e2f] bg-[#ebfdf2] border border-[#006e2f]/20 px-2 py-0.5 rounded-full uppercase">
                Active Plan
              </span>
            </div>

            {/* Benefit Bar 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Candidate Unlocks</span>
                <span>12 / 75 Used</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#006e2f] h-full rounded-full" style={{ width: "16%" }} />
              </div>
            </div>

            {/* Benefit Bar 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Active Job Posts</span>
                <span>{activeJobsCount} / 3 Used</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#006e2f] h-full rounded-full" style={{ width: `${Math.min((activeJobsCount / 3) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Card 2: Exclusive Hiring Toolkit */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Exclusive Hiring Toolkit
            </h3>
            <ul className="space-y-3 text-xs font-semibold text-slate-600">
              <li>
                <Link 
                  href="/hiring-guide"
                  className="flex items-center gap-2 hover:text-[#006e2f] transition-colors"
                >
                  <span>📋</span>
                  <span>Download Remote Hiring Guide</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/messages"
                  className="flex items-center gap-2 hover:text-[#006e2f] transition-colors"
                >
                  <span>💬</span>
                  <span>Read Messaging & Interview Templates</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/hired"
                  className="flex items-center gap-2 hover:text-[#006e2f] transition-colors"
                >
                  <span>⚖️</span>
                  <span>View Contract & Compliance Checklists</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
}
