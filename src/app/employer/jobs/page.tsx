import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecentJobs } from "@/actions/employer/dashboard";
import { JobCard } from "@/components/employer/JobCard";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata = {
  title: "Job Posts | ReplaceMe",
  description: "View and manage all your employer job listings.",
};

export const dynamic = "force-dynamic";

export default async function EmployerJobsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/login");
  }

  const jobs = await getRecentJobs(profile.id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
            Your Job Posts
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
            View and manage every listing you have published.
          </p>
        </div>
        <Link
          href="/employer/jobs/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-xl transition-all duration-150 shadow-xs hover:shadow-md"
        >
          <Plus size={18} />
          Post a New Job
        </Link>
      </div>

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase size={22} />}
          description="You haven't posted any jobs yet. Create your first listing to start hiring."
          actionLabel="Post a New Job"
          actionHref="/employer/jobs/create"
        />
      )}
    </div>
  );
}
