import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { JobsModerationClient } from "@/components/admin/jobs/JobsModerationClient";
import {
  countJobsPendingReview,
  fetchAdminJobs,
} from "@/actions/admin-actions";
import { DISCOVERY_JOB_APPROVAL_SLA } from "@/lib/data/legal";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Job Posts | Admin",
};

export const dynamic = "force-dynamic";

function firstParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPageCapability("jobs");

  const params = await searchParams;
  const statusParam = firstParam(params.status);

  const [jobs, pendingCount] = await Promise.all([
    fetchAdminJobs({
      status:
        statusParam === undefined
          ? "Pending Review"
          : statusParam === "all"
            ? null
            : statusParam,
    }),
    countJobsPendingReview(),
  ]);

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Job Moderation"
        description={`Discovery posts need human review within ${DISCOVERY_JOB_APPROVAL_SLA.targetBusinessDays} business days (never auto-publish). Paid plans publish instantly.${
          pendingCount > 0 ? ` ${pendingCount} awaiting review.` : ""
        }`}
      />
      <JobsModerationClient jobs={jobs} pendingCount={pendingCount} />
    </AdminPageShell>
  );
}
