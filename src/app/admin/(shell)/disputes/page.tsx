import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { DisputesClient } from "@/components/admin/disputes/DisputesClient";
import { getAdminCases } from "@/actions/admin/disputes";
import type { AdminDisputesTab } from "@/lib/reporting/constants";

export const metadata = {
  title: "Disputes | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = (
    ["financial", "safety", "resolved"].includes(params.tab ?? "")
      ? params.tab
      : "financial"
  ) as AdminDisputesTab;

  const initial = (await getAdminCases({
    tab,
    limit: 20,
    offset: 0,
  })) ?? { items: [], total: 0, tab };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Disputes"
        description="Trust & Safety case center — financial mediation (advisory) and safety & policy violations."
      />
      <Suspense fallback={null}>
        <DisputesClient initial={initial} initialTab={tab} />
      </Suspense>
    </AdminPageShell>
  );
}
