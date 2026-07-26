import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { ModerationClient } from "@/components/admin/moderation/ModerationClient";
import { fetchAdminModerationFlags } from "@/actions/admin/messaging-moderation";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Messaging Trust & Safety | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  await requireAdminPageCapability("moderation");

  // Load full set so client filters work without refetch; queue is flag-gated.
  const [active, dismissed, resolved] = await Promise.all([
    fetchAdminModerationFlags("active"),
    fetchAdminModerationFlags("dismissed"),
    fetchAdminModerationFlags("resolved"),
  ]);

  const seen = new Set<string>();
  const flags = [...active, ...dismissed, ...resolved].filter((f) => {
    if (seen.has(f.flag_id)) return false;
    seen.add(f.flag_id);
    return true;
  });

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Messaging Trust & Safety"
        description="Review only conversations that were auto-flagged for safety signals or reported by a user. Opening a thread is audit-logged."
      />
      <ModerationClient flags={flags} />
    </AdminPageShell>
  );
}
