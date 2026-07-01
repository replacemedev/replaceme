"use client";

import { AppSidebar } from "@/components/shared/layout/AppSidebar";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import type { AppSidebarProfile } from "@/components/shared/layout/AppSidebar";

interface AdminSidebarProps {
  profile: AppSidebarProfile;
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  return (
    <AppSidebar
      items={ADMIN_NAV_ITEMS}
      profile={profile}
      showBrand={false}
      footer={
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Environment
          </p>
          <p className="text-xs font-bold text-[#006e2f] mt-0.5">
            {process.env.NODE_ENV === "production" ? "Production" : "Development"}
          </p>
        </div>
      }
    />
  );
}
