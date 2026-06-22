"use client";

import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripePaymentForm } from "./StripePaymentForm";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Initialize Stripe outside of the render cycle
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51replace_me_mock_publishable_key"
);

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
    router.push("/pricing");
    router.refresh();
  };

  return (
    <Elements
      stripe={stripePromise}
      options={
        clientSecret && !clientSecret.startsWith("pi_mock_")
          ? {
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#10b981",
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
