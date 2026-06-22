import React from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  highlight?: boolean;
}

export function StatCard({ title, value, icon, highlight = false }: StatCardProps) {
  return (
    <div className={`bg-white p-5 rounded-2xl border transition-all duration-200 ${
      highlight 
        ? "border-green-200 shadow-md ring-1 ring-green-500/10" 
        : "border-slate-100 shadow-sm hover:shadow-md"
    }`}>
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl flex items-center justify-center ${highlight ? "bg-green-50" : "bg-slate-50"}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mt-3">{value}</p>
      <h3 className="text-sm font-semibold text-slate-500 mt-1">{title}</h3>
    </div>
  );
}
