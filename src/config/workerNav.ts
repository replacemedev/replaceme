import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  FileText,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

export interface WorkerNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const WORKER_NAV_ITEMS: WorkerNavItem[] = [
  { href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/worker/jobs", label: "Jobs", icon: Briefcase },
  {
    href: "/worker/saved-jobs",
    label: "Saved Jobs",
    icon: Bookmark,
  },
  {
    href: "/worker/applications",
    label: "Applications",
    icon: FileText,
  },
  { href: "/worker/messages", label: "Messages", icon: MessageSquare },
];
