"use client";

import {
  ADMIN_CAPABILITY_GROUPS,
  ADMIN_CAPABILITY_LABELS,
  GRANTABLE_MODERATOR_CAPABILITIES,
  type AdminCapability,
} from "@/lib/admin/capabilities";

interface AdminCapabilityChecklistProps {
  value: readonly AdminCapability[];
  onChange: (next: AdminCapability[]) => void;
  disabled?: boolean;
  /** When true, show locked full-access message instead of checkboxes. */
  fullAccess?: boolean;
}

export function AdminCapabilityChecklist({
  value,
  onChange,
  disabled = false,
  fullAccess = false,
}: AdminCapabilityChecklistProps) {
  const selected = new Set(value);

  if (fullAccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-900">
        Super admins have full portal access, including Admin Team and Email.
      </div>
    );
  }

  const toggle = (cap: AdminCapability) => {
    if (disabled) return;
    if (cap === "dashboard" || cap === "settings") return;
    const next = new Set(selected);
    if (next.has(cap)) next.delete(cap);
    else next.add(cap);
    next.add("dashboard");
    next.add("settings");
    onChange(
      GRANTABLE_MODERATOR_CAPABILITIES.filter((c) => next.has(c))
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Module access
      </p>
      {ADMIN_CAPABILITY_GROUPS.map((group) => {
        const caps = group.capabilities.filter((c) =>
          (GRANTABLE_MODERATOR_CAPABILITIES as readonly string[]).includes(c)
        );
        if (caps.length === 0) return null;
        return (
          <fieldset
            key={group.label}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
          >
            <legend className="px-1 text-xs font-bold text-slate-700">
              {group.label}
            </legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {caps.map((cap) => {
                const locked = cap === "dashboard" || cap === "settings";
                const checked = selected.has(cap) || locked;
                return (
                  <label
                    key={cap}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                      locked ? "text-slate-500" : "text-slate-800 cursor-pointer hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-[#006e2f] focus:ring-[#22c55e]/40"
                      checked={checked}
                      disabled={disabled || locked}
                      onChange={() => toggle(cap)}
                    />
                    <span className="font-medium">
                      {ADMIN_CAPABILITY_LABELS[cap]}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
