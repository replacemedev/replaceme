"use client";

import { ShieldAlert } from "lucide-react";
import { ChangePasswordButton } from "./ChangePasswordButton";

export function PasswordSecurityCard() {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <ShieldAlert className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Account password
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Update your password while signed in. You will stay signed in on
              this device.
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 pl-14 sm:w-auto sm:justify-end sm:pl-0">
          <ChangePasswordButton />
        </div>
      </div>
    </section>
  );
}
