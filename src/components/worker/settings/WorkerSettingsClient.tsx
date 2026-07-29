"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bell, ChevronRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateWorkerSettings } from "@/actions/worker/profile";
import {
  COMPENSATION_CURRENCIES,
  type CompensationCurrency,
} from "@/lib/format/currency";
import { WorkerAccountIdentityCard } from "@/components/worker/settings/WorkerAccountIdentityCard";
import { DataDeletionRequestCard } from "@/components/shared/privacy/DataDeletionRequestCard";
import { ContactSupportCard } from "@/components/shared/privacy/ContactSupportCard";
import { Checkbox } from "@/components/ui/checkbox";

const SETTINGS_NAV = [
  {
    href: "/worker/settings/notifications",
    label: "Notification preferences",
    description: "Choose which alerts you receive by email and in-app.",
    icon: Bell,
  },
  {
    href: "/worker/settings/security",
    label: "Password & security",
    description: "Update your password and manage account security.",
    icon: Shield,
  },
] as const;

const inputClassName =
  "mt-1.5 w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors placeholder:text-slate-400 focus:border-[#006e2f]/50 focus:outline-hidden focus:ring-2 focus:ring-[#006e2f]/15";

interface WorkerSettingsClientProps {
  identity: {
    email: string | null;
  };
  initial: {
    availability: string;
    hourlyRate: number;
    isRemote: boolean;
    salaryCurrency: string;
  };
  deletionStatus?: { status: string; createdAt: string; scheduledFor?: string | null } | null;
}

const AVAILABILITY = [
  "Full-time",
  "Part-time",
  "Contract",
  "Not available",
] as const;

export function WorkerSettingsClient({
  identity,
  initial,
}: WorkerSettingsClientProps) {
  const [pending, startTransition] = useTransition();
  const [availability, setAvailability] = useState(initial.availability);
  const [hourlyRate, setHourlyRate] = useState(String(initial.hourlyRate));
  const [salaryCurrency, setSalaryCurrency] = useState(
    initial.salaryCurrency as CompensationCurrency
  );
  const [isRemote, setIsRemote] = useState(initial.isRemote);

  function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateWorkerSettings({
        availability: availability as (typeof AVAILABILITY)[number],
        hourlyRate: Number(hourlyRate),
        isRemote,
        salaryCurrency,
      });
      if (result.error) toast.error(result.error);
      else toast.success("Settings saved");
    });
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <WorkerAccountIdentityCard email={identity.email} />

      <nav
        aria-label="Settings shortcuts"
        className="flex flex-col gap-4 md:flex-row md:gap-5"
      >
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-11 flex-1 items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-[#006e2f]/40 hover:bg-[#ebfdf2]/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {item.label}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#006e2f]"
                    aria-hidden
                  />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <form
          onSubmit={saveSettings}
          className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6"
        >
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Availability & Rate
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Also editable from your public profile sidebar.
            </p>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            Availability
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className={inputClassName}
            >
              {AVAILABILITY.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Compensation currency
            <select
              value={salaryCurrency}
              onChange={(e) =>
                setSalaryCurrency(e.target.value as CompensationCurrency)
              }
              className={inputClassName}
            >
              {COMPENSATION_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Hourly rate
            <input
              type="number"
              min={0}
              step={1}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold leading-snug text-slate-700">
            <Checkbox
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="shrink-0"
            />
            Open to remote work
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#006e2f] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#005c26] disabled:opacity-60 sm:w-auto"
          >
            Save Settings
          </button>
        </form>

        <ContactSupportCard
          title="Safety or billing concern?"
          description="Email our support team about workplace issues, account problems, or platform questions."
          subject="Worker support request"
        />
      </div>

      <DataDeletionRequestCard />
    </div>
  );
}
