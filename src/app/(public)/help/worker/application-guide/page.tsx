import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Job Seeker Application Guide — How to Find Remote Jobs on Replaceme",
  description:
    "Learn how to build a standout worker profile, search active remote roles, and apply directly to hiring employers with 0% platform salary cuts.",
  keywords: [
    "job seeker application guide",
    "apply for remote jobs Philippines",
    "Replaceme candidate guide",
    "0% salary cut job board",
    "free remote worker profile",
  ],
  alternates: { canonical: `${BASE_URL}/help/worker/application-guide` },
  openGraph: {
    title: "Job Seeker Application Guide — Replaceme",
    description:
      "Learn how to build a standout worker profile, search active remote roles, and apply directly to hiring employers with 0% platform salary cuts.",
    url: `${BASE_URL}/help/worker/application-guide`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const STEPS = [
  {
    stepNumber: 1,
    title: "Build Your Free Professional Profile",
    icon: UserCheck,
    badgeText: "100% Free Forever",
    summary:
      "Sign up as a job seeker and complete your candidate profile to show off your skills, work history, and target salary.",
    details: [
      "Joining Replaceme, creating your profile, and submitting job applications is 100% free.",
      "Add your primary job title (e.g. Virtual Assistant, React Developer, Graphic Designer).",
      "List your technical skills, years of experience, and preferred work schedule (full-time, part-time).",
      "Upload an up-to-date PDF resume so employers can evaluate your background quickly.",
    ],
  },
  {
    stepNumber: 2,
    title: "Search & Filter Remote Openings",
    icon: Search,
    badgeText: "Real Remote Roles",
    summary:
      "Browse active job listings posted directly by verified international employers.",
    details: [
      "Filter jobs by category, required skills, employment type, or salary range.",
      "Read clear job descriptions detailing exact daily duties and shift expectations.",
      "Save interesting jobs to your dashboard to review or apply later.",
    ],
  },
  {
    stepNumber: 3,
    title: "Submit Clean & Targeted Applications",
    icon: Briefcase,
    badgeText: "Direct Submissions",
    summary:
      "Click apply on roles matching your skills and include a brief, tailored message to the hiring manager.",
    details: [
      "Highlight specific projects or past results that match what the job post asks for.",
      "Keep cover messages concise, professional, and easy to read.",
      "Track all submitted applications and their statuses directly from your Worker Dashboard.",
    ],
  },
  {
    stepNumber: 4,
    title: "Chat & Get Hired (Keep 100% of Pay)",
    icon: ShieldCheck,
    badgeText: "0% Commission",
    summary:
      "Interview directly with employers and receive job offers with no salary markups or deductions.",
    details: [
      "Employers on paid plans can message you directly in the platform chat.",
      "Schedule video calls, answer screening questions, and agree on start dates.",
      "Replaceme takes 0% commission from your salary—you receive 100% of your earnings directly from your employer.",
    ],
  },
];

function WorkerApplicationFallback() {
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
            100% Free for Job Seekers • 0% Cut
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Land Your Next Remote Role?
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Create your free profile today, browse active job listings, and connect directly with hiring companies.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup/worker"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <span>Create Worker Account</span>
              <ArrowRight size={16} className="text-[#006e2f]" />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30"
            >
              Browse Open Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function WorkerApplicationPage() {
  const cms = await getPublishedPageContent("help-worker-application-guide");

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <UserCheck size={13} className="text-[#006e2f]" />
            <span>Worker Playbook</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cms?.title ?? "Job Seeker Application Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {(cms?.meta?.description as string) ??
              "Learn how to build a standout worker profile, search active remote roles, and apply directly to hiring employers with 0% platform salary cuts."}
          </p>
        </div>

        <CmsHtmlContent
          html={cms?.body}
          fallback={<WorkerApplicationFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}
