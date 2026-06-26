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
