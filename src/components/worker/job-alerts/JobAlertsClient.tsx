"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createWorkerJobAlert } from "@/actions/worker/phase2";
import type { WorkerJobAlertRow } from "@/lib/validations/worker/phase2";

interface JobAlertsClientProps {
  alerts: WorkerJobAlertRow[];
}

export function JobAlertsClient({ alerts: initialAlerts }: JobAlertsClientProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">(
    "daily"
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await createWorkerJobAlert({ label, searchQuery, frequency });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Job alert created");
      setLabel("");
      setSearchQuery("");
    });
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Create alert
        </h2>
        <label className="block text-sm font-medium text-slate-700">
          Label
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Search keywords
          <input
            required
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Frequency
          <select
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as "instant" | "daily" | "weekly")
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="instant">Instant</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2.5 text-sm font-bold text-white bg-[#006e2f] rounded-xl disabled:opacity-60"
        >
          Save alert
        </button>
      </form>

      <section>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
          Your alerts ({alerts.length})
        </h2>
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No saved search alerts yet.</p>
        ) : (
          <ul className="space-y-3">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3"
              >
                <p className="text-sm font-bold text-slate-900">{a.label}</p>
                <p className="text-xs text-slate-500">
                  {a.searchQuery} · {a.frequency}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
