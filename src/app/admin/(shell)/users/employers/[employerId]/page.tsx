import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { EmployerDeepDiveView } from "@/components/admin/users/EmployerDeepDiveView";
import { getAdminEmployerDeepDive } from "@/actions/admin/deep-dive";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ employerId: string }>;
}

export default async function AdminEmployerDeepDivePage({ params }: PageProps) {
  const { employerId } = await params;
  const data = await getAdminEmployerDeepDive(employerId);

  if (!data) notFound();

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={data.companyName}
        description="Employer profile, Stripe subscription, jobs, and billing history."
      />
      <EmployerDeepDiveView data={data} />
    </AdminPageShell>
  );
}
