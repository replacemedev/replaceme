import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { RevenueClient } from "@/components/admin/revenue/RevenueClient";
import { fetchAdminSubscriptions } from "@/actions/admin-actions";

export const metadata = {
  title: "Revenue | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const subscriptions = await fetchAdminSubscriptions();

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Revenue & Billing"
        description="Monitor employer subscriptions and Stripe billing status."
      />
      <RevenueClient subscriptions={subscriptions} />
    </AdminPageShell>
  );
}
