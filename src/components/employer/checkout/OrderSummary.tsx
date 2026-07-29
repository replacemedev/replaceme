import React from "react";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { NavBrand } from "@/components/shared/nav/NavBrand";
import { formatCurrency } from "@/lib/format/currency";
import type { BillingInterval } from "@/lib/pricing/billing-interval";

interface OrderSummaryProps {
  planName: string;
  planPrice: number;
  features: string[];
  billingInterval?: BillingInterval;
  /** Yearly prepaid total due today when interval is year. */
  annualTotal?: number | null;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
    avatarUrl: string | null;
  } | null;
}

export function OrderSummary({
  planName,
  planPrice,
  features,
  billingInterval = "year",
  annualTotal = null,
  testimonial,
}: OrderSummaryProps) {
  return (
    <div className="flex flex-col justify-between h-full space-y-12 md:space-y-0">
      <div>
        <Link
          href="/employer/pricing"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors group mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to pricing
        </Link>

        <NavBrand homeHref="/employer/dashboard" compact className="mb-12" />

        <div className="space-y-3">
          <span className="text-xs font-black tracking-wider text-[#006e2f] uppercase">
            SUBSCRIBE TO
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            {planName} Plan
          </h1>
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-4xl font-extrabold text-gray-900">
              {formatCurrency(planPrice, "USD", {
                asReact: true,
                codeClassName: "text-gray-500 text-lg font-semibold ml-1",
              })}
            </span>
            <span className="text-gray-400 text-sm font-bold">/month</span>
          </div>
          {billingInterval === "year" && annualTotal != null ? (
            <p className="text-sm font-bold text-slate-800 mt-2">
              Total due today:{" "}
              {formatCurrency(annualTotal, "USD", {
                asReact: true,
                codeClassName: "text-slate-500 text-xs font-semibold ml-0.5",
              })}
              <span className="text-slate-500 font-semibold"> /year</span>
            </p>
          ) : null}
          <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
            {billingInterval === "year"
              ? "Annual prepaid subscription · renews each year unless cancelled · tax calculated at Stripe Checkout when applicable"
              : "Billed monthly in USD · tax calculated at Stripe Checkout when applicable · cancel anytime"}
          </p>
        </div>

        <div className="h-px bg-gray-100 my-10" />

        <div className="space-y-5">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
            Key Benefits
          </h3>
          <ul className="space-y-4">
            {features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  className="mt-[2px] inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-[#006e2f]/10 bg-[#ebfdf2]"
                  aria-hidden
                >
                  <Check className="size-2.5 text-[#006e2f] stroke-[3]" />
                </span>
                <span className="text-sm font-semibold text-gray-700 leading-relaxed">
                  {feat}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {testimonial && (
        <div className="bg-[#f3f7fd] border border-blue-50/50 p-6 md:p-8 rounded-3xl space-y-5 mt-12 md:mt-auto relative overflow-hidden">
          <div className="absolute right-4 top-4 text-8xl text-blue-100/30 font-serif select-none pointer-events-none">
            “
          </div>
          <p className="text-gray-600 font-semibold text-sm leading-relaxed italic relative z-10">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="flex items-center gap-3 relative z-10">
            {testimonial.avatarUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white shadow-sm">
                <Image
                  src={testimonial.avatarUrl}
                  alt={testimonial.author}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-white shadow-sm">
                {testimonial.author.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-xs font-bold text-gray-900">
                {testimonial.author}
              </h4>
              <p className="text-[10px] font-bold text-gray-400">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
