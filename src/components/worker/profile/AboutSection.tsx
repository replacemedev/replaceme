"use client";

import React from "react";
import { User } from "lucide-react";

interface AboutSectionProps {
  bio: string | null;
}

export function AboutSection({ bio }: AboutSectionProps) {
  // Split paragraphs by newline to display formatted content
  const paragraphs = bio ? bio.split("\n").filter(p => p.trim() !== "") : [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-6 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <div className="p-1.5 bg-[#ebfdf2] text-[#006e2f] rounded-lg">
          <User size={18} className="stroke-[2.5]" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
          About Me
        </h3>
      </div>

      {/* Narrative Biography */}
      <div className="space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, idx) => (
            <p key={idx} className="text-slate-600 font-medium text-sm leading-relaxed">
              {para}
            </p>
          ))
        ) : (
          <p className="text-slate-400 font-semibold text-sm italic">
            No bio provided yet. Add your story under Edit Profile.
          </p>
        )}
      </div>
    </div>
  );
}
