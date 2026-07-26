import { AdminPageShell } from "@/components/admin/layout";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminTeamClient } from "@/components/admin/settings/team/AdminTeamClient";
import {
  fetchAdminTeam,
  fetchAdminTeamActivity,
} from "@/actions/admin/team";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";
import { getCurrentAdminCapabilities } from "@/lib/server/auth/require-capability";
import { requireAuth } from "@/lib/server/auth/session";

export const metadata = {
  title: "Admin Team | Settings",
};

export const dynamic = "force-dynamic";

export default async function AdminTeamSettingsPage() {
  await requireAdminPageCapability("team");
  const [{ user }, { isSuperAdmin }] = await Promise.all([
    requireAuth(),
    getCurrentAdminCapabilities(),
  ]);

  const [teamResult, activityResult] = await Promise.all([
    fetchAdminTeam(),
    fetchAdminTeamActivity(),
  ]);

  if (!teamResult.success) {
    return (
      <AdminPageShell>
        <ErrorState
          title="Unable to load admin team"
          description={teamResult.error}
          retryHref="/admin/settings/team"
        />
      </AdminPageShell>
    );
  }

  const activity = activityResult.success ? activityResult.data : [];

  return (
    <AdminPageShell>
      <AdminTeamClient
        members={teamResult.data}
        activity={activity}
        currentUserId={user.id}
        isSuperAdmin={isSuperAdmin}
      />
    </AdminPageShell>
  );
}
