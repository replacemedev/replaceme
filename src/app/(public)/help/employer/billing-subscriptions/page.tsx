import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Star,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Billing & Subscriptions Guide — Replaceme Tiers & Rules",
  description:
    "Understand Replaceme's flat-rate employer subscription plans, Stripe USD billing, instant job approvals, and 0% salary commission rules.",
  keywords: [
    "employer billing guide",
    "Replaceme pricing tiers",
    "flat rate recruitment subscription",
    "no commission remote hiring",
    "Stripe USD employer plan",
  ],
  alternates: { canonical: `${BASE_URL}/help/employer/billing-subscriptions` },
  openGraph: {
    title: "Employer Billing & Subscriptions Guide — Replaceme",
    description:
      "Understand Replaceme's flat-rate employer subscription plans, Stripe USD billing, instant job approvals, and 0% salary commission rules.",
    url: `${BASE_URL}/help/employer/billing-subscriptions`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

const PLANS_OVERVIEW = [
  {
    name: "Discovery Plan",
    price: "$0",
    period: "Free Forever",
    badge: "Free Forever",
    isPopular: false,
    description: "Explore the platform, post your first job for free, and test applicant interest.",
    features: [
      "1 Active Job Post",
      "Up to 10 Applicants per job",
      "2-Day manual job review",
      "Anonymous Candidate Previews (skills, salary & experience visible)",
      "Contact info & resumes locked",
    ],
  },
  {
    name: "Starter Plan",
    price: "$19",
    period: "/month",
    badge: "Small Business",
    isPopular: false,
    description: "Ideal for small businesses hiring 1 or 2 remote team members.",
    features: [
      "Up to 3 Active Job Posts",
      "Up to 20 Applicants per job",
      "Instant Automated Job Approval",
      "Full Candidate Profiles (names & contact info visible)",
      "Resume Downloads & Direct Messaging",
      "Standard Email Support",
    ],
  },
  {
    name: "Growth Plan",
    price: "$39",
    period: "/month",
    badge: "Most Popular",
    isPopular: true,
    description: "Built for growing companies regularly recruiting remote talent.",
    features: [
      "Up to 10 Active Job Posts",
      "Up to 50 Applicants per job",
      "Instant Automated Job Approval",
      "Full Candidate Profiles & Resume Downloads",
      "Direct Messaging with Candidates",
      "Priority Listing for Job Posts",
    ],
  },
  {
    name: "Scale Plan",
    price: "$79",
    period: "/month",
    badge: "Agencies & Scaleups",
    isPopular: false,
    description: "For agencies and expanding companies building larger remote teams.",
    features: [
      "Unlimited Active Job Posts",
      "Unlimited Applicants per job",
      "Unlimited Direct Messaging",
      "Full Candidate Profiles & Resume Downloads",
      "Instant Job Approval",
      "Priority Support & Early Feature Access",
    ],
  },
];

const BILLING_RULES = [
  {
    title: "Flat-Rate Monthly Billing (No Markups)",
    icon: CreditCard,
    copy: "Replaceme uses flat-rate monthly subscriptions billed in USD through Stripe. We never charge placement fees, success cuts, or hourly markups on worker salaries.",
  },
  {
    title: "Instant vs. Manual Job Post Approvals",
    icon: Clock,
    copy: "Subscribers on paid plans (Starter, Growth, Scale) enjoy instant job post approvals. Jobs posted under the free Discovery plan are reviewed and approved within 2 business days.",
  },
  {
    title: "Changing or Canceling Your Subscription",
    icon: RefreshCw,
    copy: "You can upgrade, downgrade, or cancel your subscription at any time from your Employer Settings. Upgrades take effect immediately. Downgrades or cancellations apply at the end of your active billing period via Stripe.",
  },
  {
    title: "Direct Worker Payments (0% Commission)",
    icon: ShieldCheck,
    copy: "Replaceme does not process employee payroll. You pay your workers 100% of their agreed wage directly using Wise, PayPal, bank transfer, or crypto. 0% is deducted from worker pay.",
  },
];

function EmployerBillingFallback() {
  return (
    <div className="space-y-10 mt-6">
      {/* Pricing Tiers Grid */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2 text-center">
          Subscription Tiers & Feature Breakdown
        </h2>
        <p className="text-slate-600 text-sm text-center mb-8 max-w-xl mx-auto">
          Choose a plan based on active job posts and messaging needs. All paid plans unlock full candidate profiles and direct chat.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS_OVERVIEW.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                plan.isPopular
                  ? "bg-gradient-to-b from-[#fafdfb] to-white border-2 border-[#006e2f] shadow-lg relative"
                  : "bg-white border border-slate-200/80 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                      plan.isPopular
                        ? "bg-[#e6fbf2] text-[#006e2f] border border-[#006e2f]"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  {plan.isPopular && <Star className="w-4 h-4 fill-[#006e2f] text-[#006e2f]" />}
                </div>

                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm font-medium">{plan.period}</span>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium min-h-[36px]">
                  {plan.description}
                </p>

                <div className="border-t border-slate-100 my-4" />

                <ul className="space-y-2.5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#006e2f] mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link
                  href="/pricing"
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                    plan.isPopular
                      ? "bg-[#006e2f] text-white hover:bg-[#005c26] shadow-xs"
                      : "bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Select Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Core Rules Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#006e2f]" />
          Key Billing & Payment Policies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BILLING_RULES.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="bg-slate-50/70 p-5 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Icon className="w-4 h-4 text-[#006e2f]" />
                  <span>{rule.title}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {rule.copy}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-4">
            <ShieldCheck size={14} />
            Stripe Secure USD Billing
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Manage Your Subscription & Billing
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Ready to upgrade your hiring capabilities or view your invoice history? Access your employer billing dashboard now.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95"
            >
              <span>View Full Pricing Table</span>
              <ArrowRight size={16} className="text-[#006e2f]" />
            </Link>
            <Link
              href="/employer/settings/account"
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30"
            >
              Employer Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EmployerBillingPage() {
  const cms = await getPublishedPageContent("help-employer-billing-subscriptions");

  return (
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] pt-8 sm:pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <CreditCard size={13} className="text-[#006e2f]" />
            <span>Employer Billing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {cms?.title ?? "Billing & Subscriptions Guide"}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            {(cms?.meta?.description as string) ??
              "Understand Replaceme's flat-rate employer subscription plans, Stripe USD billing, instant job approvals, and 0% salary commission rules."}
          </p>
        </div>

        <CmsHtmlContent
          html={cms?.body}
          fallback={<EmployerBillingFallback />}
          className="prose prose-slate max-w-none"
        />
      </div>
    </main>
  );
}
