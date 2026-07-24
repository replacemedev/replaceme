"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Bell, ChevronRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateWorkerSettings } from "@/actions/worker/profile";
import { reportEmployer } from "@/actions/worker/phase2";
import {
  COMPENSATION_CURRENCIES,
  type CompensationCurrency,
} from "@/lib/format/currency";

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

interface WorkerSettingsClientProps {
  initial: {
    availability: string;
    hourlyRate: number;
    isRemote: boolean;
    salaryCurrency: string;
  };
}

const AVAILABILITY = [
  "Full-time",
  "Part-time",
  "Contract",
  "Not available",
] as const;

export function WorkerSettingsClient({ initial }: WorkerSettingsClientProps) {
  const [pending, startTransition] = useTransition();
  const [availability, setAvailability] = useState(initial.availability);
  const [hourlyRate, setHourlyRate] = useState(String(initial.hourlyRate));
  const [salaryCurrency, setSalaryCurrency] = useState(
    initial.salaryCurrency as CompensationCurrency
  );
  const [isRemote, setIsRemote] = useState(initial.isRemote);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");

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

  function submitDispute(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await reportEmployer({
        title: reportTitle,
        description: reportDescription,
      });
      if (result.error) toast.error(result.error);
      else {
        toast.success("Report submitted");
        setReportTitle("");
        setReportDescription("");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <nav
        aria-label="Settings shortcuts"
        className="lg:col-span-2 flex flex-col gap-4 md:flex-row md:gap-6"
      >
        {SETTINGS_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-1 items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-[#006e2f]/40 hover:bg-[#ebfdf2]/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] sm:p-5"
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
      <form
        onSubmit={saveSettings}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Availability & Rate
        </h2>
        <label className="block text-sm font-medium text-slate-700">
          Availability
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {AVAILABILITY.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Compensation currency
          <select
            value={salaryCurrency}
            onChange={(e) =>
              setSalaryCurrency(e.target.value as CompensationCurrency)
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {COMPENSATION_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Hourly rate
          <input
            type="number"
            min={0}
            step={1}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => setIsRemote(e.target.checked)}
          />
          Open to remote work
        </label>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 text-sm font-bold text-white bg-[#006e2f] hover:bg-[#005c26] rounded-xl disabled:opacity-60"
        >
          Save Settings
        </button>
      </form>

      <form
        onSubmit={submitDispute}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Report Employer
        </h2>
        <p className="text-xs text-slate-500">
          Submit a dispute or safety report. Our team will review it.
        </p>
        <label className="block text-sm font-medium text-slate-700">
          Subject
          <input
            required
            minLength={5}
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Details
          <textarea
            required
            minLength={10}
            rows={4}
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl disabled:opacity-60"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}
