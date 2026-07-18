import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getJobSearchData } from "@/actions/worker/job-search";
import { JobSearchClient } from "@/components/worker/jobs/JobSearchClient";

export const metadata = {
  title: "Job Search | Replaceme",
  description: "Discover roles at top companies matching your skills and aspirations.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    query?: string;
    type?: string | string[];
    skills?: string | string[];
  }>;
}

export default async function WorkerJobsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "worker") redirect("/signin");

  const resolvedSearchParams = await searchParams;

  const keyword = typeof resolvedSearchParams.query === "string" ? resolvedSearchParams.query : undefined;

  const typeParam = resolvedSearchParams.type;
  const employmentTypes = typeParam
    ? (Array.isArray(typeParam) ? typeParam : typeParam.split(","))
    : undefined;

  const skillsParam = resolvedSearchParams.skills;
  const skills = skillsParam
    ? (Array.isArray(skillsParam) ? skillsParam : skillsParam.split(","))
    : undefined;

  const { jobs, facets } = await getJobSearchData({
    keyword,
    employmentTypes,
    skills,
  });

  return <JobSearchClient initialJobs={jobs} facets={facets} />;
}
