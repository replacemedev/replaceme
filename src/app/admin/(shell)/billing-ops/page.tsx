import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { BillingOpsClient } from "@/components/admin/billing/BillingOpsClient";
import { fetchAdminSubscriptions } from "@/actions/admin-actions";

export const metadata = {
  title: "Billing Ops | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminBillingOpsPage() {
  const subscriptions = await fetchAdminSubscriptions();

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Billing Operations"
        description="Support overrides for subscription usage counters and billing review."
      />
      <BillingOpsClient subscriptions={subscriptions} />
    </AdminPageShell>
  );
}
