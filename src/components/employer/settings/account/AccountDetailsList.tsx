"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, CreditCard, Building2 } from "lucide-react";
import { PasswordResetButton } from "./PasswordResetButton";

export function AccountDetailsList() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
      </div>

      <div className="divide-y divide-slate-50">

        <div className="flex flex-col gap-3 p-6 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="shrink-0 rounded-xl bg-slate-50 p-2.5 text-slate-500">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800">
                Company Profile
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Logo, industry, and public company details
              </p>
            </div>
          </div>
          <Link
            href="/employer/settings/company"
            className="shrink-0 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            Manage
          </Link>
        </div>

        <div className="flex flex-col gap-3 p-6 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="shrink-0 rounded-xl bg-slate-50 p-2.5 text-slate-500">
              <ShieldAlert size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800">
                Account Security
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Password and session security
              </p>
            </div>
          </div>
          <PasswordResetButton />
        </div>

        <div className="flex flex-col gap-3 p-6 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="shrink-0 rounded-xl bg-slate-50 p-2.5 text-slate-500">
              <CreditCard size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-800">
                Billing (USD)
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Subscriptions billed monthly in US dollars via Stripe
              </p>
            </div>
          </div>
          <Link
            href="#manage-plan"
            className="shrink-0 text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700"
          >
            Manage plan
          </Link>
        </div>
      </div>
    </div>
  );
}
