"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { updateEmployerNotificationPref } from "@/actions/employer/account";

const OPTIONS = [
  {
    value: "email_every_applicant" as const,
    label: "Email for every new applicant",
    description: "Get notified immediately when someone applies.",
  },
  {
    value: "email_daily_summary" as const,
    label: "Daily email summary",
    description: "One digest per day with all new applicants.",
  },
  {
    value: "dashboard_only" as const,
    label: "Dashboard only",
    description: "No applicant emails — check your dashboard when ready.",
  },
];

export type ApplicationNotificationPref =
  (typeof OPTIONS)[number]["value"];

interface EmployerApplicationNotificationCardProps {
  initialPref: ApplicationNotificationPref;
}

export function EmployerApplicationNotificationCard({
  initialPref,
}: EmployerApplicationNotificationCardProps) {
  const [pref, setPref] = useState<ApplicationNotificationPref>(initialPref);
  const [isPending, startTransition] = useTransition();

  const handleSelect = (value: ApplicationNotificationPref) => {
    if (value === pref || isPending) return;
    setPref(value);
    startTransition(async () => {
      const result = await updateEmployerNotificationPref(value);
      if (!result.success) {
        setPref(initialPref);
        toast.error(result.error);
        return;
      }
      toast.success("Notification preference saved");
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
          <Bell className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900">Applicant notifications</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Choose how you hear about new job applications. Email only.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Applicant notification preference">
        {OPTIONS.map((opt) => {
          const selected = pref === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={isPending}
              onClick={() => handleSelect(opt.value)}
              className={`btn-wrap w-full min-w-0 text-left rounded-xl border-2 px-4 py-3.5 transition-all min-h-11 [-webkit-tap-highlight-color:transparent] ${
                selected
                  ? "border-[#006e2f] bg-[#ebfdf2]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              } disabled:opacity-60`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 break-words">{opt.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 break-words">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
