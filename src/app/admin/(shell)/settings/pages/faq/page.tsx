import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { FaqAudienceEditor } from "@/components/admin/settings/FaqAudienceEditor";
import { getAdminPageContent } from "@/actions/admin/page-content";
import {
  EMPLOYER_FAQ_FALLBACK,
  WORKER_FAQ_FALLBACK,
} from "@/lib/content/faq-fallbacks";

export const metadata = {
  title: "FAQ Content | Admin",
};

export default async function AdminFaqPagesPage() {
  const [employer, worker] = await Promise.all([
    getAdminPageContent("employer-faq"),
    getAdminPageContent("worker-faq"),
  ]);

  if (!employer || !worker) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/settings/pages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        All pages
      </Link>

      <AdminPageHeader
        title="FAQ content"
        description="Manage employer and worker FAQs shown on public routes and linked from the site footer."
      />

      <div className="space-y-8">
        <FaqAudienceEditor
          slug="employer-faq"
          label="Employer FAQs"
          initial={employer}
          fallback={EMPLOYER_FAQ_FALLBACK}
        />
        <FaqAudienceEditor
          slug="worker-faq"
          label="Worker FAQs"
          initial={worker}
          fallback={WORKER_FAQ_FALLBACK}
        />
      </div>
    </div>
  );
}
