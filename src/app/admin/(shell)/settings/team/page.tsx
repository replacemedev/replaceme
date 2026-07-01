import { redirect } from "next/navigation";
import { AdminPageShell } from "@/components/admin/layout";
import { ErrorState } from "@/components/shared/ErrorState";
import { AdminTeamClient } from "@/components/admin/settings/team/AdminTeamClient";
import {
  fetchAdminTeam,
  fetchAdminTeamActivity,
} from "@/actions/admin/team";
import { isCurrentUserSuperAdmin } from "@/lib/server/auth/require-super-admin";
import { requireAuth } from "@/lib/server/auth/session";

export const metadata = {
  title: "Admin Team | Settings",
};

export const dynamic = "force-dynamic";

export default async function AdminTeamSettingsPage() {
  const isSuperAdmin = await isCurrentUserSuperAdmin();
  if (!isSuperAdmin) redirect("/admin/settings");

  const { user } = await requireAuth();

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
      />
    </AdminPageShell>
  );
}
