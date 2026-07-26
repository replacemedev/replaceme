"use client";

import { useMemo } from "react";
import { AppSidebar } from "@/components/shared/layout/AppSidebar";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import type { AdminCapability } from "@/lib/admin/capabilities";
import { filterAdminNavItems } from "@/lib/admin/filter-nav";
import type { AppSidebarProfile } from "@/components/shared/layout/AppSidebar";

interface AdminSidebarProps {
  profile: AppSidebarProfile;
  isSuperAdmin?: boolean;
  capabilities?: readonly AdminCapability[];
}

export function AdminSidebar({
  profile,
  isSuperAdmin = false,
  capabilities = [],
}: AdminSidebarProps) {
  const items = useMemo(
    () =>
      filterAdminNavItems(ADMIN_NAV_ITEMS, {
        isSuperAdmin,
        capabilities,
      }),
    [isSuperAdmin, capabilities]
  );

  return (
    <AppSidebar
      items={items}
      profile={profile}
      showBrand={false}
    />
  );
}
