"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Eye, Award, DollarSign } from "lucide-react";
import { PinnedWorker } from "@/types/employer/pinned";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { PinToggle } from "./PinToggle";

interface WorkerCardProps {
  worker: PinnedWorker;
  onUnpin: () => void;
}

export function WorkerCard({ worker, onUnpin }: WorkerCardProps) {
  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm min-h-[260px] transition-all duration-300 hover:shadow-md hover:border-slate-200/50 hover:-translate-y-0.5 animate-fadeIn">
      {/* Top Section: Avatar, Status, Name, and Role */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar container with online dot */}
            <div className="relative w-12 h-12 rounded-2xl bg-emerald-50 border border-slate-100 shrink-0">
              {worker.avatarUrl ? (
                <Image
                  src={worker.avatarUrl}
                  alt={worker.name}
                  fill
                  className="rounded-2xl object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-extrabold text-sm rounded-2xl">
                  {initials}
                </div>
              )}
              {/* Online Dot */}
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                  worker.online ? "bg-emerald-500" : "bg-slate-300"
                }`}
                title={worker.online ? "Online" : "Offline"}
              />
            </div>

            <div>
              <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-1.5 inline-flex items-center gap-1">
                {worker.name}
                <VerifiedBadge show={worker.isVerified} size="sm" />
              </h3>
              <p className="text-[10px] text-slate-400 font-bold leading-none">
                {worker.role}
              </p>
            </div>
          </div>

          <PinToggle
            workerId={worker.id}
            isPinned={worker.isPinned}
            onToggle={onUnpin}
          />
        </div>

        {/* Mid Section: Stats (Rate and Experience) */}
        <div className="grid grid-cols-2 gap-3 mb-4 py-2.5 px-3 bg-slate-50/50 rounded-2xl border border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <DollarSign size={13} />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                Rate
              </p>
              <p className="text-[10px] font-black text-slate-700 leading-none">
                ${worker.hourlyRate.toFixed(2)}/hr
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <Award size={13} />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
                Experience
              </p>
              <p className="text-[10px] font-black text-slate-700 leading-none">
                {worker.experienceYears} {worker.experienceYears === 1 ? "yr" : "yrs"}
              </p>
            </div>
          </div>
        </div>

        {/* Skill tags */}
        <div className="flex flex-wrap gap-1.5 min-h-[50px] content-start">
          {worker.skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-bold rounded-lg"
            >
              {skill}
            </span>
          ))}
          {worker.skills.length > 3 && (
            <span className="px-2 py-1 bg-slate-50 border border-slate-100 text-[9px] text-slate-400 font-extrabold rounded-lg">
              +{worker.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Card Action Buttons Footer */}
      <div className="mt-5 flex gap-2 pt-4 border-t border-slate-50 items-center">
        <Link
          href={`/workers/${worker.id}`}
          className="flex-1 h-9 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye size={14} />
          View Profile
        </Link>
        <Link
          href={`/messages?id=${worker.id}`}
          className="w-9 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-slate-800 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          title="Chat with candidate"
        >
          <MessageSquare size={15} />
        </Link>
      </div>
    </div>
  );
}
