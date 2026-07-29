import type { ReactNode } from "react";
import { Lock, Mail } from "lucide-react";

export type AccountLoginIdentityProps = {
  email: string | null;
  /** Optional class on the outer wrapper */
  className?: string;
};

function LockedField({
  label,
  icon,
  value,
  breakAll,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 w-full flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-slate-100">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {label}
            </dt>
            <dd
              className={`mt-1 text-sm font-semibold text-slate-800 ${
                breakAll
                  ? "break-all [overflow-wrap:anywhere]"
                  : "truncate"
              }`}
            >
              {value}
            </dd>
          </div>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400"
          title="Cannot be changed"
        >
          <Lock className="h-3 w-3" aria-hidden />
          Locked
        </span>
      </div>
    </div>
  );
}

/** Read-only login identity (email). Intentionally non-editable. */
export function AccountLoginIdentity({
  email,
  className,
}: AccountLoginIdentityProps) {
  const emailDisplay = email?.trim() || "—";

  return (
    <div className={className}>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Login identity
        </h3>
      </div>
      <dl className="grid min-w-0 grid-cols-1 gap-3">
        <LockedField
          label="Email"
          icon={<Mail className="h-4 w-4" aria-hidden />}
          value={emailDisplay}
          breakAll
        />
      </dl>
    </div>
  );
}
