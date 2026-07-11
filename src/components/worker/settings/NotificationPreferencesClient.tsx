"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  saveNotificationPreferences,
  type NotificationPreferences,
} from "@/actions/worker/notification-preferences";

export function NotificationPreferencesClient({
  initial,
}: {
  initial: NotificationPreferences;
}) {
  const [prefs, setPrefs] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const save = () => {
    startTransition(async () => {
      const toastId = toast.loading("Saving preferences...");
      const result = await saveNotificationPreferences(prefs);
      if (result.success) {
        toast.success("Preferences saved", { id: toastId });
      } else {
        toast.error(result.error ?? "Save failed", { id: toastId });
      }
    });
  };

  const rows: { key: keyof NotificationPreferences; label: string }[] = [
    { key: "emailApplications", label: "Email: application updates" },
    { key: "emailMessages", label: "Email: new messages" },
    { key: "inAppEnabled", label: "In-app notifications" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/worker/notifications"
        className="text-sm font-bold text-[#006e2f] hover:underline"
      >
        View notification history →
      </Link>

      <ul className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-700">{row.label}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[row.key]}
              aria-label={row.label}
              onClick={() => toggle(row.key)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                prefs[row.key] ? "bg-[#006e2f]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  prefs[row.key] ? "translate-x-5" : ""
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={isPending}
        onClick={save}
        className="rounded-xl bg-[#006e2f] px-4 py-2 text-sm font-bold text-white hover:bg-[#005c26] disabled:opacity-50"
      >
        Save preferences
      </button>
    </div>
  );
}
