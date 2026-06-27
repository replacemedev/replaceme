"use client";

import React from "react";
import Link from "next/link";
import { User, ShieldAlert, CreditCard, Building2 } from "lucide-react";

export function AccountDetailsList() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
      </div>

      <div className="divide-y divide-slate-50">
        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Profile Information
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Your employer login and display name
              </p>
            </div>
          </div>
          <Link
            href="/employer/settings/account"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View
          </Link>
        </div>

        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Company Profile
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Logo, industry, and public company details
              </p>
            </div>
          </div>
          <Link
            href="/employer/settings/company"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Manage
          </Link>
        </div>

        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Account Security
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Password and session security
              </p>
            </div>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Reset password
          </Link>
        </div>

        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Billing (USD)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Subscriptions billed monthly in US dollars via Stripe
              </p>
            </div>
          </div>
          <Link
            href="/employer/pricing"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
