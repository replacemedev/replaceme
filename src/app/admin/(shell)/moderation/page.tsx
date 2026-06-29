import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { ModerationClient } from "@/components/admin/moderation/ModerationClient";
import { fetchAdminChatThreads } from "@/actions/admin-actions";

export const metadata = {
  title: "Moderation | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const threads = await fetchAdminChatThreads();

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Messaging Moderation"
        description="Oversight of worker–employer chat threads across the platform."
      />
      <ModerationClient threads={threads} />
    </AdminPageShell>
  );
}
