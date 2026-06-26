import Link from "next/link";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { HELP_INDEX_FALLBACK } from "@/lib/content/page-fallbacks";
import type { HelpIndexConfig } from "@/types/page-content";

export const metadata = {
  title: "Help Center | ReplaceMe",
};

export const dynamic = "force-dynamic";

export default async function HelpCenterPage() {
  const cms = await getPublishedPageContent("help-index");
  const config: HelpIndexConfig = {
    ...HELP_INDEX_FALLBACK,
    ...(cms?.contentJson as Partial<HelpIndexConfig>),
    title: cms?.title ?? HELP_INDEX_FALLBACK.title,
  };

  const articles =
    config.articles?.length > 0 ? config.articles : HELP_INDEX_FALLBACK.articles;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 pt-24">
      <h1 className="text-3xl font-extrabold text-slate-900">{config.title}</h1>
      <p className="text-sm text-slate-500 mt-2 mb-10">{config.description}</p>

      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.href}>
            <Link
              href={article.href}
              className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 transition-colors"
            >
              <h2 className="text-base font-bold text-slate-900">{article.title}</h2>
              <p className="text-sm text-slate-500 mt-1">{article.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
