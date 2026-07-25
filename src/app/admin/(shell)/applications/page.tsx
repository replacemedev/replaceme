import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { ApplicationsClient } from "@/components/admin/applications/ApplicationsClient";
import { fetchAdminApplications } from "@/actions/admin/applications";
import { AdminListPageSkeleton } from "@/components/admin/shared/AdminSkeletons";

export const metadata = {
  title: "Applications | Admin",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function ApplicationsList({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const result = await fetchAdminApplications({
    search: first(params.search),
    status: first(params.status),
    from: first(params.from),
    to: first(params.to),
    moderation: first(params.moderation),
    page: Number(first(params.page) ?? "1") || 1,
  });

  return (
    <ApplicationsClient
      applications={result.rows}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
    />
  );
}

export default function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Applications"
        description="Trust & Safety oversight of worker job applications across the marketplace."
      />
      <Suspense fallback={<AdminListPageSkeleton />}>
        <ApplicationsList searchParams={searchParams} />
      </Suspense>
    </AdminPageShell>
  );
}
