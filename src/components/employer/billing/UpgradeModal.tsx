"use client";

import React from "react";
import { X, Lock, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeCheckoutForm } from "./StripeCheckoutForm";

// Initialize Stripe outside component render loop to prevent re-instantiations
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51replace_me_mock_publishable_key"
);

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  planName: string;
  planPrice: number;
  clientSecret: string | null;
  onSuccess: () => void;
}

export function UpgradeModal({
  isOpen,
  onClose,
  candidateName,
  planName,
  planPrice,
  clientSecret,
  onSuccess,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  const features = [
    "Up to 3 Job Posts",
    "Up to 200 Applicants",
    "Contact 75 Candidates/mo",
    "Full Identities & Resumes",
    "Instant Approval",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
        {/* Left Pane: Feature List */}
        <div className="w-full md:w-1/2 bg-gray-50/50 p-8 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-500 mb-6">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
              Unlock Your Candidates
            </h3>
            <p className="text-sm font-medium text-gray-500 mt-2 leading-relaxed">
              To view full details and resume for <strong className="text-gray-800">{candidateName}</strong>, please upgrade your subscription plan.
            </p>

            <ul className="mt-8 space-y-3.5">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-[#e6fbf2] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-[#10b981] stroke-[4]" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onClose}
            className="hidden md:block mt-8 text-xs font-semibold text-gray-400 hover:text-gray-600 cursor-pointer self-start transition-colors"
          >
            ← Back to Pipeline
          </button>
        </div>

        {/* Right Pane: Stripe Elements Checkout Form */}
        <div className="w-full md:w-1/2 p-8 relative flex flex-col justify-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Conditional Elements wrapper depending on clientSecret availability */}
          {clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#10b981",
                  },
                },
              }}
            >
              <StripeCheckoutForm
                planName={planName}
                planPrice={planPrice}
                onSuccess={onSuccess}
                onCancel={onClose}
              />
            </Elements>
          ) : (
            /* Fallback loader / placeholder while secret is loading or if missing in dev */
            <Elements stripe={stripePromise}>
              <StripeCheckoutForm
                planName={planName}
                planPrice={planPrice}
                onSuccess={onSuccess}
                onCancel={onClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
