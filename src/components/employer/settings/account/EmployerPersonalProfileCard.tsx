import Image from "next/image";
import type { EmployerAccountDetails } from "@/actions/employer/account";

interface EmployerPersonalProfileCardProps {
  account: EmployerAccountDetails;
}

function displayName(account: EmployerAccountDetails): string {
  const full = [account.firstName, account.lastName].filter(Boolean).join(" ").trim();
  return full || account.username || "Employer";
}

function initials(account: EmployerAccountDetails): string {
  if (account.firstName) return account.firstName[0].toUpperCase();
  if (account.username) return account.username[0].toUpperCase();
  return "E";
}

export function EmployerPersonalProfileCard({
  account,
}: EmployerPersonalProfileCardProps) {
  const name = displayName(account);

  return (
    <section
      id="employer-profile"
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"
    >
      <div className="border-b border-slate-50 p-6">
        <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
        <p className="mt-1 text-xs text-slate-400">
          Your personal login identity — separate from your company brand.
        </p>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          {account.avatarUrl ? (
            <Image
              src={account.avatarUrl}
              alt={`${name} avatar`}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#ebfdf2] text-lg font-bold text-[#006e2f]">
              {initials(account)}
            </div>
          )}
        </div>

        <dl className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Name
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">{name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Email
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800 break-all">
              {account.email ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Username
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">
              {account.username ? `@${account.username}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Role
            </dt>
            <dd className="mt-1 text-sm font-semibold capitalize text-slate-800">
              {account.role}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
