"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck, Loader2 } from "lucide-react";

interface StripeCheckoutFormProps {
  planName: string;
  planPrice: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckoutForm({
  planName,
  planPrice,
  onSuccess,
  onCancel,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    // Simulate Stripe payment request delay or handle mock secret flow
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    try {
      // In dev environment with simulated secret, we succeed immediately after delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setProcessing(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || "An error occurred during checkout.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {/* Stripe Form Box Header */}
      <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex justify-between items-center">
        <div>
          <h4 className="text-sm font-bold text-gray-900 capitalize">Upgrade to {planName}</h4>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">Secure monthly subscription</p>
        </div>
        <div className="text-right">
          <span className="text-xl font-extrabold text-gray-900">${planPrice}</span>
          <span className="text-gray-400 text-xs font-medium">/mo</span>
        </div>
      </div>

      {/* Credit Card Input Container */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Credit or Debit Card
        </label>
        <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#10b981] transition-all duration-200">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#1f2937",
                  fontFamily: "Inter, sans-serif",
                  "::placeholder": {
                    color: "#9ca3af",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="text-sm text-red-500 font-semibold">{error}</div>}

      {/* CTA Button */}
      <button
        type="submit"
        disabled={processing || !stripe}
        className="w-full py-4 bg-[#10b981] text-white font-bold text-sm rounded-xl hover:bg-[#0d9668] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Secure Payment...
          </>
        ) : (
          `Unlock My Candidates Now →`
        )}
      </button>

      {/* Security Info and Footer */}
      <div className="flex justify-between items-center text-xs font-semibold text-gray-400 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          Secured by Stripe
        </div>
        <div>Cancel anytime. No hidden fees.</div>
      </div>
    </form>
  );
}
