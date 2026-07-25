import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { ApplicationDeepDiveView } from "@/components/admin/applications/ApplicationDeepDiveView";
import { fetchAdminApplicationDeepDive } from "@/actions/admin/applications";

export const metadata = {
  title: "Application details | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await fetchAdminApplicationDeepDive(id);
  if (!data) notFound();

  return (
    <AdminPageShell>
      <ApplicationDeepDiveView data={data} />
    </AdminPageShell>
  );
}
