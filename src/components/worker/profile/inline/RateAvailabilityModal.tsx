"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateWorkerSettings } from "@/actions/worker/profile";
import { COMPENSATION_CURRENCIES, type CompensationCurrency } from "@/lib/format/currency";
import { ProfileModal } from "./ProfileModal";

const AVAILABILITY = [
  "Full-time",
  "Part-time",
  "Contract",
  "Not available",
] as const;

interface RateAvailabilityModalProps {
  open: boolean;
  onClose: () => void;
  initial: {
    availability: string;
    hourlyRate: number;
    isRemote: boolean;
    salaryCurrency: string;
  };
  onSaved: (data: {
    availability: string;
    hourlyRate: number;
    isRemote: boolean;
    salaryCurrency: string;
  }) => void;
}

export function RateAvailabilityModal({
  open,
  onClose,
  initial,
  onSaved,
}: RateAvailabilityModalProps) {
  const [availability, setAvailability] = useState(initial.availability);
  const [hourlyRate, setHourlyRate] = useState(String(initial.hourlyRate));
  const [salaryCurrency, setSalaryCurrency] = useState(
    initial.salaryCurrency as CompensationCurrency
  );
  const [isRemote, setIsRemote] = useState(initial.isRemote);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        availability: availability as (typeof AVAILABILITY)[number],
        hourlyRate: Number(hourlyRate),
        isRemote,
        salaryCurrency,
      };
      const result = await updateWorkerSettings(payload);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      onSaved(payload);
      toast.success("Rate and availability updated");
      onClose();
    });
  }

  return (
    <ProfileModal
      open={open}
      title="Rate & availability"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="rate-availability-form"
            disabled={isPending}
            className="rounded-xl bg-[#006e2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#005c26] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      }
    >
      <form id="rate-availability-form" onSubmit={handleSave} className="space-y-4">
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
            max={500}
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
            className="rounded border-slate-300 text-[#006e2f]"
          />
          Open to remote work
        </label>
      </form>
    </ProfileModal>
  );
}
