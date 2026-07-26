import Link from "next/link";
import { ShieldAlert, ShieldCheck, Users } from "lucide-react";
import type { AdminMfaPostureRow } from "@/actions/admin/security";

export function AdminTeamMfaPostureCard({ rows }: { rows: AdminMfaPostureRow[] }) {
  const missing = rows.filter((r) => !r.mfaEnrolled && r.status === "active");

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-3 border-b border-slate-50 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-800">Team MFA posture</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              Super admin view of which staff have a verified TOTP factor.
              {missing.length > 0
                ? ` ${missing.length} active account(s) still need enrollment.`
                : " All active staff are enrolled."}
            </p>
          </div>
        </div>
        <Link
          href="/admin/settings/team"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-800 transition-colors hover:border-[#006e2f]/40 hover:bg-[#ebfdf2]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006e2f]/30"
        >
          Manage team
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-5 py-3 font-semibold sm:px-6">Staff</th>
              <th className="px-3 py-3 font-semibold">Role</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold sm:px-6">MFA</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-slate-400 sm:px-6"
                >
                  No admin accounts found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.userId}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="max-w-[14rem] px-5 py-3 sm:px-6">
                    <p className="truncate font-semibold text-slate-800">
                      {row.displayName}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {row.email ?? "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3 capitalize text-slate-600">
                    {row.adminRole === "superadmin" ? "Super admin" : "Moderator"}
                  </td>
                  <td className="px-3 py-3 capitalize text-slate-600">
                    {row.status}
                  </td>
                  <td className="px-5 py-3 sm:px-6">
                    {row.mfaEnrolled ? (
                      <span className="inline-flex items-center gap-1.5 text-[#006e2f]">
                        <ShieldCheck className="h-4 w-4" aria-hidden />
                        <span className="font-semibold">
                          Enrolled
                          {row.factorCount > 1 ? ` (${row.factorCount})` : ""}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <ShieldAlert className="h-4 w-4" aria-hidden />
                        <span className="font-semibold">Missing</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
