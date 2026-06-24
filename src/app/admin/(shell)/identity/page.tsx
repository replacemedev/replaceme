import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { IdentityReviewClient } from "@/components/admin/identity/IdentityReviewClient";
import { fetchVerificationQueue } from "@/actions/admin-actions";

export const metadata = {
  title: "Identity Verification | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminIdentityPage() {
  const queue = await fetchVerificationQueue();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Identity Verification"
        description="Review worker KYC submissions before granting verified status."
      />
      <IdentityReviewClient queue={queue} />
    </div>
  );
}
