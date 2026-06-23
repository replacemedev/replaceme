import React from "react";
import { WorkerSkill } from "@/types/worker";

interface SkillPillProps {
  skill: WorkerSkill;
}

export function SkillPill({ skill }: SkillPillProps) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#f4fbf7] text-[#006e2f] font-bold text-sm rounded-full border border-[#d1fae5] select-none shadow-[0_1px_2px_rgba(0,0,0,0.01)] transition-transform hover:-translate-y-[1px]">
      <span>{skill.skill_name}</span>
      <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 text-[9px] font-extrabold text-white bg-[#22c55e] rounded-full select-none leading-none">
        {skill.proficiency}%
      </span>
    </div>
  );
}
