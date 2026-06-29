import Link from "next/link";
import { AdminPageShell } from "@/components/admin/layout";
import { PageContentListCard } from "@/components/admin/settings/PageContentListCard";
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
    <AdminPageShell>
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

      <ul className="grid grid-cols-1 gap-3">
        {rows.map((row) => (
          <PageContentListCard
            key={row.slug}
            row={row}
            definition={defBySlug.get(row.slug)}
          />
        ))}
      </ul>
    </AdminPageShell>
  );
}
