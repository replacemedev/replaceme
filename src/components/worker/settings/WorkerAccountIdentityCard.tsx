import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { AccountLoginIdentity } from "@/components/shared/settings/AccountLoginIdentity";

export type WorkerAccountIdentityCardProps = {
  email: string | null;
};

export function WorkerAccountIdentityCard({
  email,
}: WorkerAccountIdentityCardProps) {
  return (
    <section
      id="account-identity"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
      aria-labelledby="account-identity-heading"
    >
      <div className="flex flex-col gap-4 border-b border-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ebfdf2] text-[#006e2f]">
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2
              id="account-identity-heading"
              className="text-base font-bold text-slate-900 sm:text-lg"
            >
              Account identity
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Your login credentials for signing in. Personal and career details
              stay on your profile.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <AccountLoginIdentity email={email} />
      </div>

      <div className="border-t border-slate-50 bg-slate-50/40 px-5 py-4 sm:px-6">
        <Link
          href="/worker/profile"
          className="group inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-1 text-sm font-bold text-[#006e2f] transition-colors hover:text-[#005c26] sm:w-auto sm:justify-start"
        >
          <span>Manage personal & career details on your profile</span>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#006e2f]/60 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
