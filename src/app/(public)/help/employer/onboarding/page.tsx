import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Onboarding Guide — Getting Started on Replaceme",
  description:
    "Learn how to set up your company profile, choose your flat-rate pricing tier, and manage your applicant pipeline on Replaceme.",
  keywords: [
    "employer onboarding",
    "Replaceme company setup",
    "employer guide",
    "flat-rate hiring",
    "remote recruitment pipeline",
  ],
  alternates: { canonical: `${BASE_URL}/help/employer/onboarding` },
  openGraph: {
    title: "Employer Onboarding Guide — Replaceme",
    description:
      "Learn how to set up your company profile, choose your flat-rate pricing tier, and manage your applicant pipeline on Replaceme.",
    url: `${BASE_URL}/help/employer/onboarding`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    stepNumber: 1,
    title: "Complete Your Company Profile",
    icon: Building2,
    badgeText: "Profile Setup",
    summary:
      "Add your company details, logo, website, and industry overview to build trust with candidates.",
    details: [
      "Upload a high-resolution logo and write a brief description of your business.",
      "Add your official website URL and social links so applicants can learn about your culture.",
      "A complete profile increases job application rates by up to 3x.",
    ],
  },
  {
    stepNumber: 2,
    title: "Choose Your Flat-Rate Pricing Plan",
    icon: CreditCard,
    badgeText: "Flexible Tiers",
    summary:
      "Select a plan that matches your monthly hiring velocity with no hidden fees or placement cuts.",
    details: [
      "Discovery ($0/mo): Free forever. 1 active job post, 10 applicants max, 2-day job post review.",
      "Starter ($19/mo): 3 active jobs, 20 applicants per job, instant post approval, full candidate profiles & direct messaging.",
      "Growth ($39/mo): 10 active jobs, 50 applicants per job, priority job listings, full candidate profiles & direct messaging.",
      "Scale ($79/mo): Unlimited active jobs, unlimited applicants, priority support & early access features.",
    ],
  },
  {
    stepNumber: 3,
    title: "Post Your First Role & Track Approval",
    icon: Zap,
    badgeText: "Instant vs 2-Day Approval",
    summary:
      "Publish your job post with required skills, expected working hours, and salary range.",
    details: [
      "Paid subscribers (Starter, Growth, Scale) receive instant automated job post approvals.",
      "Free Discovery plan posts are reviewed and approved within 2 business days.",
      "You can edit or pause your job listing at any time from your Employer Dashboard.",
    ],
  },
  {
    stepNumber: 4,
    title: "Manage Your Applicant Pipeline & Hire",
    icon: Users,
    badgeText: "Pipeline & Messaging",
    summary:
      "Review candidates as they apply, organize applicant statuses, and message talent directly.",
    details: [
      "Filter applicants by experience, skill ratings, and expected pay.",
      "Use built-in direct messaging (on paid plans) to arrange video interviews.",
      "Hire directly with 0% platform salary markup—pay 100% of agreed compensation directly to your worker.",
    ],
  },
];

function EmployerOnboardingFallback() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-[#006e2f] flex items-center justify-center font-extrabold text-lg shrink-0 shadow-xs">
                  {step.stepNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-5 h-5 text-[#006e2f]" />
                      <h2 className="text-xl font-extrabold text-slate-900">
                        Step {step.stepNumber}: {step.title}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {step.badgeText}
                    </span>
                  </div>

                  <p className="text-slate-700 text-base font-medium mb-4 leading-relaxed">
                    {step.summary}
                  </p>

                  <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-[#006e2f] mt-0.5 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
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
            Quick Setup • Easy Hiring
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Start Your Employer Onboarding Today
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Set up your company profile in minutes, post your open roles, and connect with qualified remote workers.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup/employer"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight size={16} className="text-[#006e2f]" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30"
            >
              Explore Pricing Tiers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EmployerOnboardingPage() {
  const cms = await getPublishedPageContent("help-employer-onboarding");

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <Building2 size={13} className="text-[#006e2f]" />
            <span>Employer Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cms?.title ?? "Employer Onboarding Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {(cms?.meta?.description as string) ??
              "Learn how to set up your company profile, choose your flat-rate pricing tier, and manage your applicant pipeline on Replaceme."}
          </p>
        </div>

        <CmsHtmlContent
          html={cms?.body}
          fallback={<EmployerOnboardingFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}
