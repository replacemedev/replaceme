import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSavedJobs } from "@/actions/saved-jobs";
import { EmptyState } from "@/components/shared/EmptyState";
import { SavedJobsHeader } from "@/components/worker/saved-jobs/SavedJobsHeader";
import { SavedJobCard } from "@/components/worker/saved-jobs/SavedJobCard";
import { parseSavedJobsQuery } from "@/types/saved-jobs";
import { WorkerPageShell } from "@/components/worker/layout";

export const metadata = {
  title: "Saved Jobs | ReplaceMe",
  description: "Review and manage positions you've bookmarked for later application.",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WorkerSavedJobsPage({ searchParams }: PageProps) {
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

  const resolvedParams = await searchParams;
  const query = parseSavedJobsQuery(resolvedParams);
  const jobs = await getSavedJobs(query);

  return (
    <WorkerPageShell width="content" className="gap-6">
      <SavedJobsHeader q={query.q} sort={query.sort} />

      {jobs.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="h-5 w-5" aria-hidden />}
            title="No saved jobs yet"
            description={
              query.q
                ? "No saved jobs match your search. Try a different keyword or browse open roles."
                : "You haven't saved any jobs yet. Bookmark roles while browsing to find them here later."
            }
            actionLabel="Browse jobs"
            actionHref="/worker/jobs"
          />
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li key={job.savedId}>
                <SavedJobCard job={job} />
              </li>
            ))}
          </ul>
        )}
    </WorkerPageShell>
  );
}
