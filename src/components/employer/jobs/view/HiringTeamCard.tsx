"use client";

import React from "react";
import { Users, Mail } from "lucide-react";
import { HiringTeamMember } from "@/types/employer/jobs";

interface HiringTeamCardProps {
  hiringTeam: HiringTeamMember;
}

export function HiringTeamCard({ hiringTeam }: HiringTeamCardProps) {
  const initials = hiringTeam.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-emerald-600">
          <Users size={20} />
        </span>
        <h2 className="text-sm font-bold text-slate-800">Hiring Team</h2>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Team Member Avatar */}
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{hiringTeam.name}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{hiringTeam.role}</p>
          </div>
        </div>

        {/* Message / Email Action Link */}
        <a
          href={`mailto:${hiringTeam.email}`}
          className="p-2 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-700 transition-all duration-200 shrink-0"
          aria-label={`Send email to ${hiringTeam.name}`}
        >
          <Mail size={16} />
        </a>
      </div>
    </div>
  );
}
