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
  { href: "/admin/jobs", label: "Job Posts", icon: Briefcase },
  { href: "/admin/identity", label: "Identity", icon: Fingerprint },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/disputes", label: "Disputes", icon: Scale },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/settings/pages", label: "Public Pages", icon: FileText },
];
