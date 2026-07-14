import Link from "next/link";
import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { HELP_INDEX_FALLBACK } from "@/lib/content/page-fallbacks";
import type { HelpIndexConfig } from "@/types/page-content";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Help Center — Guides for Employers & Job Seekers",
  description:
    "Find answers and guides for using Replaceme. Learn how to post jobs, manage your employer subscription, build a worker profile, apply to remote roles, and navigate the hiring pipeline.",
  keywords: [
    "Replaceme help",
    "how to use Replaceme",
    "employer hiring guide Philippines",
    "remote job application guide",
  ],
  alternates: { canonical: `${BASE_URL}/help` },
  openGraph: {
    title: "Help Center — Replaceme",
    description: "Guides and documentation for employers and Filipino job seekers using Replaceme.",
    url: `${BASE_URL}/help`,
    type: "website",
  },
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
    <div className={`max-w-3xl mx-auto px-4 sm:px-8 pb-10 ${PUBLIC_PAGE_TOP}`}>
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
