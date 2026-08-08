"use client";

import { useState, useTransition } from "react";
import { ProfileModal } from "./ProfileModal";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { workerEditDetailsSchema } from "@/lib/validations/worker/profile-inline";

interface WorkerEditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  initial: {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    birthDate: string;
    gender: string;
    spokenLanguages: string[];
    tinNumber: string;
    idType: string;
    idNumber: string;
    idExpirationDate: string;
    idIssuingCountry: string;
  };
  onSaved: (data: Record<string, unknown>) => void;
}

function parseLanguages(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function WorkerEditDetailsModal({
  open,
  onClose,
  initial,
  onSaved,
}: WorkerEditDetailsModalProps) {
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState(initial.firstName);
  const [middleName, setMiddleName] = useState(initial.middleName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [suffix, setSuffix] = useState(initial.suffix);
  const [birthDate, setBirthDate] = useState(initial.birthDate);
  const [gender, setGender] = useState(initial.gender);
  const [spokenLanguagesInput, setSpokenLanguagesInput] = useState(
    (initial.spokenLanguages ?? []).join(", ")
  );
  const [tinNumber, setTinNumber] = useState(initial.tinNumber);
  const [idType, setIdType] = useState(initial.idType);
  const [idNumber, setIdNumber] = useState(initial.idNumber);
  const [idExpirationDate, setIdExpirationDate] = useState(initial.idExpirationDate);
  const [idIssuingCountry, setIdIssuingCountry] = useState(initial.idIssuingCountry);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSave() {
    startTransition(async () => {
      setErrors({});

      const spokenLanguages = parseLanguages(spokenLanguagesInput);

      const payload = {
        firstName,
        middleName: middleName || null,
        lastName,
        suffix: suffix || null,
        birthDate,
        gender,
        spokenLanguages,
        tinNumber: tinNumber || null,
        idType: idType || null,
        idNumber: idNumber || null,
        idExpirationDate: idExpirationDate || null,
        idIssuingCountry: idIssuingCountry || null,
      };

      const parsed = workerEditDetailsSchema.safeParse(payload);
      if (!parsed.success) {
        const formattedErrors: Record<string, string> = {};
        parsed.error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(formattedErrors);
        toast.error("Please correct the form errors.");
        return;
      }

      onSaved(payload);
    });
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 bg-white placeholder-slate-400 break-words focus:outline-hidden focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all";

  return (
    <ProfileModal
      open={open}
      title="Edit Personal & Statutory details"
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
        <div className="space-y-3 min-w-0">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Legal Name</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block min-w-0 space-y-1 text-xs font-bold text-slate-500">
              First Name
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                className={inputClass}
              />
              {errors.firstName && (
                <p className="text-[10px] font-semibold text-red-500">{errors.firstName}</p>
              )}
            </label>
            <label className="block min-w-0 space-y-1 text-xs font-bold text-slate-500">
              Middle Name
              <span className="ml-1 font-normal text-slate-400">(optional)</span>
              <input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Legal middle name"
                autoComplete="additional-name"
                className={inputClass}
              />
              {errors.middleName && (
                <p className="text-[10px] font-semibold text-red-500">{errors.middleName}</p>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block min-w-0 space-y-1 text-xs font-bold text-slate-500">
              Last Name
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                className={inputClass}
              />
              {errors.lastName && (
                <p className="text-[10px] font-semibold text-red-500">{errors.lastName}</p>
              )}
            </label>
            <label className="block min-w-0 space-y-1 text-xs font-bold text-slate-500">
              Suffix
              <span className="ml-1 font-normal text-slate-400">(optional)</span>
              <input
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="Jr., III, PhD"
                autoComplete="honorific-suffix"
                className={inputClass}
              />
              {errors.suffix && (
                <p className="text-[10px] font-semibold text-red-500">{errors.suffix}</p>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Date of Birth
              <input
                required
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={inputClass}
              />
              {errors.birthDate && (
                <p className="text-[10px] font-semibold text-red-500">{errors.birthDate}</p>
              )}
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Gender
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  Select...
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-[10px] font-semibold text-red-500">{errors.gender}</p>
              )}
            </label>
          </div>
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Spoken Languages
            <input
              required
              value={spokenLanguagesInput}
              onChange={(e) => setSpokenLanguagesInput(e.target.value)}
              placeholder="English, Tagalog"
              className={inputClass}
            />
            <span className="mt-1 block text-[10px] font-medium text-slate-400">
              Comma-separated list (up to 8)
            </span>
            {errors.spokenLanguages && (
              <p className="text-[10px] font-semibold text-red-500">{errors.spokenLanguages}</p>
            )}
          </label>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Statutory Details</h3>
          <label className="block space-y-1 text-xs font-bold text-slate-500 w-full">
            TIN
            <input
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              placeholder="000-000-000-000"
              className={inputClass}
            />
          </label>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Identity Document Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              ID Type
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                <option value="Passport">Passport</option>
                <option value="Driver's License">Driver&apos;s License</option>
                <option value="National ID">National ID</option>
                <option value="UMID">UMID</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              ID Number
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              ID Expiration Date
              <input
                type="date"
                value={idExpirationDate}
                onChange={(e) => setIdExpirationDate(e.target.value)}
                className={inputClass}
              />
              {errors.idExpirationDate && (
                <p className="text-[10px] font-semibold text-red-500">{errors.idExpirationDate}</p>
              )}
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              ID Issuing Country
              <input
                value={idIssuingCountry}
                onChange={(e) => setIdIssuingCountry(e.target.value)}
                placeholder="e.g. Philippines"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </div>
    </ProfileModal>
  );
}
