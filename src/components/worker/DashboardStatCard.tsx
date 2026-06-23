import React from "react";

interface DashboardStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

export function DashboardStatCard({
  title,
  value,
  icon,
  iconBgClass,
  iconColorClass,
}: DashboardStatCardProps) {
  return (
    <div className="flex flex-col justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-xs gap-4 relative overflow-hidden select-none">
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold text-slate-500 tracking-tight">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgClass} ${iconColorClass}`}>
          {icon}
        </div>
      </div>
      <span className="text-4xl font-extrabold text-slate-900 leading-none">
        {value}
      </span>
    </div>
  );
}
