import { notFound } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { ApplicationDeepDiveView } from "@/components/admin/applications/ApplicationDeepDiveView";
import { fetchAdminApplicationDeepDive } from "@/actions/admin/applications";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Application details | Admin",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function AdminApplicationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  await requireAdminPageCapability("applications");

  const { id } = await params;
  const query = await searchParams;
  const data = await fetchAdminApplicationDeepDive(id);
  if (!data) notFound();

  return (
    <AdminPageShell>
      <ApplicationDeepDiveView
        data={data}
        section={first(query.section) ?? null}
      />
    </AdminPageShell>
  );
}
