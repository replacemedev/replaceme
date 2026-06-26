"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, UserX, UserCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { suspendUser, unsuspendUser } from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import type {
  AdminAdminRow,
  AdminEmployerRow,
  AdminUserTab,
  AdminWorkerRow,
} from "@/types/admin.types";

interface UsersClientProps {
  tab: AdminUserTab;
  workers: AdminWorkerRow[];
  employers: AdminEmployerRow[];
  admins: AdminAdminRow[];
}

function displayName(
  first: string | null,
  last: string | null,
  fallback: string
): string {
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || fallback;
}

const TAB_LABELS: Record<AdminUserTab, string> = {
  workers: "workers",
  employers: "employers",
  admins: "admins",
};

export function UsersClient({
  tab,
  workers,
  employers,
  admins,
}: UsersClientProps) {
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<{
    userId: string;
    action: "suspend" | "unsuspend";
    label: string;
  } | null>(null);
  const [reason, setReason] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (tab === "workers") {
      if (!q) return workers;
      return workers.filter((w) => {
        const name = displayName(w.first_name, w.last_name, "");
        return (
          name.toLowerCase().includes(q) ||
          (w.email?.toLowerCase().includes(q) ?? false) ||
          (w.professional_title?.toLowerCase().includes(q) ?? false)
        );
      });
    }
    if (tab === "employers") {
      if (!q) return employers;
      return employers.filter((e) => {
        return (
          e.company_name.toLowerCase().includes(q) ||
          (e.email?.toLowerCase().includes(q) ?? false) ||
          (e.industry?.toLowerCase().includes(q) ?? false)
        );
      });
    }
    if (!q) return admins;
    return admins.filter((a) => {
      const name = displayName(a.first_name, a.last_name, "");
      return (
        name.toLowerCase().includes(q) ||
        (a.email?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [tab, search, workers, employers, admins]);

  const handleConfirm = () => {
    if (!confirm) return;
    startTransition(async () => {
      const result =
        confirm.action === "suspend"
          ? await suspendUser(confirm.userId, reason || "Policy violation")
          : await unsuspendUser(confirm.userId);

      if (result.success) {
        toast.success(
          confirm.action === "suspend" ? "User suspended" : "User reactivated"
        );
        setConfirm(null);
        setReason("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (filtered.length === 0) {
    return (
      <div className="space-y-4">
        <SearchBar value={search} onChange={setSearch} tab={tab} />
        <EmptyState
          icon={
            tab === "admins" ? (
              <ShieldCheck className="h-5 w-5" aria-hidden />
            ) : (
              <Search className="h-5 w-5" aria-hidden />
            )
          }
          title={search ? "No matches" : `No ${TAB_LABELS[tab]} yet`}
          description={
            search
              ? "Try a different search term."
              : `Registered ${TAB_LABELS[tab]} will appear here.`
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={setSearch} tab={tab} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {tab === "workers" ? (
                <>
                  <th className="px-4 py-3">Worker</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Verification</th>
                </>
              ) : null}
              {tab === "employers" ? (
                <>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Subscription</th>
                </>
              ) : null}
              {tab === "admins" ? (
                <>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Role</th>
                </>
              ) : null}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {tab === "workers"
              ? (filtered as AdminWorkerRow[]).map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {displayName(
                          worker.first_name,
                          worker.last_name,
                          "Unnamed"
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{worker.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {worker.professional_title ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={worker.verification_status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={worker.account_status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(worker.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserActionButton
                        status={worker.account_status}
                        onSuspend={() =>
                          setConfirm({
                            userId: worker.id,
                            action: "suspend",
                            label: displayName(
                              worker.first_name,
                              worker.last_name,
                              worker.email ?? "user"
                            ),
                          })
                        }
                        onUnsuspend={() =>
                          setConfirm({
                            userId: worker.id,
                            action: "unsuspend",
                            label: displayName(
                              worker.first_name,
                              worker.last_name,
                              worker.email ?? "user"
                            ),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))
              : null}
            {tab === "employers"
              ? (filtered as AdminEmployerRow[]).map((employer) => (
                  <tr key={employer.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {employer.company_name}
                      </p>
                      <p className="text-xs text-slate-400">{employer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {employer.industry ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={employer.subscription_status ?? "inactive"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={employer.account_status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(employer.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserActionButton
                        status={employer.account_status}
                        onSuspend={() =>
                          setConfirm({
                            userId: employer.employer_id,
                            action: "suspend",
                            label: employer.company_name,
                          })
                        }
                        onUnsuspend={() =>
                          setConfirm({
                            userId: employer.employer_id,
                            action: "unsuspend",
                            label: employer.company_name,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))
              : null}
            {tab === "admins"
              ? (filtered as AdminAdminRow[]).map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">
                        {displayName(
                          admin.first_name,
                          admin.last_name,
                          "Unnamed"
                        )}
                      </p>
                      <p className="text-xs text-slate-400">{admin.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#ebfdf2] px-2.5 py-1 text-[11px] font-semibold text-[#006e2f]">
                        <ShieldCheck className="h-3 w-3" aria-hidden />
                        Platform Admin
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={admin.account_status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {formatDate(admin.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <UserActionButton
                        status={admin.account_status}
                        onSuspend={() =>
                          setConfirm({
                            userId: admin.id,
                            action: "suspend",
                            label: displayName(
                              admin.first_name,
                              admin.last_name,
                              admin.email ?? "admin"
                            ),
                          })
                        }
                        onUnsuspend={() =>
                          setConfirm({
                            userId: admin.id,
                            action: "unsuspend",
                            label: displayName(
                              admin.first_name,
                              admin.last_name,
                              admin.email ?? "admin"
                            ),
                          })
                        }
                      />
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.action === "suspend" ? "Suspend user?" : "Reactivate user?"
        }
        description={
          confirm?.action === "suspend"
            ? `This will ban ${confirm?.label ?? "this user"} from signing in.`
            : `Restore access for ${confirm?.label ?? "this user"}.`
        }
        confirmLabel={confirm?.action === "suspend" ? "Suspend" : "Reactivate"}
        variant={confirm?.action === "suspend" ? "danger" : "default"}
        loading={pending}
        onCancel={() => {
          setConfirm(null);
          setReason("");
        }}
        onConfirm={handleConfirm}
      />

      {confirm?.action === "suspend" ? (
        <label className="block max-w-md">
          <span className="text-xs font-medium text-slate-600">
            Reason (logged to audit trail)
          </span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Policy violation, fraud report, etc."
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
      ) : null}
    </div>
  );
}

function SearchBar({
  value,
  onChange,
  tab,
}: {
  value: string;
  onChange: (v: string) => void;
  tab: AdminUserTab;
}) {
  const placeholder =
    tab === "employers"
      ? "Search by company, email, or industry…"
      : tab === "admins"
        ? "Search by admin name or email…"
        : "Search by name, email, or title…";

  return (
    <div className="relative max-w-md">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
      />
    </div>
  );
}

function UserActionButton({
  status,
  onSuspend,
  onUnsuspend,
}: {
  status: string;
  onSuspend: () => void;
  onUnsuspend: () => void;
}) {
  if (status === "suspended") {
    return (
      <button
        type="button"
        onClick={onUnsuspend}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#006e2f] hover:bg-[#ebfdf2]"
      >
        <UserCheck className="h-3.5 w-3.5" aria-hidden />
        Reactivate
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSuspend}
      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      <UserX className="h-3.5 w-3.5" aria-hidden />
      Suspend
    </button>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
