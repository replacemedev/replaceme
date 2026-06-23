"use client";

import React from "react";
import Image from "next/image";
import { MessageSquare, Trash2, Eye } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import { ApplicationStatusDropdown } from "@/components/employer/applications/ApplicationStatusDropdown";

interface ApplicantCardProps {
  applicant: Applicant;
  onMessageClick?: () => void;
  onDeleteClick?: () => void;
}

export function ApplicantCard({
  applicant,
  onMessageClick,
  onDeleteClick,
}: ApplicantCardProps) {
  const initials = applicant.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Determine match indicator styling
  const isHighMatch = applicant.matchLabel === "high";
  const matchPillStyle = isHighMatch
    ? "bg-emerald-500 text-white"
    : "bg-slate-100 text-slate-500";
  const matchText = isHighMatch ? `${applicant.matchScore}% MATCH` : "LOW MATCH";

  const isRejected = applicant.status === "REJECTED";

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm min-h-[220px] transition-all hover:shadow-md hover:border-slate-200/50">
      
      {/* Top Details Section */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar block with online green dot indicator */}
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 border border-slate-100 shrink-0">
              {applicant.avatarUrl ? (
                <Image
                  src={applicant.avatarUrl}
                  alt={applicant.name}
                  fill
                  className="rounded-2xl object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold text-sm rounded-2xl">
                  {initials}
                </div>
              )}
              {/* Online Dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            
            {/* Name and Professional Title */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-1">{applicant.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold leading-none">{applicant.role}</p>
            </div>
          </div>

          {/* Match Badge and Status Select Dropdown */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${matchPillStyle}`}>
              {matchText}
            </span>
            <ApplicationStatusDropdown
              applicationId={applicant.id}
              status={applicant.status}
            />
          </div>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5">
          {applicant.skills.map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-bold rounded-lg"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Card Action Buttons Footer */}
      <div className="mt-5 flex gap-2 pt-4 border-t border-slate-50 items-center">
        {isRejected ? (
          /* Rejected state footer buttons */
          <>
            <button
              type="button"
              className="flex-1 h-9 bg-white hover:bg-slate-50 border border-slate-100 text-slate-500 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              View History
            </button>
            <button
              onClick={onDeleteClick}
              type="button"
              className="w-9 h-9 border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Delete application"
            >
              <Trash2 size={15} />
            </button>
          </>
        ) : (
          /* Active state footer buttons */
          <>
            <button
              type="button"
              className="flex-1 h-9 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              View Profile
            </button>
            <button
              onClick={onMessageClick}
              type="button"
              className="w-9 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-slate-800 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Chat with candidate"
            >
              <MessageSquare size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
