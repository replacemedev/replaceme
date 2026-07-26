import Link from "next/link";
import { AdminPageShell } from "@/components/admin/layout";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminAccountSecurityCard } from "@/components/admin/settings/profile/AdminAccountSecurityCard";
import { AdminPersonalProfileCard } from "@/components/admin/settings/profile/AdminPersonalProfileCard";
import { getAdminSelfProfile } from "@/actions/admin/profile";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "My Profile | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminMyProfilePage() {
  await requireAdminPageCapability("settings");

  const result = await getAdminSelfProfile();

  if (!result.success) {
    return (
      <AdminPageShell>
        <ErrorState
          title="Unable to load profile"
          description={result.error}
          retryHref="/admin/settings/profile"
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="My profile"
        description="Manage your photo, contact details, and password. MFA lives in Security Center."
      />
      <div className="space-y-4 sm:space-y-5">
        <AdminPersonalProfileCard profile={result.data} />
        <AdminAccountSecurityCard />
        <p className="text-sm text-slate-500">
          Need session or MFA controls?{" "}
          <Link
            href="/admin/security"
            className="font-semibold text-[#006e2f] hover:underline"
          >
            Open Security Center
          </Link>
        </p>
      </div>
    </AdminPageShell>
  );
}
