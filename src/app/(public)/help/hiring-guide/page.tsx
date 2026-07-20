import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import { HIRING_GUIDE_FALLBACK_META } from "@/lib/content/page-fallbacks";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Handshake,
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Hiring Guide — How to Hire Remote Talent on ReplaceMe",
  description:
    "A simple, step-by-step playbook to find and hire top remote talent on ReplaceMe. Post jobs, review applicants, and hire directly with 0% commission.",
  keywords: [
    "how to hire remote talent",
    "employer hiring guide",
    "ReplaceMe hiring tutorial",
    "direct hire remote workers",
    "0% commission hiring",
  ],
  alternates: { canonical: `${BASE_URL}/help/hiring-guide` },
  openGraph: {
    title: "Employer Hiring Guide — ReplaceMe",
    description:
      "A simple, step-by-step playbook to find and hire top remote talent on ReplaceMe.",
    url: `${BASE_URL}/help/hiring-guide`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    stepNumber: 1,
    title: "Post Your Job",
    icon: Briefcase,
    badgeText: "Instant or 2-Day Approval",
    copy: (
      <>
        Write a clear description including the role, hours, pay, and required
        skills. Paid plans get instant post approval, while free plans are approved
        within 2 days. Active jobs will show on the{" "}
        <Link
          href="/jobs"
          className="text-[#006e2f] font-semibold hover:underline decoration-emerald-500/50"
        >
          public job board
        </Link>
        .
      </>
    ),
  },
  {
    stepNumber: 2,
    title: "Review & Connect",
    icon: Users,
    badgeText: "Direct Messaging",
    copy: (
      <>
        Check your applicant pipeline to review profiles and shortlist the best talent.
        If you are on a{" "}
        <Link
          href="/pricing"
          className="text-[#006e2f] font-semibold hover:underline decoration-emerald-500/50"
        >
          Starter, Growth, or Scale plan
        </Link>
        , you can message candidates directly to schedule interviews.
      </>
    ),
  },
  {
    stepNumber: 3,
    title: "Hire Directly",
    icon: Handshake,
    badgeText: "0% Salary Commission",
    copy: (
      <>
        Found the perfect fit? Make an offer and hire them directly. ReplaceMe does not
        process your payroll and we take 0% commission from the worker&apos;s salary. You pay
        them 100% of their earnings.
      </>
    ),
  },
  {
    stepNumber: 4,
    title: "Get Support",
    icon: LifeBuoy,
    badgeText: "Here to Help",
    copy: (
      <>
        Need help with billing, choosing a plan, or onboarding? Browse our{" "}
        <Link
          href="/help"
          className="text-[#006e2f] font-semibold hover:underline decoration-emerald-500/50"
        >
          Help Center
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="text-[#006e2f] font-semibold hover:underline decoration-emerald-500/50"
        >
          contact our support team
        </Link>{" "}
        at any time.
      </>
    ),
  },
];

function HiringGuideFallback() {
  return (
    <div className="space-y-5 mt-6">
      <div className="grid grid-cols-1 gap-5 md:gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.stepNumber}
              className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300/80 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                {/* Step badge & icon */}
                <div className="flex sm:flex-col items-center gap-3 shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-[#006e2f] flex items-center justify-center font-extrabold text-lg group-hover:bg-[#006e2f] group-hover:text-white transition-colors duration-200 shadow-xs">
                    {step.stepNumber}
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-[#006e2f]" />
                      <h2 className="text-xl font-extrabold text-slate-900">
                        Step {step.stepNumber}: {step.title}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50/80 text-emerald-800 border border-emerald-200/60">
                      {step.badgeText}
                    </span>
                  </div>

                  <p className="text-slate-600 text-base leading-relaxed">
                    {step.copy}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Card */}
      <div className="mt-10 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-4">
            <ShieldCheck size={14} />
            Direct Hiring • 0% Commission
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Build Your Remote Team?
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Create an employer account to post jobs, message candidates directly, and scale your business without markup fees.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup/employer"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <span>Create Employer Account</span>
              <ArrowRight size={16} className="text-[#006e2f]" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30"
            >
              View Employer Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HiringGuidePage() {
  const cms = await getPublishedPageContent("help-hiring-guide");
  const subtitle =
    (cms?.meta?.description as string | undefined) ??
    HIRING_GUIDE_FALLBACK_META.description ??
    "A simple, step-by-step playbook to find and hire top remote talent on ReplaceMe.";

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title Section - Back button removed, top whitespace reduced */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <Zap size={13} className="text-[#006e2f]" />
            <span>Employer Playbook</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cms?.title ?? "Employer Hiring Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Content Body */}
        <CmsHtmlContent
          html={cms?.body}
          fallback={<HiringGuideFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}

