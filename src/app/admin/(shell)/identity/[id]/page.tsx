import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { IdentityReviewDetailClient } from "@/components/admin/identity/IdentityReviewDetailClient";
import { fetchWorkerKycReviewBundle } from "@/actions/admin-actions";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Review Identity | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminIdentityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPageCapability("identity");

  const { id } = await params;
  const bundle = await fetchWorkerKycReviewBundle(id);
  if (!bundle) notFound();

  return (
    <AdminPageShell>
      <IdentityReviewDetailClient
        worker={bundle.worker}
        documents={bundle.documents}
      />
    </AdminPageShell>
  );
}
