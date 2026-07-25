import { LegalPageLayout } from "@/components/shared/LegalPageLayout";
import { FaqList } from "@/components/shared/faq/FaqList";
import type { FaqPageConfig, PageContentMeta } from "@/types/page-content";

interface PublicFaqPageProps {
  title: string;
  config: FaqPageConfig;
  meta: PageContentMeta;
}

export function PublicFaqPage({ title, config, meta }: PublicFaqPageProps) {
  return (
    <LegalPageLayout
      badge={meta.badge!}
      badgeVariant={meta.badgeVariant ?? "pill"}
      title={title}
      lastUpdated={meta.lastUpdated!}
    >
      {meta.description ? (
        <p className="text-center text-sm text-slate-500 mb-8 -mt-4">{meta.description}</p>
      ) : null}
      <FaqList items={config.items} />
    </LegalPageLayout>
  );
}
