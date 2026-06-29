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
                
                {/* Faint background container track to provide scale */}
                <div className="w-full h-full bg-slate-100/70 border border-slate-200/20 rounded-t-lg relative flex flex-col justify-end overflow-hidden">
                  <div 
                    className={`w-full rounded-t-md transition-all duration-300 shadow-xs hover:shadow-sm ${
                      item.is_highlighted 
                        ? "bg-gradient-to-t from-green-600 to-green-400 hover:from-green-700 hover:to-green-500" 
                        : "bg-gradient-to-t from-slate-200 to-slate-150 hover:from-slate-300 hover:to-slate-200"
                    }`}
                    style={{ height: `${pctHeight}%` }}
                  />
                </div>
              </div>
              
              <span className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">
                {item.month_name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
