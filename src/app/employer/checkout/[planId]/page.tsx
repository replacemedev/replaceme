import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createStripeSubscription } from "@/actions/employer/stripe";
import { getPlanDetails } from "@/actions/employer/pricing";
import { OrderSummary } from "@/components/employer/checkout/OrderSummary";
import { CheckoutFormWrapper } from "@/components/employer/checkout/CheckoutFormWrapper";

interface CheckoutPageProps {
  params: Promise<{ planId: string }>;
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { planId } = await params;
  const plan = await getPlanDetails(planId);
  return {
    title: `Checkout - ${plan?.name || "Upgrade Plan"} | ReplaceMe`,
    description: "Complete your subscription upgrade securely via Stripe.",
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { planId } = await params;

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify role is employer
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  // Fetch plan details and generate payment intent clientSecret
  const [plan, checkoutIntent] = await Promise.all([
    getPlanDetails(planId),
    createStripeSubscription(planId),
  ]);

  if (!plan || checkoutIntent.error || !checkoutIntent.clientSecret) {
    // If plan not found or stripe creation fails, redirect to pricing
    redirect("/pricing");
  }

  // Fetch a testimonial from database dynamically
  const { data: testimonialData } = await supabase
    .from("testimonials")
    .select("quote, author_name, author_title, author_company, avatar_url")
    .order("display_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  const testimonial = testimonialData ? {
    quote: testimonialData.quote,
    author: testimonialData.author_name,
    role: testimonialData.author_title,
    company: testimonialData.author_company,
    avatarUrl: testimonialData.avatar_url,
  } : null;

  return (
    <div className="bg-[#f8fafe] min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* Left Column (Order Summary) */}
        <div className="md:sticky md:top-24">
          <OrderSummary
            planName={plan.name}
            planPrice={plan.price}
            features={plan.features}
            testimonial={testimonial}
          />
        </div>

        {/* Right Column (Stripe Payment Form Box) */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-xl shadow-blue-900/5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckoutFormWrapper
            planId={plan.id}
            planPrice={plan.price}
            clientSecret={checkoutIntent.clientSecret}
          />
        </div>
      </div>
    </div>
  );
}
