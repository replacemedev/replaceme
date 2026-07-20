import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Worker Onboarding Guide — What to Expect When Hired on Replaceme",
  description:
    "Understand direct payment arrangements, working expectations, keeping 100% of your salary, and long-term remote client success on Replaceme.",
  keywords: [
    "worker onboarding guide",
    "remote worker payment setup",
    "0% salary cut Replaceme",
    "direct client onboarding",
    "remote contract expectations",
  ],
  alternates: { canonical: `${BASE_URL}/help/worker/onboarding` },
  openGraph: {
    title: "Worker Onboarding Guide — Replaceme",
    description:
      "Understand direct payment arrangements, working expectations, keeping 100% of your salary, and long-term remote client success on Replaceme.",
    url: `${BASE_URL}/help/worker/onboarding`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    stepNumber: 1,
    title: "Finalize Your Offer & Scope",
    icon: Briefcase,
    badgeText: "Contract & Scope",
    summary:
      "Review working hours, primary deliverables, and hourly or monthly compensation with your employer.",
    details: [
      "Confirm core work hours, shift overlap, and timezone expectations.",
      "Agree on project scope, key performance indicators (KPIs), and communication tools.",
      "Replaceme does not lock you into agency contracts—your relationship is 100% direct with the employer.",
    ],
  },
  {
    stepNumber: 2,
    title: "Set Up Direct Salary Payments",
    icon: DollarSign,
    badgeText: "100% Direct Pay",
    summary:
      "Choose your preferred payment method directly with your employer (Wise, PayPal, bank transfer, or crypto).",
    details: [
      "Replaceme does NOT process payroll or take deductions from your salary.",
      "You receive 100% of the compensation agreed upon with your client.",
      "Set clear pay frequencies with your employer (e.g. weekly, bi-weekly, or 1st/15th of the month).",
      "Keep payment records and invoices for your personal accounting.",
    ],
  },
  {
    stepNumber: 3,
    title: "Establish Daily Workflow & Tools",
    icon: Clock,
    badgeText: "Team Integration",
    summary:
      "Join your employer's communication platforms and set up routine check-ins.",
    details: [
      "Get onboarded to team tools such as Slack, Microsoft Teams, Asana, Trello, or Jira.",
      "Establish daily standups or weekly status reports to share progress.",
      "Ask clarifying questions early to align on quality expectations and project timelines.",
    ],
  },
  {
    stepNumber: 4,
    title: "Maintain Profile & Availability Status",
    icon: Sparkles,
    badgeText: "Profile Management",
    summary:
      "Update your availability status on Replaceme so future employers know if you are open to roles.",
    details: [
      "Set your status to 'Hired' or 'Not Available' if working full-time.",
      "If taking on additional part-time or freelance work, update your available hours.",
      "Add newly acquired skills and job titles to keep your Replaceme profile sharp.",
    ],
  },
];

function WorkerOnboardingFallback() {
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
            Direct Relationship • 0% Fee
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Build Long-Term Remote Success
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Congratulations on your next role! Manage your profile, showcase new milestones, and explore new openings anytime.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <span>Go to Worker Dashboard</span>
              <ArrowRight size={16} className="text-[#006e2f]" />
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30"
            >
              Back to Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function WorkerOnboardingPage() {
  const cms = await getPublishedPageContent("help-worker-onboarding");

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <ShieldCheck size={13} className="text-[#006e2f]" />
            <span>Worker Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cms?.title ?? "Worker Onboarding Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {(cms?.meta?.description as string) ??
              "Understand direct payment arrangements, working expectations, keeping 100% of your salary, and long-term remote client success on Replaceme."}
          </p>
        </div>

        <CmsHtmlContent
          html={cms?.body}
          fallback={<WorkerOnboardingFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}
