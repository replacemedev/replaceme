import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { ADMIN_CARD, ADMIN_CARD_HOVER } from "@/lib/admin/ui-tokens";
import type { PageContentDefinition } from "@/types/page-content";
import type { PageContentRow } from "@/types/page-content";

interface PageContentListCardProps {
  row: PageContentRow;
  definition?: PageContentDefinition;
}

export function PageContentListCard({ row, definition }: PageContentListCardProps) {
  const hasCustom = Boolean(row.id);
  const isAuth = row.slug.startsWith("auth-");
  const editHref =
    row.slug === "employer-faq" || row.slug === "worker-faq"
      ? "/admin/settings/pages/faq"
      : `/admin/settings/pages/${row.slug}`;

  return (
    <li
      className={`${ADMIN_CARD} ${ADMIN_CARD_HOVER} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <FileText className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate leading-relaxed">
            {definition?.publicPath ?? row.slug}
            {isAuth ? " · Auth CMS" : ""}
            {" · "}
            {hasCustom
              ? row.isPublished
                ? "Published"
                : "Draft"
              : "Not configured"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {definition ? (
          <Link
            href={definition.publicPath}
            target="_blank"
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 min-h-[40px]"
          >
            View
            <ExternalLink className="h-3 w-3" />
          </Link>
        ) : null}
        <Link
          href={editHref}
          className="inline-flex px-3 py-2 text-xs font-bold text-white bg-[#006e2f] rounded-xl hover:bg-[#005c26] min-h-[40px] items-center"
        >
          Edit
        </Link>
      </div>
    </li>
  );
}
