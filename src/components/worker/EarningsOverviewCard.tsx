import React from "react";
import { EarningsMonth } from "@/types/worker";

interface EarningsOverviewCardProps {
  earnings: EarningsMonth[];
}

export function EarningsOverviewCard({ earnings }: EarningsOverviewCardProps) {
  // Find maximum amount to calculate heights proportionally
  const maxAmount = earnings.length > 0 
    ? Math.max(...earnings.map((e) => e.amount)) 
    : 1;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-xs gap-6 select-none flex flex-col justify-between h-[250px]">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Earnings Overview
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-normal">
          Track your payouts (Always 100% yours)
        </p>
      </div>

      {/* Bar Chart Container */}
      <div className="flex-1 flex items-end justify-between gap-4 px-2 pt-6 pb-2 h-28">
        {earnings.map((item) => {
          // Calculate proportional height (min 15% for visual visibility)
          const pctHeight = Math.max((item.amount / maxAmount) * 100, 15);
          
          return (
            <div key={item.id} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              {/* Tooltip on hover */}
              <div className="group relative flex flex-col items-center w-full h-full justify-end">
                <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap pointer-events-none z-20">
                  ₱{item.amount.toLocaleString()}
                </span>
                
                <div 
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    item.is_highlighted 
                      ? "bg-[#22c55e] hover:bg-[#16a34a]" 
                      : "bg-[#e2e8f0] hover:bg-[#cbd5e1]"
                  }`}
                  style={{ height: `${pctHeight}%` }}
                />
              </div>
              
              <span className="text-[10px] font-bold text-slate-400">
                {item.month_name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
