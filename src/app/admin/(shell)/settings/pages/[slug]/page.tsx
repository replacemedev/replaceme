import { notFound } from "next/navigation";
import { PageContentEditor } from "@/components/admin/settings/PageContentEditor";
import { getAdminPageContent } from "@/actions/admin/page-content";
import { PAGE_CONTENT_DEFINITIONS } from "@/config/page-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const def = PAGE_CONTENT_DEFINITIONS.find((d) => d.slug === slug);
  return { title: def ? `${def.label} | Admin` : "Edit page | Admin" };
}

export default async function AdminPageEditPage({ params }: PageProps) {
  const { slug } = await params;
  const definition = PAGE_CONTENT_DEFINITIONS.find((d) => d.slug === slug);
  if (!definition) notFound();

  const initial = await getAdminPageContent(slug);
  if (!initial) notFound();

  return <PageContentEditor definition={definition} initial={initial} />;
}
