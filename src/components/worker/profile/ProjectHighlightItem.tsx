"use client";

import React from "react";
import { WorkerProject } from "@/types/worker-profile";

interface ProjectHighlightItemProps {
  project: WorkerProject;
}

export function ProjectHighlightItem({ project }: ProjectHighlightItemProps) {
  return (
    <div className="relative pl-6 space-y-1">
      {/* Decorative green marker dot */}
      <div className="absolute left-1 top-2.5 w-2 h-2 rounded-full bg-[#006e2f] border border-white ring-2 ring-[#ebfdf2]/60" />

      {/* Project details */}
      <div className="space-y-0.5">
        <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">
          {project.title}
        </h4>
        <p className="text-[10px] font-bold text-slate-400">
          {project.role} • {project.year}
        </p>
      </div>

      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl pt-1">
        {project.description}
      </p>

      {project.skills_used.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {project.skills_used.map((skill) => (
            <span
              key={skill}
              className="rounded-md border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
