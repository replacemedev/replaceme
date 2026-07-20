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
  ShieldCheck,
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

const VERIFICATION_STEPS = [
  {
    stepNumber: 1,
    title: "Complete Personal & Profile Details",
    badgeText: "Required Info",
    summary:
      "Fill out your contact details, demographic information, and professional title in your worker profile.",
    details: [
      "Ensure your full name, email, phone number, and professional title are filled in.",
      "Complete demographic details (gender, civil status) and emergency contact info.",
      "Completing your personal profile is required before submitting identity documents.",
    ],
  },
  {
    stepNumber: 2,
    title: "Enter Government ID Information",
    badgeText: "ID Details",
    summary:
      "Select your government ID type and enter official identification metadata into your account.",
    details: [
      "Accepted IDs: Unified Multi-Purpose ID (UMID), Driver's License, Philippine Passport, National ID (PhilID), SSS/GSIS ID, PRC ID, or Postal ID.",
      "Input your official ID Number, Expiration Date, and Issuing Country accurately.",
      "Accurate details ensure smooth manual verification approval by our review team.",
    ],
  },
  {
    stepNumber: 3,
    title: "Upload ID Photos & Verification Selfie",
    badgeText: "Document Upload",
    summary:
      "Upload high-quality, clear photos of your government ID along with a selfie photo.",
    details: [
      "Front photo of your Philippine Government ID (JPEG or PNG format, up to 5 MB).",
      "Back photo of your Philippine Government ID (JPEG or PNG format, up to 5 MB).",
      "Selfie verification photo holding your ID next to your face so reviewers can verify your identity.",
      "🔒 Strict Privacy Guaranteed: Your ID documents are encrypted and seen only by verification reviewers. Employers never see your raw ID photos.",
    ],
  },
  {
    stepNumber: 4,
    title: "Submit for Professional Review & Earn Your Badge",
    badgeText: "Review & Approval",
    summary:
      "Submit your identity verification application for professional review by our compliance team.",
    details: [
      "Your status changes to 'Under Review' as soon as you submit your documents.",
      "Once approved, your Verified Worker Badge appears across your public profile and candidate card.",
      "Verified profiles rank higher in employer talent searches, gain faster trust, and access exclusive verified-only jobs.",
    ],
  },
];

function ProfileOptimizationFallback() {
  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 gap-4">
        {OPTIMIZATION_TIPS.map((step) => {
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
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-5 h-5 text-[#006e2f] shrink-0" />
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                        Tip {step.stepNumber}: {step.title}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 shrink-0">
                      {step.badgeText}
                    </span>
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

      {/* Worker Verification Process Section */}
      <div className="mt-10 pt-8 border-t border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006e2f] shrink-0" />
              <span>Identity & Trust</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              How to Get Verified
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Getting verified builds immediate trust with international hiring managers. Follow these 4 simple steps to complete identity verification and earn your Verified Worker Badge.
            </p>
          </div>
          <Link
            href="/worker/verification"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#006e2f] hover:bg-[#005c26] text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-center"
          >
            <span>Go to Verification</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        <div className="space-y-4">
          {VERIFICATION_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col sm:flex-row items-start gap-4 md:gap-5"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100/80 text-[#006e2f] flex items-center justify-center font-bold text-sm md:text-base shadow-xs">
                {step.stepNumber}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {step.badgeText}
                  </span>
                </div>
                <p className="text-slate-600 text-xs sm:text-sm mb-3 leading-relaxed">
                  {step.summary}
                </p>
                <div className="bg-slate-50/80 rounded-xl p-3 sm:p-3.5 border border-slate-100 space-y-1.5">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#006e2f] mt-0.5 shrink-0" />
                      <span className="flex-1 min-w-0 leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Card */}
      <div className="mt-10 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-4">
            <UserCheck size={14} className="shrink-0" />
            <span>Stand Out To Employers</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Ready to Polish Your Profile?
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Update your profile now to increase your visibility to top international hiring managers.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href="/signup/worker"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 text-center"
            >
              <span>Edit Your Profile</span>
              <ArrowRight size={16} className="text-[#006e2f] shrink-0" />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30 text-center"
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
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <Sparkles size={13} className="text-[#006e2f] shrink-0" />
            <span>Profile Optimization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
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

