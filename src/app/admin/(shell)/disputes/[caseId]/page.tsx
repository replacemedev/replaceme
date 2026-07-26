import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminCaseById } from "@/actions/admin/disputes";
import { DisputeCaseDetailClient } from "@/components/admin/disputes/DisputeCaseDetailClient";
import { AdminPageShell } from "@/components/admin/layout";

export const metadata = {
  title: "Case details | Disputes | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDisputeCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const detail = await getAdminCaseById(decodeURIComponent(caseId));
  if (!detail) notFound();

  return (
    <AdminPageShell>
      <div className="mb-4 min-w-0">
        <Link
          href="/admin/disputes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#006e2f]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to case center
        </Link>
      </div>
      <DisputeCaseDetailClient initial={detail} />
    </AdminPageShell>
  );
}
