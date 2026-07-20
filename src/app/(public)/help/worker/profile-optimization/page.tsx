import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  FileText,
  DollarSign,
  Award,
  Zap,
  ArrowRight,
  UserCheck,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Worker Profile Optimization Guide — Stand Out on Replaceme",
  description:
    "Learn expert tips to optimize your Replaceme worker profile, write compelling summaries, highlight key skills, and get hired faster by top remote employers.",
  keywords: [
    "profile optimization guide",
    "Replaceme worker profile tips",
    "remote job profile setup",
    "stand out to employers",
    "virtual assistant profile guide",
  ],
  alternates: { canonical: `${BASE_URL}/help/worker/profile-optimization` },
  openGraph: {
    title: "Worker Profile Optimization Guide — Replaceme",
    description:
      "Learn expert tips to optimize your Replaceme worker profile, write compelling summaries, highlight key skills, and get hired faster by top remote employers.",
    url: `${BASE_URL}/help/worker/profile-optimization`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const OPTIMIZATION_TIPS = [
  {
    stepNumber: 1,
    title: "Craft a Specific & Professional Job Headline",
    icon: Sparkles,
    badgeText: "First Impressions",
    summary:
      "Use a clear, concise headline that tells hiring managers exactly what you specialize in.",
    details: [
      "Avoid vague titles like 'Hardworking Professional' or 'Virtual Assistant'.",
      "Use specific role titles such as 'Executive VA & Shopify Store Manager' or 'Senior Full-Stack Node/React Developer'.",
      "Highlight your key niche or primary tool expertise directly in the headline.",
    ],
  },
  {
    stepNumber: 2,
    title: "Detail Skills, Software & Core Tools",
    icon: Award,
    badgeText: "Skill Tagging",
    summary:
      "Tag relevant technical skills, software packages, and industry tools you use daily.",
    details: [
      "Add essential software skills (e.g. Figma, Canva, QuickBooks, Asana, Zendesk, WordPress).",
      "Include technical languages, frameworks, or certifications.",
      "Categorize skills by expertise level so employers can gauge your proficiency.",
    ],
  },
  {
    stepNumber: 3,
    title: "Upload an Updated PDF Resume",
    icon: FileText,
    badgeText: "Resume Attachment",
    summary:
      "Provide a clean, easy-to-read 1 to 2-page PDF resume with structured bullet points.",
    details: [
      "Ensure your resume features standard fonts, clear work dates, and quantifiable achievements.",
      "Include key metrics (e.g. 'Increased client email open rates by 35%').",
      "Subscribers on Starter, Growth, and Scale plans download PDF resumes directly from candidate cards.",
    ],
  },
  {
    stepNumber: 4,
    title: "Set Realistic & Transparent Pay Expectations",
    icon: DollarSign,
    badgeText: "Salary Expectations",
    summary:
      "Specify your target hourly rate or monthly salary expectation clearly on your profile.",
    details: [
      "Transparent pay rates help connect you with employers whose budgets align with your experience.",
      "Research standard market rates for your skill level before setting your target salary.",
      "Remember: Replaceme takes 0% cut from your earnings—100% of your agreed salary goes to you.",
    ],
  },
];

function ProfileOptimizationFallback() {
  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 gap-6">
        {OPTIMIZATION_TIPS.map((step) => {
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
                        Tip {step.stepNumber}: {step.title}
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
            <UserCheck size={14} />
            Stand Out To Employers
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Polish Your Profile?
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Update your profile now to increase your visibility to top international hiring managers.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup/worker"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <span>Edit Your Profile</span>
              <ArrowRight size={16} className="text-[#006e2f]" />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30"
            >
              Explore Open Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ProfileOptimizationPage() {
  const cms = await getPublishedPageContent("help-worker-profile-optimization");

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <Sparkles size={13} className="text-[#006e2f]" />
            <span>Profile Optimization</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cms?.title ?? "Profile Optimization Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {(cms?.meta?.description as string) ??
              "Learn expert tips to optimize your Replaceme worker profile, write compelling summaries, highlight key skills, and get hired faster."}
          </p>
        </div>

        <CmsHtmlContent
          html={cms?.body}
          fallback={<ProfileOptimizationFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}
