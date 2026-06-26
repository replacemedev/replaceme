import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ApplicationsClient } from "@/components/admin/applications/ApplicationsClient";
import { fetchAdminApplications } from "@/actions/admin-actions";

export const metadata = {
  title: "Applications | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await fetchAdminApplications();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Applications"
        description="Cross-platform view of all worker job applications."
      />
      <ApplicationsClient applications={applications} />
    </div>
  );
}
