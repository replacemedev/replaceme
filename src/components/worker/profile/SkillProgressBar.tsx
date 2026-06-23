"use client";

import React from "react";
import { WorkerSkillDetailed } from "@/types/worker-profile";

interface SkillProgressBarProps {
  skill: WorkerSkillDetailed;
}

export function SkillProgressBar({ skill }: SkillProgressBarProps) {
  // Format details line: e.g. "Web Programming • 1 - 2 years"
  const details = [
    skill.category,
    skill.experience_duration
  ].filter(Boolean).join(" • ");

  return (
    <div className="space-y-2">
      {/* Labels Row */}
      <div className="flex justify-between items-baseline select-none">
        <div className="space-y-0.5">
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">
            {skill.skill_name}
          </h4>
          {details && (
            <p className="text-[10px] font-bold text-slate-400">
              {details}
            </p>
          )}
        </div>
        <span className="text-xs font-bold text-[#006e2f] uppercase tracking-wide">
          {skill.proficiency_label || "Proficient"}
        </span>
      </div>

      {/* Visual horizontal progress track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="bg-[#006e2f] h-full rounded-full transition-all duration-500" 
          style={{ width: `${Math.min(Math.max(skill.proficiency, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
