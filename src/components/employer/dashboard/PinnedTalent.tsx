import React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { WorkerProfile } from "@/types/employer/dashboard";

interface PinnedTalentProps {
  pinnedTalent: WorkerProfile[];
}

export function PinnedTalent({ pinnedTalent }: PinnedTalentProps) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Star size={18} className="text-yellow-500 fill-yellow-500" /> Pinned Talent
      </h2>

      {pinnedTalent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pinnedTalent.map((talent) => (
            <div 
              key={talent.id} 
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                {talent.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 text-sm truncate">{talent.name}</h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">{talent.role}</p>
                {talent.skills && talent.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {talent.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/talents/${talent.id}`}
                className="text-xs font-bold text-[#22c55e] hover:underline shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 mx-auto">
            <Star className="text-slate-400" size={18} />
          </div>
          <h4 className="text-sm font-bold text-slate-900">No pinned talent</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Pin talent profiles during search to review and compare them later.
          </p>
          <Link
            href="/talents"
            className="mt-4 inline-block bg-[#22c55e] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#16a34a] transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[#22c55e]"
          >
            Search Talent
          </Link>
        </div>
      )}
    </section>
  );
}
