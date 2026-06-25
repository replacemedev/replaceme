import React from "react";
import Link from "next/link";
import { Video, Palette, Users, Share2, Award } from "lucide-react";

export function QuickAccess() {
  const actions = [
    { label: "Find Video Editors", icon: <Video size={18} />, href: "/employer/jobs" },
    { label: "Browse Designers", icon: <Palette size={18} />, href: "/talents?category=design" },
    { label: "Hire VAs", icon: <Users size={18} />, href: "/talents?category=va" },
    { label: "Social Specialists", icon: <Share2 size={18} />, href: "/talents?category=social-media" },
    { label: "Admin Experts", icon: <Award size={18} />, href: "/talents?category=admin" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {actions.map((act) => (
        <Link
          key={act.label}
          href={act.href}
          className="bg-white border border-slate-100 shadow-sm hover:border-[#22c55e] hover:shadow-md px-3 py-5 rounded-2xl transition-all duration-200 flex flex-col items-center justify-center text-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#22c55e]"
        >
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#22c55e] group-hover:bg-green-50 transition-colors">
            {act.icon}
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-slate-950 leading-tight">
            {act.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
