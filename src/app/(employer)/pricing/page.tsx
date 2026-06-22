import React from "react";
import { getPricingData } from "@/actions/employer/pricing";
import { getCurrentEmployerSubscription } from "@/actions/employer/billing";
import { PricingCards } from "@/components/employer/pricing/PricingCards";
import { CompareTable } from "@/components/employer/pricing/CompareTable";
import { Testimonials } from "@/components/employer/pricing/Testimonials";
import { FAQ } from "@/components/employer/pricing/FAQ";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Pricing - Scale Your Remote Team | ReplaceMe",
  description: "Simple, transparent pricing. Find the plan that fits your remote hiring needs. Start free and upgrade when you're ready to hire.",
};

export default async function PricingPage() {
  // Fetch pricing plans dynamically from database
  const { plans } = await getPricingData();

  // Fetch the employer's current active subscription state securely on the server
  const subscription = await getCurrentEmployerSubscription();

  const handleSelectPlan = async (planName: string) => {
    "use server";
    if (planName === "discovery") {
      redirect("/jobs/create");
    } else {
      // Redirect to the dedicated checkout screen
      redirect(`/checkout/${planName}`);
    }
  };

  const isPaidUser = subscription?.active && subscription.planName.toLowerCase() !== "discovery";

  return (
    <div className="bg-[#f8fafe] min-h-screen py-16">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto px-4 mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Scale Your Remote Team. Simple, Transparent Pricing.
        </h1>
        <p className="text-gray-500 font-medium text-lg mt-4 leading-relaxed">
          From your first virtual assistant to an entire remote department, choose the plan that fits
          your hiring needs. Start free and upgrade when you're ready to hire.
        </p>
      </div>

      {/* Conditional Pricing UI Gated Server-Side */}
      {isPaidUser ? (
        <div className="max-w-2xl mx-auto px-4 mb-16">
          <div className="bg-white border border-[#10b981]/25 rounded-[32px] p-8 md:p-10 shadow-xl shadow-blue-900/5 text-center space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#10b981]" />
            <div className="w-16 h-16 bg-[#e6fbf2] border border-[#10b981]/15 rounded-full flex items-center justify-center text-[#10b981] mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Already Subscribed</h2>
              <p className="text-gray-500 font-semibold text-sm leading-relaxed max-w-md mx-auto">
                You are currently subscribed to the <span className="text-[#10b981] font-extrabold">{subscription.planName} Plan</span>. 
                Manage your subscription, view limits, or retrieve billing statements in your settings.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/settings/account"
                className="inline-flex items-center gap-2 py-4 px-8 bg-[#10b981] hover:bg-[#0d9668] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Manage Subscription in Account Settings
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Pricing Cards Grid (Only visible to Free / Discovery users) */
        <PricingCards plans={plans} onSelectPlan={handleSelectPlan} />
      )}

      {/* Comparative Features Matrix Table */}
      <CompareTable plans={plans} />

      {/* Testimonials block */}
      <Testimonials />

      {/* Got Questions Accordions list */}
      <FAQ />
    </div>
  );
}
