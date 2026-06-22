import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { WorkerProfile } from "@/types/employer/dashboard";

interface YourWorkersProps {
  workers: WorkerProfile[];
}

export function YourWorkers({ workers }: YourWorkersProps) {
  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-slate-800">Your Workers</h2>
        <Link 
          href="/team" 
          className="text-xs font-bold text-[#22c55e] hover:underline focus-visible:outline-2 focus-visible:outline-[#22c55e] rounded"
        >
          View All
        </Link>
      </div>

      {workers.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3.5">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {worker.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{worker.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{worker.role}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide uppercase ${
                  worker.status === "ACTIVE" 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : "bg-slate-50 text-slate-500 border border-slate-100"
                }`}>
                  {worker.status || "ACTIVE"}
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/team"
            className="w-full text-center py-2.5 mt-2 block text-xs font-bold text-[#22c55e] border border-[#22c55e]/20 rounded-xl hover:bg-green-50 transition-colors focus-visible:outline-2 focus-visible:outline-[#22c55e]"
          >
            Manage Team
          </Link>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 mx-auto">
            <Users className="text-slate-400" size={18} />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No hired workers yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Your active team members will be listed here once hired.
          </p>
        </div>
      )}
    </section>
  );
}
