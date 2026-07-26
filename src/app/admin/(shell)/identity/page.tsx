import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { IdentityReviewClient } from "@/components/admin/identity/IdentityReviewClient";
import { fetchVerificationQueue } from "@/actions/admin-actions";
import type { IdentityQueueTab } from "@/types/admin.types";

export const metadata = {
  title: "Identity Verification | Admin",
};

export const dynamic = "force-dynamic";

function parseTab(value: string | undefined): IdentityQueueTab {
  if (
    value === "pending" ||
    value === "approved" ||
    value === "rejected" ||
    value === "all"
  ) {
    return value;
  }
  return "pending";
}

export default async function AdminIdentityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = parseTab(
    typeof params.tab === "string" ? params.tab : undefined
  );
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const sort =
    params.sort === "oldest" ? ("oldest" as const) : ("newest" as const);
  const page =
    typeof params.page === "string" ? Number(params.page) || 1 : 1;

  const queue = await fetchVerificationQueue({ tab, search, sort, page });

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Identity Verification"
        description="Review worker KYC submissions before granting verified status."
      />
      <IdentityReviewClient queue={queue} />
    </AdminPageShell>
  );
}
