"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createWorkerJobAlert,
  deleteWorkerJobAlert,
  toggleWorkerJobAlert,
} from "@/actions/worker/phase2";
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
      if ("alert" in result && result.alert) {
        setAlerts((prev) => [result.alert, ...prev]);
      }
      toast.success("Job alert created");
      setLabel("");
      setSearchQuery("");
    });
  }

  function handleToggle(alert: WorkerJobAlertRow) {
    startTransition(async () => {
      const result = await toggleWorkerJobAlert(alert.id, !alert.isActive);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alert.id ? { ...a, isActive: !a.isActive } : a
        )
      );
    });
  }

  function handleDelete(alertId: string) {
    startTransition(async () => {
      const result = await deleteWorkerJobAlert(alertId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Alert deleted");
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
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{a.label}</p>
                  <p className="text-xs text-slate-500">
                    {a.searchQuery} · {a.frequency}
                    {!a.isActive ? " · paused" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleToggle(a)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:border-[#006e2f]/30"
                  >
                    {a.isActive ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
