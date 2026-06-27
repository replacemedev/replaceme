"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck, Loader2, Mail, User, Globe } from "lucide-react";
import { reconcilePaymentIntent } from "@/actions/employer/stripe";

interface StripePaymentFormProps {
  planId: string;
  planPrice: number;
  clientSecret: string | null;
  onSuccess: () => void;
}

export function StripePaymentForm({
  planPrice,
  clientSecret,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [country, setCountry] = useState("US");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nameOnCard) {
      setError("Please fill out all required details.");
      return;
    }

    if (!stripe || !elements || !clientSecret || !clientSecret.includes("_secret_")) {
      setError(
        "Stripe is not configured for this environment. Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and use stripe listen for local webhooks."
      );
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    try {
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: nameOnCard,
              email,
              address: { country },
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Stripe payment confirmation failed.");
        setProcessing(false);
        return;
      }

      if (!paymentIntent || paymentIntent.status !== "succeeded") {
        setError("Payment authorization pending or failed.");
        setProcessing(false);
        return;
      }

      const reconcile = await reconcilePaymentIntent(paymentIntent.id);
      if (!reconcile.success) {
        setError(
          reconcile.error ||
            "Payment succeeded but subscription sync is pending. Refresh in a moment."
        );
        setProcessing(false);
        return;
      }

      setProcessing(false);
      onSuccess();
    } catch {
      setError("A network error occurred while contacting Stripe.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-7">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
        Payment Details
      </h2>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f]/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Card Information
        </label>
        <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#006e2f] focus-within:ring-1 focus-within:ring-[#006e2f]/20 transition-all duration-200">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#1f2937",
                  fontFamily: "Inter, sans-serif",
                  "::placeholder": { color: "#9ca3af" },
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Name on card
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            placeholder="Full Name"
            required
            className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f]/20 transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Country or region
        </label>
        <div className="relative">
          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full pl-11 pr-10 py-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#006e2f] focus:ring-1 focus:ring-[#006e2f]/20 transition-all appearance-none cursor-pointer"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3.5 rounded-xl text-xs font-bold leading-relaxed">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={processing}
        className="w-full py-4 bg-[#006e2f] text-white font-bold text-sm rounded-xl hover:bg-[#0d9668] focus:outline-none focus:ring-4 focus:ring-[#006e2f]/20 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing Secure Payment...
          </>
        ) : (
          `Pay $${planPrice.toFixed(2)} →`
        )}
      </button>

      <div className="flex flex-col items-center justify-center space-y-2 pt-4 border-t border-gray-100 text-[10px] font-bold text-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            Secure SSL Connection
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
          <div>Powered by Stripe</div>
        </div>
      </div>
    </form>
  );
}
