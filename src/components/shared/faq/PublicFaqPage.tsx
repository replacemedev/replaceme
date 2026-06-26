import { getPublishedPageContent } from "@/actions/public/page-content";
import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { FaqList } from "@/components/shared/faq/FaqList";
import { parseFaqPageConfig } from "@/lib/faq/parse-faq-config";
import type { FaqPageConfig, PageContentMeta } from "@/types/page-content";

interface PublicFaqPageProps {
  slug: "employer-faq" | "worker-faq";
  defaultTitle: string;
  fallback: FaqPageConfig;
  fallbackMeta: PageContentMeta;
}

export async function PublicFaqPage({
  slug,
  defaultTitle,
  fallback,
  fallbackMeta,
}: PublicFaqPageProps) {
  const cms = await getPublishedPageContent(slug);
  const meta = { ...fallbackMeta, ...cms?.meta };
  const config = parseFaqPageConfig(cms?.contentJson, fallback);

  return (
    <LegalPageLayout
      badge={meta.badge ?? fallbackMeta.badge!}
      badgeVariant={meta.badgeVariant ?? "pill"}
      title={cms?.title ?? defaultTitle}
      lastUpdated={meta.lastUpdated ?? fallbackMeta.lastUpdated!}
    >
      {meta.description ? (
        <p className="text-center text-sm text-slate-500 mb-8 -mt-4">{meta.description}</p>
      ) : null}
      <FaqList items={config.items} />
    </LegalPageLayout>
  );
}
