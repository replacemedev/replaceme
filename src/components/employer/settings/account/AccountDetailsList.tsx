"use client";

import React from "react";
import Link from "next/link";
import { User, ShieldAlert, CreditCard } from "lucide-react";

export function AccountDetailsList() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Account Details & Billing</h2>
      </div>

      <div className="divide-y divide-slate-50">
        {/* Profile Information */}
        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Profile Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">Update your name and contact details</p>
            </div>
          </div>
          <Link
            href="/settings/account"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Manage
          </Link>
        </div>

        {/* Account Security */}
        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Account Security</h3>
              <p className="text-xs text-slate-400 mt-0.5">Change password and 2FA settings</p>
            </div>
          </div>
          <Link
            href="/settings/account"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Update
          </Link>
        </div>

        {/* Billing Information */}
        <div className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-50 text-slate-500 rounded-xl shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Billing Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage payment methods and invoices</p>
            </div>
          </div>
          <Link
            href="/settings/account"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
