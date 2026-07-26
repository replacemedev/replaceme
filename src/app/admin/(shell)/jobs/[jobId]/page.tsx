import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { JobDeepDiveView } from "@/components/admin/jobs/JobDeepDiveView";
import { getAdminJobDeepDive } from "@/actions/admin/deep-dive";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ jobId: string }>;
}

export default async function AdminJobDeepDivePage({
 params }: PageProps) {
  await requireAdminPageCapability("jobs");

  const { jobId } = await params;
  const data = await getAdminJobDeepDive(jobId);

  if (!data) notFound();

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data.title}
        description="Full job post details for moderation and support."
      />
      <JobDeepDiveView data={data} />
    </AdminPageShell>
  );
}
