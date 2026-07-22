import { getPublishedPageContent } from "@/actions/public/page-content";
import { CmsHtmlContent } from "@/components/shared/cms/CmsHtmlContent";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://replaceme.ph";

export const metadata: Metadata = {
  title: "Employer Billing & Subscriptions Guide | Replaceme Tiers & Rules",
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
    title: "Employer Billing & Subscriptions Guide | Replaceme",
    description:
      "Understand Replaceme's flat-rate employer subscription plans, Stripe USD billing, instant job approvals, and 0% salary commission rules.",
    url: `${BASE_URL}/help/employer/billing-subscriptions`,
    type: "article",
  },
};

export const dynamic = "force-dynamic";

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
    <div className="space-y-8 mt-6">
      {/* Core Rules Section */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/80 shadow-xs space-y-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#006e2f] shrink-0" />
          <span>Key Billing & Payment Policies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {BILLING_RULES.map((rule, idx) => {
            const Icon = rule.icon;
            return (
              <div key={idx} className="bg-slate-50/70 p-4 sm:p-5 rounded-xl border border-slate-100 space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <Icon className="w-4 h-4 text-[#006e2f] shrink-0" />
                  <span className="truncate">{rule.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {rule.copy}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-4">
            <ShieldCheck size={14} className="shrink-0" />
            <span>Stripe Secure USD Billing</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Manage Your Subscription & Billing
          </h3>
          <p className="text-emerald-100/90 text-sm sm:text-base mb-6 leading-relaxed">
            Ready to upgrade your hiring capabilities or view your invoice history? Access your employer billing dashboard now.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-slate-900 bg-white hover:bg-emerald-50 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-95 text-center"
            >
              <span>View Full Pricing Table</span>
              <ArrowRight size={16} className="text-[#006e2f] shrink-0" />
            </Link>
            <Link
              href="/employer/settings/account"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors duration-200 border border-emerald-500/30 text-center"
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
    <main className="bg-slate-50/50 min-h-[calc(100vh-4rem)] py-8 md:py-12 lg:py-16">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200 mb-3">
            <CreditCard size={13} className="text-[#006e2f] shrink-0" />
            <span>Employer Billing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
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
