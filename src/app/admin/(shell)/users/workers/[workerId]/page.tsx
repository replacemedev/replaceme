import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { WorkerDeepDiveView } from "@/components/admin/users/WorkerDeepDiveView";
import { getAdminWorkerProfileDeepDive } from "@/actions/admin/deep-dive";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ workerId: string }>;
}

export default async function AdminWorkerDeepDivePage({ params }: PageProps) {
  const { workerId } = await params;
  const data = await getAdminWorkerProfileDeepDive(workerId);

  if (!data) notFound();

  const name =
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || "Worker";

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={name}
        description="Worker profile, skills, projects, and verification status."
      />
      <WorkerDeepDiveView data={data} />
    </AdminPageShell>
  );
}
