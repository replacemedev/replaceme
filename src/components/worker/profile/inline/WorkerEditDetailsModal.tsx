"use client";

import { useState, useTransition } from "react";
import { ProfileModal } from "./ProfileModal";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { patchWorkerProfileSchema } from "@/lib/validations/worker/profile-inline";

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
    civilStatus: string;
    preferredLanguage: string;
    phoneNumber: string;
    tinNumber: string;
    sssNumber: string;
    philhealthNumber: string;
    pagibigNumber: string;
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    idType: string;
    idNumber: string;
    idExpirationDate: string;
    idIssuingCountry: string;
  };
  onSaved: (data: any) => void;
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
  const [civilStatus, setCivilStatus] = useState(initial.civilStatus);
  const [preferredLanguage, setPreferredLanguage] = useState(initial.preferredLanguage);
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber);
  const [tinNumber, setTinNumber] = useState(initial.tinNumber);
  const [sssNumber, setSssNumber] = useState(initial.sssNumber);
  const [philhealthNumber, setPhilhealthNumber] = useState(initial.philhealthNumber);
  const [pagibigNumber, setPagibigNumber] = useState(initial.pagibigNumber);
  const [emergencyContactName, setEmergencyContactName] = useState(initial.emergencyContactName);
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(initial.emergencyContactRelationship);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initial.emergencyContactPhone);
  const [idType, setIdType] = useState(initial.idType);
  const [idNumber, setIdNumber] = useState(initial.idNumber);
  const [idExpirationDate, setIdExpirationDate] = useState(initial.idExpirationDate);
  const [idIssuingCountry, setIdIssuingCountry] = useState(initial.idIssuingCountry);

  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSave() {
    startTransition(async () => {
      setErrors({});

      const payload = {
        firstName,
        middleName: middleName || null,
        lastName,
        suffix: suffix || null,
        birthDate: birthDate || null,
        gender: gender || null,
        civilStatus: civilStatus || null,
        preferredLanguage: preferredLanguage || null,
        phoneNumber: phoneNumber || null,
        tinNumber: tinNumber || null,
        sssNumber: sssNumber || null,
        philhealthNumber: philhealthNumber || null,
        pagibigNumber: pagibigNumber || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactRelationship: emergencyContactRelationship || null,
        emergencyContactPhone: emergencyContactPhone || null,
        idType: idType || null,
        idNumber: idNumber || null,
        idExpirationDate: idExpirationDate || null,
        idIssuingCountry: idIssuingCountry || null,
      };

      const parsed = patchWorkerProfileSchema.safeParse(payload);
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
    "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 bg-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all";

  return (
    <ProfileModal
      open={open}
      title="Edit Personal, Statutory & Emergency details"
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
        {/* Name Fields */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Legal Name</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              First Name
              <input
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
              {errors.firstName && (
                <p className="text-[10px] font-semibold text-red-500">{errors.firstName}</p>
              )}
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Middle Name
              <input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
              {errors.middleName && (
                <p className="text-[10px] font-semibold text-red-500">{errors.middleName}</p>
              )}
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="block col-span-2 space-y-1 text-xs font-bold text-slate-500">
              Last Name
              <input
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
              {errors.lastName && (
                <p className="text-[10px] font-semibold text-red-500">{errors.lastName}</p>
              )}
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Suffix
              <input
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="Jr/III"
                className={inputClass}
              />
              {errors.suffix && (
                <p className="text-[10px] font-semibold text-red-500">{errors.suffix}</p>
              )}
            </label>
          </div>
        </div>

        {/* Demographics & Contact */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Demographics & Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Birthdate
              <input
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
              Phone Number
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+63 912 345 6789"
                className={inputClass}
              />
              {errors.phoneNumber && (
                <p className="text-[10px] font-semibold text-red-500">{errors.phoneNumber}</p>
              )}
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Gender
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Civil Status
              <select
                value={civilStatus}
                onChange={(e) => setCivilStatus(e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Language
              <input
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                placeholder="English / Tagalog"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Emergency Contacts</h3>
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Contact Name
            <input
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              placeholder="Full Name"
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Relationship
              <input
                value={emergencyContactRelationship}
                onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                placeholder="e.g. Spouse / Parent"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Phone Number
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="Emergency Contact Phone"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        {/* Statutory Numbers */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Statutory Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              TIN
              <input
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
                placeholder="000-000-000-000"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              SSS Number
              <input
                value={sssNumber}
                onChange={(e) => setSssNumber(e.target.value)}
                placeholder="00-0000000-0"
                className={inputClass}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              PhilHealth
              <input
                value={philhealthNumber}
                onChange={(e) => setPhilhealthNumber(e.target.value)}
                placeholder="00-000000000-0"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              Pag-IBIG
              <input
                value={pagibigNumber}
                onChange={(e) => setPagibigNumber(e.target.value)}
                placeholder="0000-0000-0000"
                className={inputClass}
              />
            </label>
          </div>
        </div>

        {/* ID Verification Details */}
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
                <option value="Driver's License">Driver's License</option>
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
