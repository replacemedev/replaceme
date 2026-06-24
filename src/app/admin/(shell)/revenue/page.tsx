import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { RevenueClient } from "@/components/admin/revenue/RevenueClient";
import { fetchAdminSubscriptions } from "@/actions/admin-actions";

export const metadata = {
  title: "Revenue | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const subscriptions = await fetchAdminSubscriptions();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Revenue & Billing"
        description="Monitor employer subscriptions and Stripe billing status."
      />
      <RevenueClient subscriptions={subscriptions} />
    </div>
  );
}
