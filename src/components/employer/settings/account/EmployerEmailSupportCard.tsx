"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LifeBuoy, Lock, Send } from "lucide-react";
import type { SubscriptionTier } from "@/types/employer/billing";
import { sendEmployerSupportEmail } from "@/actions/email";
import { TIER_LABELS } from "@/lib/entitlements/ui-copy";

interface EmployerEmailSupportCardProps {
  currentPlan: SubscriptionTier;
}

export function EmployerEmailSupportCard({
  currentPlan,
}: EmployerEmailSupportCardProps) {
  const isPaid = currentPlan !== "discovery";
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isPaid) return;

    startTransition(async () => {
      const toastId = toast.loading("Sending support request...");
      try {
        const result = await sendEmployerSupportEmail({ subject, message });
        if (!result.success) {
          toast.error(result.error, { id: toastId });
          return;
        }
        toast.success("Support email sent. We’ll reply to your account email.", {
          id: toastId,
        });
        setSubject("");
        setMessage("");
      } catch {
        toast.error("Could not send support email. Please try again.", {
          id: toastId,
        });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <LifeBuoy className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">Email support</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {isPaid
              ? `Available on your ${TIER_LABELS[currentPlan]} plan. Messages go to our team with reply-to set to your account email.`
              : "Email support is included on Starter, Growth, and Scale. Upgrade to contact the team from your dashboard."}
          </p>
        </div>
      </div>

      {!isPaid ? (
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-amber-950">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
            <p className="font-medium leading-relaxed">
              Discovery (free) cannot send email support. Upgrade to unlock this
              channel.
            </p>
          </div>
          <Link
            href="/employer/pricing"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#006e2f] px-4 text-xs font-bold text-white transition-colors hover:bg-[#005c26]"
          >
            View plans
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="employer-support-subject"
              className="block text-xs font-bold text-slate-700"
            >
              Subject
            </label>
            <input
              id="employer-support-subject"
              type="text"
              required
              minLength={3}
              maxLength={120}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isPending}
              placeholder="e.g. Billing question about my Growth plan"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:ring-2 focus:ring-[#006e2f]/15 disabled:opacity-60"
            />
          </div>
          <div>
            <label
              htmlFor="employer-support-message"
              className="block text-xs font-bold text-slate-700"
            >
              Message
            </label>
            <textarea
              id="employer-support-message"
              required
              minLength={20}
              maxLength={4000}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              placeholder="Describe what you need help with. Include job IDs or invoice details if relevant."
              className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:ring-2 focus:ring-[#006e2f]/15 disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white transition-colors hover:bg-[#005c26] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Send className="h-4 w-4" aria-hidden />
            {isPending ? "Sending…" : "Send support email"}
          </button>
        </form>
      )}
    </div>
  );
}
