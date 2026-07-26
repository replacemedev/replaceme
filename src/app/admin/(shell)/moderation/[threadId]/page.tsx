import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { AdminPageShell } from "@/components/admin/layout";
import { ModerationThreadReviewClient } from "@/components/admin/moderation/ModerationThreadReviewClient";
import { fetchAdminModerationThread } from "@/actions/admin/messaging-moderation";
import { CHAT_MODERATION_STATUS_LABELS } from "@/lib/reporting/messaging-moderation";
import { requireAdminPageCapability } from "@/lib/server/auth/require-page-capability";

export const metadata = {
  title: "Review Thread | Moderation",
};

export const dynamic = "force-dynamic";

export default async function AdminModerationThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ threadId: string }>;
  searchParams: Promise<{ flag?: string }>;
}) {
  await requireAdminPageCapability("moderation");

  const { threadId } = await params;
  const { flag } = await searchParams;

  const detail = await fetchAdminModerationThread(threadId, flag ?? null);
  if (!detail) notFound();

  return (
    <AdminPageShell>
      <div className="mb-4 min-w-0">
        <Link
          href="/admin/moderation"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#006e2f] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to queue
        </Link>
      </div>
      <AdminPageHeader
        title="Review conversation"
        description={`${detail.reasonLabel} · ${CHAT_MODERATION_STATUS_LABELS[detail.status]}`}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 min-w-0">
        <Flag className="h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <p className="min-w-0 font-medium leading-snug">
          Justified-cause review — this access is audit-logged. Highlighted
          messages triggered the flag or report.
        </p>
      </div>
      <ModerationThreadReviewClient detail={detail} />
    </AdminPageShell>
  );
}
