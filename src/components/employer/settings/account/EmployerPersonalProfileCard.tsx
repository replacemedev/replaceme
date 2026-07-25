"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit } from "lucide-react";
import type { EmployerAccountDetails } from "@/actions/employer/account";
import { AccountLoginIdentity } from "@/components/shared/settings/AccountLoginIdentity";
import { EmployerEditDetailsModal } from "./EmployerEditDetailsModal";

interface EmployerPersonalProfileCardProps {
  account: EmployerAccountDetails;
}

function displayName(account: EmployerAccountDetails): string {
  const full = [account.firstName, account.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
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
      <div className="flex flex-col gap-4 border-b border-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-800">
            Profile Information
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
            Your personal login identity separate from your company brand.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditModalOpen(true)}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-[#006e2f] transition-colors hover:border-[#006e2f]/30 hover:bg-[#ebfdf2]/50 hover:text-[#005321] sm:w-auto sm:min-h-0 sm:py-2.5"
        >
          <Edit size={14} aria-hidden />
          Edit
        </button>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <AccountLoginIdentity
          email={account.email}
          username={account.username}
        />

        <div className="border-t border-slate-50 pt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Personal details
          </h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Name
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {name}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Phone Number
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {account.phoneNumber ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-50 pt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Demographics
          </h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Birthdate
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {account.birthDate ?? "—"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Gender
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {account.gender ?? "—"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Civil Status
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {account.civilStatus ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-slate-50 pt-6">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
            Personal Address
          </h3>
          <dl className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0 sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Address Line
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {account.personalAddress ?? "—"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                City & Province/State
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {[account.personalCity, account.personalStateProvince]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Country
              </dt>
              <dd className="mt-1 text-sm font-semibold text-slate-800">
                {account.country ?? "—"}
              </dd>
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
