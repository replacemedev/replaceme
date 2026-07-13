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
    birthDate: string;
    gender: string;
    civilStatus: string;
    phoneNumber: string;
    tinNumber: string;
    idType: string;
    idNumber: string;
    idExpirationDate: string;
    idIssuingCountry: string;
    personalAddress: string;
    personalCity: string;
    personalStateProvince: string;
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
  const [birthDate, setBirthDate] = useState(initial.birthDate);
  const [gender, setGender] = useState(initial.gender);
  const [civilStatus, setCivilStatus] = useState(initial.civilStatus);
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber);
  const [tinNumber, setTinNumber] = useState(initial.tinNumber);
  const [idType, setIdType] = useState(initial.idType);
  const [idNumber, setIdNumber] = useState(initial.idNumber);
  const [idExpirationDate, setIdExpirationDate] = useState(initial.idExpirationDate);
  const [idIssuingCountry, setIdIssuingCountry] = useState(initial.idIssuingCountry);
  const [personalAddress, setPersonalAddress] = useState(initial.personalAddress);
  const [personalCity, setPersonalCity] = useState(initial.personalCity);
  const [personalStateProvince, setPersonalStateProvince] = useState(initial.personalStateProvince);
  const [country, setCountry] = useState(initial.country);

  function handleSave() {
    startTransition(async () => {
      const result = await updateEmployerAccountDetails({
        firstName,
        middleName: middleName || null,
        lastName,
        birthDate: birthDate || null,
        gender: gender || null,
        civilStatus: civilStatus || null,
        phoneNumber: phoneNumber || null,
        tinNumber: tinNumber || null,
        idType: idType || null,
        idNumber: idNumber || null,
        idExpirationDate: idExpirationDate || null,
        idIssuingCountry: idIssuingCountry || null,
        personalAddress: personalAddress || null,
        personalCity: personalCity || null,
        personalStateProvince: personalStateProvince || null,
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
      title="Edit Profile & KYC Verification"
      onClose={onClose}
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
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
        {/* Name Fields */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Legal Name</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            </label>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </div>
        </div>

        {/* Address */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Personal Address</h3>
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            Address Line
            <input
              value={personalAddress}
              onChange={(e) => setPersonalAddress(e.target.value)}
              placeholder="e.g. 123 Main St, Apt 4B"
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              City
              <input
                value={personalCity}
                onChange={(e) => setPersonalCity(e.target.value)}
                placeholder="City"
                className={inputClass}
              />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              State/Province
              <input
                value={personalStateProvince}
                onChange={(e) => setPersonalStateProvince(e.target.value)}
                placeholder="State/Province"
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

        {/* Statutory Numbers */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Statutory Details</h3>
          <label className="block space-y-1 text-xs font-bold text-slate-500">
            TIN / EIN Number
            <input
              value={tinNumber}
              onChange={(e) => setTinNumber(e.target.value)}
              placeholder="Tax ID Number"
              className={inputClass}
            />
          </label>
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
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-500">
              ID Issuing Country
              <input
                value={idIssuingCountry}
                onChange={(e) => setIdIssuingCountry(e.target.value)}
                placeholder="e.g. United States"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      </div>
    </ProfileModal>
  );
}
