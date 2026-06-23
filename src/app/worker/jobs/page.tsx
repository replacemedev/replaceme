import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobSearchData } from "@/actions/worker/job-search";
import { JobSearchClient } from "@/components/worker/jobs/JobSearchClient";

export const metadata = {
  title: "Job Search | ReplaceMe",
  description: "Discover roles at top companies matching your skills and aspirations.",
};

export const dynamic = "force-dynamic";

export default async function WorkerJobsPage() {
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

  const { jobs, facets } = await getJobSearchData();

  return <JobSearchClient initialJobs={jobs} facets={facets} />;
}
