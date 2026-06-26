import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { DisputesClient } from "@/components/admin/disputes/DisputesClient";
import { fetchAdminDisputes } from "@/actions/admin-actions";

export const metadata = {
  title: "Disputes | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const disputes = await fetchAdminDisputes();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Disputes"
        description="Mediation queue for worker–employer conflicts and safety reports."
      />
      <DisputesClient disputes={disputes} />
    </div>
  );
}
