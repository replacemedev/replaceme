import Link from "next/link";
import { Check, Star } from "lucide-react";
import type { PricingPlan } from "@/types/employer/billing";
import { formatMoney } from "@/lib/format/currency";

interface LandingPricingBentoProps {
  plans: PricingPlan[];
}

function planRank(slug: string): number {
  const rank: Record<string, number> = {
    discovery: 0,
    starter: 1,
    growth: 2,
    scale: 3,
  };
  return rank[slug] ?? 9;
}

function ctaHref(slug: string): string {
  return slug === "discovery" ? "/signup/employer" : "/employer/pricing";
}

function ctaClassName(slug: string): string {
  const base =
    "flex w-full items-center justify-center rounded-xl py-3 px-4 text-sm font-semibold transition-all duration-200 min-h-[44px]";

  if (slug === "growth") {
    return `${base} bg-[#10b981] text-white hover:bg-[#0d9668] shadow-[0_8px_24px_-6px_rgba(16,185,129,0.55)] hover:-translate-y-0.5`;
  }
  if (slug === "scale") {
    return `${base} border border-[#10b981] text-[#10b981] bg-white hover:bg-[#e6fbf2]`;
  }
  if (slug === "discovery") {
    return `${base} border-2 border-[#006e2f] text-[#006e2f] bg-[#fafdfb] hover:bg-[#ebfdf2]`;
  }
  return `${base} bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-0.5 shadow-sm`;
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

  const ordered = [...plans].sort((a, b) => planRank(a.slug) - planRank(b.slug));

  return (
    <div className="landing-pricing-grid w-full min-w-0 max-w-7xl mx-auto text-left reveal-item">
      {ordered.map((plan, index) => {
        const isGrowth = plan.slug === "growth";
        const isPopular = plan.popular || isGrowth;

        return (
          <article
            key={plan.id}
            className={`landing-pricing-card group relative flex flex-col justify-between rounded-2xl bg-white p-6 min-w-0 transition-all duration-300 ${
              isGrowth
                ? "landing-pricing-growth border-2 border-[#10b981] shadow-[0_0_48px_-10px_rgba(34,197,94,0.65)] xl:-translate-y-3 z-10"
                : "border border-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-slate-300"
            }`}
            style={{ transitionDelay: `${index * 60}ms` }}
          >
            {isPopular ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e6fbf2] border border-[#10b981] text-[#10b981] text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1 whitespace-nowrap shadow-sm">
                <Star className="h-3 w-3 fill-[#10b981] stroke-[#10b981]" aria-hidden />
                Most Popular
              </div>
            ) : plan.slug === "discovery" ? (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full whitespace-nowrap">
                Free forever
              </div>
            ) : null}

            <div>
              <h3 className="text-lg font-bold text-slate-900 capitalize">
                {plan.name}
                {plan.slug === "discovery" ? (
                  <span className="text-sm font-normal text-slate-500 ml-1.5">
                    (Free)
                  </span>
                ) : null}
              </h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className={`font-extrabold text-slate-900 tracking-tight flex items-baseline ${
                    isGrowth ? "text-4xl" : "text-3xl"
                  }`}
                >
                  {formatMoney(plan.price, "USD", { asReact: true, codeClassName: "text-slate-500 text-sm font-semibold ml-1" })}
                </span>
                <span className="text-slate-500 font-medium text-sm">/mo</span>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isGrowth ? "bg-[#d1fae5]" : "bg-[#e6fbf2]"
                      }`}
                    >
                      <Check
                        className={`h-3.5 w-3.5 stroke-[3] ${
                          isGrowth ? "text-[#059669]" : "text-[#10b981]"
                        }`}
                        aria-hidden
                      />
                    </span>
                    <span className="text-slate-600 text-xs font-medium leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <Link href={ctaHref(plan.slug)} className={ctaClassName(plan.slug)}>
                {plan.ctaText}
              </Link>
            </div>
          </article>
        );
      })}
      <div className="col-span-full text-center mt-6">
        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
          All prices are billed exclusively in USD (United States Dollars) through Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
