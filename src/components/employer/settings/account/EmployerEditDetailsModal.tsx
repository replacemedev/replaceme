"use client";

import { useState, useTransition } from "react";
import { ProfileModal } from "@/components/worker/profile/inline/ProfileModal";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { updateEmployerAccountDetails } from "@/actions/employer/account";

interface EmployerEditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  initial: {
    firstName: string;
    middleName: string;
    lastName: string;
    phoneNumber: string;
    country: string;
  };
  onSaved: () => void;
}

export function EmployerEditDetailsModal({
  open,
  onClose,
  initial,
  onSaved,
}: EmployerEditDetailsModalProps) {
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(initial.firstName);
  const [middleName, setMiddleName] = useState(initial.middleName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber);
  const [country, setCountry] = useState(initial.country);

  function handleSave() {
    startTransition(async () => {
      const result = await updateEmployerAccountDetails({
        firstName,
        middleName: middleName || null,
        lastName,
        phoneNumber: phoneNumber || null,
        country: country || null,
      });

      if (!result.success) {
        toast.error(result.error || "Failed to update profile details.");
        return;
      }

      toast.success("Profile details updated.");
      onSaved();
      onClose();
    });
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all";

  return (
    <ProfileModal
      open={open}
      title="Edit Personal & Account details"
      onClose={onClose}
      maxWidth="max-w-xl"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#006e2f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#005c26] transition-colors"
          >
            <Check className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Details"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Legal Name</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              First Name
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Middle Name
              <input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Last Name
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Contact</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Phone Number
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Country
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </div>
    </ProfileModal>
  );
}
