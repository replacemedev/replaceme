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
  title: "Worker Onboarding Guide | What to Expect When Hired",
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
    title: "Worker Onboarding Guide | Replaceme",
    description:
      "Understand direct payment arrangements, working expectations, keeping 100% of your salary, and long-term remote client success on Replaceme.",
    url: `${BASE_URL}/help/worker/onboarding`,
    type: "article",
  },
};


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
      "Replaceme does not lock you into agency contracts. Your relationship is 100% direct with the employer.",
    ],
  },
  {
    stepNumber: 2,
    title: "Set Up Direct Salary Payments",
    icon: DollarSign,
    badgeText: "100% Direct Pay",
    summary:
      "Agree payment terms directly with your employer off-platform. Common options include Wise, PayPal, or bank transfer. Replaceme does not process or endorse any payment method.",
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
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 gap-4">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.stepNumber}
              className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200"
            >
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
          );
        })}
      </div>

      {/* CTA Card */}
      <div className="mt-10 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-4">
            <ShieldCheck size={14} className="shrink-0" />
            <span>Direct Relationship • 0% Fee</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Build Long-Term Remote Success
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Congratulations on your next role! Manage your profile, showcase new milestones, and explore new openings anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 text-center"
            >
              <span>Go to Worker Dashboard</span>
              <ArrowRight size={16} className="text-[#006e2f] shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkerOnboardingPage() {
  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] py-6 sm:py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 sm:mb-3">
            Worker Onboarding Guide
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Understand direct payment arrangements, working expectations, keeping 100% of your salary, and long-term remote client success on Replaceme.
          </p>
        </div>

        <WorkerOnboardingFallback />
      </div>
    </main>
  );
}
