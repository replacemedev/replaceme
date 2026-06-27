"use client";

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const StripePaymentForm = dynamic(
  () => import("./StripePaymentForm").then((mod) => mod.StripePaymentForm),
  {
    ssr: false, // Stripe forms require window/document access
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-medium font-body-bold">Loading payment secure window...</p>
      </div>
    ),
  }
)

// Initialize Stripe outside of the render cycle
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormWrapperProps {
  planId: string;
  planPrice: number;
  clientSecret: string | null;
}

export function CheckoutFormWrapper({
  planId,
  planPrice,
  clientSecret,
}: CheckoutFormWrapperProps) {
  const router = useRouter();

  const handleSuccess = () => {
    toast.success("Subscription upgraded successfully!");
    router.push("/employer/settings/account?checkout=success");
    router.refresh();
  };

  return (
    <Elements
      stripe={stripePromise}
      options={
        clientSecret && clientSecret.includes("_secret_")
          ? {
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#006e2f",
                fontFamily: "Inter, sans-serif",
              },
            },
          }
          : undefined
      }
    >
      <StripePaymentForm
        planId={planId}
        planPrice={planPrice}
        clientSecret={clientSecret}
        onSuccess={handleSuccess}
      />
    </Elements>
  );
}
