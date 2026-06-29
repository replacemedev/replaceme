import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { PricingPlan } from "@/types/employer/billing";

const PLAN_ICONS: Record<string, LucideIcon> = {
  discovery: Sparkles,
  starter: Briefcase,
  growth: Rocket,
  scale: Building2,
};

const PLAN_VALUE_HOOKS: Record<string, string> = {
  discovery: "Explore the marketplace with zero commitment.",
  starter: "Ideal for lean teams posting their first roles.",
  growth: "Best for scaling teams that need speed and visibility.",
  scale: "Unlimited hiring power for high-volume recruiters.",
};

interface LandingPricingBentoProps {
  plans: PricingPlan[];
}

export function LandingPricingBento({ plans }: LandingPricingBentoProps) {
  if (plans.length === 0) {
    return (
      <p className="text-center text-slate-300 text-sm max-w-md mx-auto">
        Plans load from your account database — see full comparison on the pricing
        page.
      </p>
    );
  }

  const ordered = [...plans].sort((a, b) => {
    const rank: Record<string, number> = {
      discovery: 0,
      starter: 1,
      growth: 2,
      scale: 3,
    };
    return (rank[a.slug] ?? 9) - (rank[b.slug] ?? 9);
  });

  return (
  <div className="landing-pricing-bento w-full min-w-0 max-w-6xl mx-auto text-left">
      {ordered.map((plan) => {
        const isGrowth = plan.slug === "growth";
        const Icon = PLAN_ICONS[plan.slug] ?? Briefcase;

        return (
          <article
            key={plan.id}
            className={`landing-pricing-card group relative flex flex-col rounded-3xl border p-6 min-w-0 transition-all duration-300 ${
              isGrowth
                ? "landing-pricing-growth border-emerald-400/50 bg-gradient-to-br from-white via-emerald-50/30 to-white text-slate-900 shadow-[0_0_40px_-8px_rgba(34,197,94,0.55)]"
                : "border-white/15 bg-white/95 text-slate-800 hover:border-white/30 hover:shadow-lg"
            }`}
          >
            {isGrowth ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#22c55e] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-lg">
                Recommended
              </div>
            ) : plan.popular ? (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase whitespace-nowrap border border-emerald-200">
                Popular
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {plan.slug === "discovery" ? "Free tier" : "Employer plan"}
                </p>
                <h3 className="text-xl font-bold capitalize mt-0.5 truncate">
                  {plan.name}
                </h3>
              </div>
              <div
                className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  isGrowth
                    ? "bg-[#22c55e] text-white shadow-md"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-4 text-pretty">
              {PLAN_VALUE_HOOKS[plan.slug] ?? plan.features[0]}
            </p>

            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-extrabold tracking-tight">
                ${plan.price}
              </span>
              <span className="text-sm font-medium text-slate-400">/mo</span>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.slice(0, isGrowth ? 5 : 4).map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      isGrowth ? "bg-emerald-100 text-[#16a34a]" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" aria-hidden />
                  </span>
                  <span className="text-slate-600 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.slug === "discovery" ? "/signup" : `/employer/pricing`}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all min-h-[44px] ${
                isGrowth
                  ? "bg-[#22c55e] text-white hover:bg-[#16a34a] hover:-translate-y-0.5 shadow-[0_8px_24px_-6px_rgba(34,197,94,0.5)]"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {plan.ctaText}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
