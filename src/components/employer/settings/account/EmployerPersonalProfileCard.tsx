"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import type { EmployerAccountDetails } from "@/actions/employer/account";
import { EmployerEditDetailsModal } from "./EmployerEditDetailsModal";

interface EmployerPersonalProfileCardProps {
  account: EmployerAccountDetails;
}

function displayName(account: EmployerAccountDetails): string {
  const full = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
  return full || account.username || "Employer";
}

export function EmployerPersonalProfileCard({
  account,
}: EmployerPersonalProfileCardProps) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const name = displayName(account);

  return (
    <section
      id="employer-profile"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
    >
      <div className="border-b border-slate-50 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
          <p className="mt-1 text-xs text-slate-400">
            Your personal login identity separate from your company brand.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditModalOpen(true)}
          className="text-xs font-bold text-[#006e2f] hover:text-[#005321] flex items-center gap-1 transition-colors"
        >
          <Edit size={14} />
          Edit
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account Details</h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Name</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{name}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Email</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800 break-all">{account.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Username</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.username ? `@${account.username}` : "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Phone Number</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.phoneNumber ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-50 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Demographics</h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Birthdate</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.birthDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Gender</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.gender ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Civil Status</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.civilStatus ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-50 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Personal Address</h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Address Line</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.personalAddress ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">City & Province/State</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {[account.personalCity, account.personalStateProvince].filter(Boolean).join(", ") || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Country</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.country ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-50 pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Statutory Details</h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">TIN / EIN Number</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">{account.tinNumber ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <EmployerEditDetailsModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initial={{
          firstName: account.firstName || "",
          middleName: account.middleName || "",
          lastName: account.lastName || "",
          birthDate: account.birthDate || "",
          gender: account.gender || "",
          civilStatus: account.civilStatus || "",
          phoneNumber: account.phoneNumber || "",
          tinNumber: account.tinNumber || "",
          personalAddress: account.personalAddress || "",
          personalCity: account.personalCity || "",
          personalStateProvince: account.personalStateProvince || "",
          country: account.country || "",
        }}
        onSaved={() => {
          router.refresh();
        }}
      />
    </section>
  );
}
