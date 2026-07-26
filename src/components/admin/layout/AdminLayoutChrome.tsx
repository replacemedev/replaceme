"use client";

import { createContext, use, useState } from "react";
import type { AdminCapability } from "@/lib/admin/capabilities";
import { AdminMobileDrawer } from "./AdminMobileDrawer";

interface AdminNavProfile {
  displayName: string;
  roleLabel: string;
  initials: string;
  avatarUrl?: string | null;
}

interface AdminNavContextValue {
  openMobileNav: () => void;
}

const AdminNavContext = createContext<AdminNavContextValue | null>(null);

export function useAdminNav() {
  const ctx = use(AdminNavContext);
  if (!ctx) {
    throw new Error("useAdminNav must be used within AdminLayoutChrome");
  }
  return ctx;
}

interface AdminLayoutChromeProps {
  profile?: AdminNavProfile;
  isSuperAdmin?: boolean;
  capabilities?: readonly AdminCapability[];
  adminRole?: "moderator" | "superadmin";
}

const defaultProfile: AdminNavProfile = {
  displayName: "Admin",
  roleLabel: "Moderator",
  initials: "A",
};

export function AdminLayoutChrome({
  profile = defaultProfile,
  isSuperAdmin = false,
  capabilities = [],
  children,
}: AdminLayoutChromeProps & { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AdminNavContext
      value={{
        openMobileNav: () => setDrawerOpen(true),
      }}
    >
      {children}
      <AdminMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={profile}
        isSuperAdmin={isSuperAdmin}
        capabilities={capabilities}
      />
    </AdminNavContext>
  );
}
