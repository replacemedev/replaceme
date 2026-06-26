import Link from "next/link";
import { FileText, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { listAdminPageContent } from "@/actions/admin/page-content";
import { PAGE_CONTENT_DEFINITIONS } from "@/config/page-content";

export const metadata = {
  title: "Public Pages | Admin",
};

export default async function AdminPagesListPage() {
  const rows = await listAdminPageContent();
  const defBySlug = new Map(PAGE_CONTENT_DEFINITIONS.map((d) => [d.slug, d]));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Public page content"
        description="Manage legal, help, pricing, contact, and FAQ copy shown on unauthenticated routes."
      />

      <Link
        href="/admin/settings/pages/faq"
        className="inline-flex px-4 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
      >
        Manage FAQs
      </Link>

      <ul className="rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {rows.map((row) => {
          const def = defBySlug.get(row.slug);
          const hasCustom = Boolean(row.id);
          return (
            <li key={row.slug} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
              <div className="flex items-start gap-3 min-w-0">
                <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{row.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {def?.publicPath} · {hasCustom ? "Custom content" : "Using fallback"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {def ? (
                  <Link
                    href={def.publicPath}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : null}
                <Link
                  href={
                    row.slug === "employer-faq" || row.slug === "worker-faq"
                      ? "/admin/settings/pages/faq"
                      : `/admin/settings/pages/${row.slug}`
                  }
                  className="inline-flex px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                >
                  Edit
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
