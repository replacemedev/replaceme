"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  ScrollText,
  Settings,
  DollarSign,
  Fingerprint,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/jobs", label: "Job Posts", icon: Briefcase },
  { href: "/admin/identity", label: "Identity", icon: Fingerprint },
  { href: "/admin/revenue", label: "Revenue", icon: DollarSign },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/security", label: "Security", icon: ShieldCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 px-4 py-6">
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-white tracking-tight">
          Admin Panel
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <p className="text-xs font-medium text-slate-400">Environment</p>
        <p className="text-xs text-emerald-400 font-mono mt-0.5">
          {process.env.NODE_ENV === "production" ? "Production" : "Development"}
        </p>
      </div>
    </aside>
  );
}
