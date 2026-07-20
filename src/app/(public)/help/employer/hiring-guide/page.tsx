import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Handshake,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Hiring Guide — How to Hire Remote Talent on Replaceme",
  description:
    "A simple, step-by-step playbook to find and hire top remote talent on Replaceme. Post jobs, review applicants, and hire directly with 0% commission.",
  keywords: [
    "how to hire remote talent",
    "employer hiring guide",
    "Replaceme hiring tutorial",
    "direct hire remote workers",
    "0% commission hiring",
  ],
  alternates: { canonical: `${BASE_URL}/help/employer/hiring-guide` },
  openGraph: {
    title: "Employer Hiring Guide — Replaceme",
    description:
      "A simple, step-by-step playbook to find and hire top remote talent on Replaceme.",
    url: `${BASE_URL}/help/employer/hiring-guide`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    stepNumber: 1,
    title: "Create and Post Your Job",
    icon: Briefcase,
    badgeText: "Instant or 2-Day Approval",
    summary:
      "Write a simple job post outlining your role, required skills, schedule, and proposed pay rate.",
    details: [
      "Include a clear job title and a bulleted list of daily responsibilities.",
      "Paid plans (Starter, Growth, Scale) feature instant job post approval.",
      "Free Discovery plan posts are reviewed and approved within 2 business days.",
      "Your active post appears immediately on the public Replaceme job board.",
    ],
  },
  {
    stepNumber: 2,
    title: "Review Applicants & Shortlist Talent",
    icon: Users,
    badgeText: "Direct Applicant Pipeline",
    summary:
      "Access candidate applications, evaluate skills, and organize top prospects from your dashboard.",
    details: [
      "View work experience, technical skills, and salary expectations.",
      "Paid plan subscribers can unlock full names, contact info, and download resumes.",
      "Free plan subscribers see anonymous candidate previews to test candidate quality.",
      "Sort applications into shortlist, interview, or declined stages with one click.",
    ],
  },
  {
    stepNumber: 3,
    title: "Message & Interview Candidates Directly",
    icon: Handshake,
    badgeText: "Direct Communication",
    summary:
      "Connect directly with shortlisted candidates to set up interviews and ask key questions.",
    details: [
      "Use built-in direct messaging to communicate securely with applicants.",
      "Schedule video interviews or send quick pre-screening questions.",
      "No middleman or agency agent sits between you and your candidate.",
    ],
  },
  {
    stepNumber: 4,
    title: "Hire Directly with 0% Commission",
    icon: ShieldCheck,
    badgeText: "0% Salary Markup",
    summary:
      "Send a job offer directly to your chosen candidate without platform placement cuts.",
    details: [
      "Replaceme charges $0 in placement fees or salary percentages.",
      "Pay your worker 100% of their agreed wage directly via Wise, PayPal, or bank transfer.",
      "You maintain full ownership of your employment contract and working relationship.",
    ],
  },
];

function EmployerHiringGuideFallback() {
  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-5">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100/80 text-[#006e2f] flex items-center justify-center font-bold text-sm md:text-base shadow-xs">
                  {step.stepNumber}
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2.5 mb-2.5 min-w-0">
                    <Icon className="w-5 h-5 text-[#006e2f] shrink-0" />
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Step {step.stepNumber}: {step.title}
                    </h2>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base font-normal mb-3.5 leading-relaxed">
                    {step.summary}
                  </p>

                  <div className="bg-slate-50/80 rounded-xl p-3.5 sm:p-4 border border-slate-100 space-y-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-[#006e2f] mt-0.5 shrink-0" />
                        <span className="flex-1 min-w-0 leading-relaxed">{detail}</span>
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
      <div className="mt-10 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-4">
            <ShieldCheck size={14} className="shrink-0" />
            <span>Direct Hiring • 0% Commission</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Build Your Remote Team?
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Create an employer account to post jobs, message top remote talent directly, and scale your business without markup fees.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href="/signup/employer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 text-center"
            >
              <span>Create Employer Account</span>
              <ArrowRight size={16} className="text-[#006e2f] shrink-0" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30 text-center"
            >
              View Employer Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EmployerHiringGuidePage() {
  const cms = await getPublishedPageContent("help-employer-hiring-guide");

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <Zap size={13} className="text-[#006e2f] shrink-0" />
            <span>Employer Playbook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {cms?.title ?? "Employer Hiring Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {(cms?.meta?.description as string) ??
              "A simple step-by-step playbook to find, message, and hire top remote talent on Replaceme."}
          </p>
        </div>

        <CmsHtmlContent
          html={cms?.body}
          fallback={<EmployerHiringGuideFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}
