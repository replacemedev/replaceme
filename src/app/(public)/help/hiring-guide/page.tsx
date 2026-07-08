import { PUBLIC_PAGE_TOP } from "@/lib/layout/public-shell";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { HIRING_GUIDE_FALLBACK_META } from "@/lib/content/page-fallbacks";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Hiring Guide — How to Hire Filipino Remote Workers",
  description:
    "A step-by-step guide for employers using Replace Me: post your first job, review applicants, unlock full profiles, message candidates, and make your first direct hire — all without agency fees.",
  keywords: [
    "how to hire Filipino workers online",
    "employer hiring guide remote Philippines",
    "Replace Me hiring tutorial",
    "direct hire remote talent guide",
  ],
  alternates: { canonical: `${BASE_URL}/help/hiring-guide` },
  openGraph: {
    title: "Employer Hiring Guide — Replace Me",
    description: "Step-by-step guide to posting jobs, reviewing applicants, and hiring Filipino remote talent directly on Replace Me.",
    url: `${BASE_URL}/help/hiring-guide`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

function HiringGuideFallback() {
  return (
    <section className="mt-10 space-y-6 text-sm text-slate-700 leading-relaxed">
      <div>
        <h2 className="text-lg font-bold text-slate-900">1. Post a clear job</h2>
        <p className="mt-2">
          Include role scope, weekly hours, compensation range, timezone overlap,
          and required skills. Active posts appear on the public job board at{" "}
          <Link href="/jobs" className="text-[#006e2f] font-semibold">
            /jobs
          </Link>
          .
        </p>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">2. Review applicants</h2>
        <p className="mt-2">
          Use the applicants pipeline to shortlist, schedule interviews, and move
          candidates to hired status. Message workers directly from your inbox.
        </p>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">3. Send an offer</h2>
        <p className="mt-2">
          When you are ready to hire, issue a contract offer so the worker can
          accept terms inside the platform.
        </p>
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">4. Get support</h2>
        <p className="mt-2">
          Questions about billing or onboarding? Visit{" "}
          <Link href="/contact" className="text-[#006e2f] font-semibold">
            Contact
          </Link>{" "}
          or browse{" "}
          <Link href="/help" className="text-[#006e2f] font-semibold">
            Help Center
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export default async function HiringGuidePage() {
  const cms = await getPublishedPageContent("help-hiring-guide");
  const description =
    (cms?.meta?.description as string | undefined) ??
    HIRING_GUIDE_FALLBACK_META.description;

  return (
    <article className={`max-w-3xl mx-auto px-4 sm:px-8 pb-10 ${PUBLIC_PAGE_TOP} prose prose-slate`}>
      <Link
        href="/help"
        className="not-prose inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-8"
      >
        <ArrowLeft size={14} />
        Help Center
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-900 not-prose">
        {cms?.title ?? "Employer Hiring Guide"}
      </h1>
      <p className="text-slate-600 not-prose mt-2">{description}</p>

      <CmsHtmlContent
        html={cms?.body}
        fallback={<HiringGuideFallback />}
        className="not-prose mt-10 prose prose-slate max-w-none"
      />

      <Link
        href="/signup"
        className="not-prose inline-flex mt-10 px-6 py-3 text-sm font-bold text-white bg-[#006e2f] rounded-xl hover:bg-[#005c26]"
      >
        Create employer account
      </Link>
    </article>
  );
}
