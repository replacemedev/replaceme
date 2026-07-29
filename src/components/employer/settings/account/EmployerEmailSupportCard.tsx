"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { LifeBuoy, Send } from "lucide-react";
import { sendEmployerSupportEmail } from "@/actions/email";

export function EmployerEmailSupportCard() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      const toastId = toast.loading("Sending support request...");
      try {
        const result = await sendEmployerSupportEmail({ subject, message });
        if (!result.success) {
          toast.error(result.error, { id: toastId });
          return;
        }
        toast.success("Support email sent. We'll reply to your account email.", {
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
            Available on all plans, including Discovery. We reply to your account email.
          </p>
        </div>
      </div>

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
            placeholder="e.g. Billing question"
            className="mt-1.5 w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:ring-2 focus:ring-[#006e2f]/15 disabled:opacity-60"
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
            placeholder="Describe what you need help with."
            className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:ring-2 focus:ring-[#006e2f]/15 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#006e2f] px-4 text-sm font-bold text-white transition-colors hover:bg-[#005c26] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto [-webkit-tap-highlight-color:transparent]"
        >
          <Send className="h-4 w-4" aria-hidden />
          {isPending ? "Sending…" : "Send support email"}
        </button>
      </form>
    </div>
  );
}
