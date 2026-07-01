import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminBillingDashboard } from "@/components/admin/billing/AdminBillingDashboard";
import { ErrorState } from "@/components/shared/ErrorState";
import { fetchAdminBillingPageData } from "@/actions/admin/billing";

export const metadata = {
  title: "Billing | Admin",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminBillingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params.tab ?? "overview";

  try {
    const data = await fetchAdminBillingPageData();

    return (
      <AdminPageShell>
        <AdminPageHeader
          title="Billing"
          description="Monitor subscriptions, MRR, Stripe payments, and support overrides in one place."
        />
        <AdminBillingDashboard data={data} activeTab={activeTab} />
      </AdminPageShell>
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to load billing data.";
    return (
      <AdminPageShell>
        <AdminPageHeader title="Billing" description="Platform revenue and Stripe sync." />
        <ErrorState
          title="Unable to load billing"
          description={message}
          retryHref="/admin/billing"
        />
      </AdminPageShell>
    );
  }
}
