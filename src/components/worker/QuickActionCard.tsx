import React from "react";
import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  iconBgClass: string;
  iconColorClass: string;
}

export function QuickActionCard({
  title,
  icon,
  href,
  iconBgClass,
  iconColorClass,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-slate-300 transition-all duration-200 gap-3 text-center cursor-pointer select-none group"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass} ${iconColorClass} group-hover:scale-105 transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
        {title}
      </span>
    </Link>
  );
}
