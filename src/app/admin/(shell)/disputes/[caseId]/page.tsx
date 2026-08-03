import { notFound } from "next/navigation";
import { getAdminCaseById } from "@/actions/admin/disputes";
import { DisputeCaseDetailClient } from "@/components/admin/disputes/DisputeCaseDetailClient";
import { AdminPageShell } from "@/components/admin/layout";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Case details | Disputes | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDisputeCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  await requireAdminPageCapability("disputes");

  const { caseId } = await params;
  const detail = await getAdminCaseById(decodeURIComponent(caseId));
  if (!detail) notFound();

  return (
    <AdminPageShell>
      <DisputeCaseDetailClient initial={detail} />
    </AdminPageShell>
  );
}
