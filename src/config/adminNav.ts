import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  ScrollText,
  Settings,
  DollarSign,
  Fingerprint,
  Scale,
  FileText,
  Bell,
  ClipboardList,
  MessageSquare,
  CreditCard,
  Flag,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/jobs", label: "Job Posts", icon: Briefcase },
  { href: "/admin/identity", label: "Identity", icon: Fingerprint },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/moderation", label: "Moderation", icon: MessageSquare },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/billing-ops", label: "Billing Ops", icon: CreditCard },
  { href: "/admin/disputes", label: "Disputes", icon: Scale },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/settings/pages", label: "Public Pages", icon: FileText },
];

export const ADMIN_NOTIFICATIONS_HREF = "/admin/notifications";

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Operations",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/dashboard",
        "/admin/users",
        "/admin/applications",
        "/admin/jobs",
        "/admin/reports",
      ].includes(item.href)
    ),
  },
  {
    label: "Trust & Safety",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/identity",
        "/admin/moderation",
        "/admin/disputes",
        "/admin/notifications",
      ].includes(item.href)
    ),
  },
  {
    label: "Revenue",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      ["/admin/revenue", "/admin/billing-ops"].includes(item.href)
    ),
  },
  {
    label: "Platform",
    items: ADMIN_NAV_ITEMS.filter((item) =>
      [
        "/admin/audit-log",
        "/admin/security",
        "/admin/settings",
        "/admin/settings/pages",
      ].includes(item.href)
    ),
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
