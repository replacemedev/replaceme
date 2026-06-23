import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkerJobDetails } from "@/actions/worker/job-details";
import { JobDetailsHero } from "@/components/worker/jobs/details/JobDetailsHero";
import { JobOverviewCard } from "@/components/worker/jobs/details/JobOverviewCard";
import { JobSidebarCards } from "@/components/worker/jobs/details/JobSidebarCards";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = await getWorkerJobDetails(id);
  return {
    title: job ? `${job.title} | ReplaceMe` : "Job Not Found | ReplaceMe",
    description: job?.description?.slice(0, 160),
  };
}

export default async function WorkerJobDetailsPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/login");

  const { id } = await params;
  const job = await getWorkerJobDetails(id);

  if (!job) notFound();

  return (
    <div className="min-h-screen bg-[#f4f7f6]">
      <JobDetailsHero job={job} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <JobOverviewCard job={job} />
          </div>
          <JobSidebarCards job={job} />
        </div>
      </main>
    </div>
  );
}
