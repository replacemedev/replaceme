import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { JobsModerationClient } from "@/components/admin/jobs/JobsModerationClient";
import { fetchAdminJobs } from "@/actions/admin-actions";

export const metadata = {
  title: "Job Posts | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const jobs = await fetchAdminJobs();

  const pendingCount = jobs.filter(
    (j) => j.status === "Pending Review"
  ).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Job Moderation"
        description={`Review and approve employer job posts before they go live.${pendingCount > 0 ? ` ${pendingCount} awaiting review.` : ""}`}
      />
      <JobsModerationClient jobs={jobs} />
    </div>
  );
}
