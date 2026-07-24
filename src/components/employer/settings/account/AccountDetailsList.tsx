"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Building2 } from "lucide-react";
import { ChangePasswordButton } from "./ChangePasswordButton";

function AccountDetailRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-6 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="shrink-0 rounded-xl bg-slate-50 p-2.5 text-slate-500">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex w-full shrink-0 items-center pl-14 sm:w-auto sm:justify-end sm:pl-0">
        {action}
      </div>
    </div>
  );
}

export function AccountDetailsList() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-800">Account Details</h2>
      </div>

      <div className="divide-y divide-slate-50">
        <AccountDetailRow
          icon={<Building2 size={20} />}
          title="Company Profile"
          description="Logo, industry, and public company details"
          action={
            <Link
              href="/employer/settings/company"
              className="inline-flex min-h-11 shrink-0 items-center text-sm font-bold text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Manage
            </Link>
          }
        />

        <AccountDetailRow
          icon={<ShieldAlert size={20} />}
          title="Account Security"
          description="Password and session security"
          action={<ChangePasswordButton />}
        />
      </div>
    </div>
  );
}
