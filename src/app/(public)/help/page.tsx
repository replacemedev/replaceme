import Link from "next/link";
import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { HELP_INDEX_FALLBACK } from "@/lib/content/page-fallbacks";
import type { HelpArticleConfig, HelpCategoryConfig, HelpIndexConfig } from "@/types/page-content";
import type { Metadata } from "next";
import {
  Briefcase,
  Building2,
  CreditCard,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Video,
  HelpCircle,
  Lock,
  LifeBuoy,
  FileText,
  Shield,
  ArrowUpRight,
  Zap,
  BookOpen,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Help Center — Guides for Employers & Job Seekers",
  description:
    "Find answers and guides for using Replaceme. Learn how to post jobs, manage your employer subscription, build a worker profile, apply to remote roles, and navigate the hiring pipeline.",
  keywords: [
    "Replaceme help center",
    "how to use Replaceme",
    "employer hiring guide Philippines",
    "remote job application guide",
    "direct remote hiring support",
  ],
  alternates: { canonical: `${BASE_URL}/help` },
  openGraph: {
    title: "Help Center — Replaceme",
    description: "Guides, FAQs, and support documentation for employers and Filipino job seekers using Replaceme.",
    url: `${BASE_URL}/help`,
    type: "website",
  },
};

export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Building2,
  CreditCard,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Video,
  HelpCircle,
  Lock,
  LifeBuoy,
  FileText,
  Shield,
};

function getArticleIcon(article: HelpArticleConfig) {
  if (article.icon && ICON_MAP[article.icon]) {
    return ICON_MAP[article.icon];
  }

  const titleLower = article.title.toLowerCase();
  if (titleLower.includes("hiring") || titleLower.includes("job post")) return Briefcase;
  if (titleLower.includes("onboarding") && titleLower.includes("employer")) return Building2;
  if (titleLower.includes("billing") || titleLower.includes("pricing")) return CreditCard;
  if (titleLower.includes("messaging") || titleLower.includes("chat")) return MessageSquare;
  if (titleLower.includes("application") || titleLower.includes("seeker")) return UserCheck;
  if (titleLower.includes("worker onboarding") || titleLower.includes("hired")) return ShieldCheck;
  if (titleLower.includes("profile")) return Sparkles;
  if (titleLower.includes("interview")) return Video;
  if (titleLower.includes("faq")) return HelpCircle;
  if (titleLower.includes("trust") || titleLower.includes("safety")) return Lock;
  if (titleLower.includes("contact") || titleLower.includes("support")) return LifeBuoy;
  if (titleLower.includes("terms")) return FileText;
  if (titleLower.includes("privacy")) return Shield;

  return BookOpen;
}

function getCategoryIcon(categoryId: string) {
  switch (categoryId) {
    case "employers":
      return Building2;
    case "workers":
      return UserCheck;
    case "general":
    default:
      return HelpCircle;
  }
}

export default async function HelpCenterPage() {
  const cms = await getPublishedPageContent("help-index");
  const config: HelpIndexConfig = {
    ...HELP_INDEX_FALLBACK,
    ...(cms?.contentJson as Partial<HelpIndexConfig>),
    title: cms?.title ?? HELP_INDEX_FALLBACK.title,
    description: (cms?.meta?.description as string | undefined) ?? HELP_INDEX_FALLBACK.description,
  };

  const categories: HelpCategoryConfig[] =
    config.categories && config.categories.length > 0
      ? config.categories
      : HELP_INDEX_FALLBACK.categories ?? [];

  return (
    <main className={`bg-slate-50/50 min-h-[calc(100vh-4rem)] pb-16 ${PUBLIC_PAGE_TOP}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-4">
            <Zap size={13} className="text-[#006e2f]" />
            <span>Knowledge Base & Support</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {config.title}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Categories & Articles Grid */}
        <div className="space-y-12 sm:space-y-16">
          {categories.map((category) => {
            const CategoryIcon = getCategoryIcon(category.id);
            return (
              <section key={category.id} className="space-y-6">
                {/* Category Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#006e2f] border border-emerald-200/60 flex items-center justify-center font-bold">
                      <CategoryIcon size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {category.title}
                      </h2>
                      {category.description && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 self-start sm:self-auto">
                    {category.articles.length} {category.articles.length === 1 ? "Guide" : "Guides"}
                  </span>
                </div>

                {/* Golden Rule Responsive Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {category.articles.map((article) => {
                    const CardIcon = getArticleIcon(article);
                    return (
                      <Link
                        key={article.href}
                        href={article.href}
                        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between h-full"
                      >
                        <div>
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#006e2f] border border-emerald-100/80 group-hover:bg-[#006e2f] group-hover:text-white group-hover:border-[#006e2f] transition-colors duration-200 flex items-center justify-center mb-4 shrink-0 shadow-xs">
                            <CardIcon className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#006e2f] transition-colors flex items-center justify-between gap-2">
                            <span>{article.title}</span>
                            <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-200 text-[#006e2f] shrink-0" />
                          </h3>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                            {article.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs font-semibold text-[#006e2f]">
                          <span>Read article</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
