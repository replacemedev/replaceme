"use client";

import React from "react";
import Link from "next/link";
import { AvatarImage } from "@/components/shared/media/AvatarImage";
import { Eye, Award, DollarSign, Lock } from "lucide-react";
import { PinnedWorker } from "@/types/employer/pinned";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { PinToggle } from "./PinToggle";
import { UnlockOverlay } from "@/components/shared/entitlements/UnlockOverlay";
import { EmployerMessageAction } from "@/components/employer/layout/EmployerInlineActions";

interface WorkerCardProps {
  worker: PinnedWorker;
  planSlug: string;
  messagingEnabled?: boolean;
  onUnpin: () => void;
}

export function WorkerCard({
  worker,
  planSlug,
  messagingEnabled = true,
  onUnpin,
}: WorkerCardProps) {
  const isPreview = worker.isPreview ?? false;
  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col justify-between shadow-sm min-h-[260px] transition-all duration-300 hover:shadow-md hover:border-slate-200/50 hover:-translate-y-0.5 animate-fadeIn">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-emerald-50">
              {worker.avatarUrl && !isPreview ? (
                <AvatarImage
                  src={worker.avatarUrl}
                  alt={worker.name}
                  initials={initials}
                  size="sm"
                  rounded="2xl"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center font-extrabold text-sm rounded-2xl ${
                    isPreview
                      ? "bg-slate-100 text-slate-400 blur-[1px]"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isPreview ? "?" : initials}
                </div>
              )}
              {isPreview ? (
                <span className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
                  <Lock className="h-4 w-4 text-slate-500" aria-hidden />
                </span>
              ) : (
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${
                    worker.online ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                  title={worker.online ? "Online" : "Offline"}
                />
              )}
            </div>

            <div>
              <h3 className="text-xs font-extrabold text-slate-800 leading-none mb-1.5 inline-flex items-center gap-1">
                {worker.name}
                {!isPreview ? (
                  <VerifiedBadge show={worker.isVerified} size="sm" />
                ) : null}
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
                {worker.experienceYears}{" "}
                {worker.experienceYears === 1 ? "yr" : "yrs"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 min-h-[50px] content-start">
          {worker.skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] text-slate-500 font-bold rounded-lg"
            >
              {skill}
            </span>
          ))}
          {worker.skills.length > 3 ? (
            <span className="px-2 py-1 bg-slate-50 border border-slate-100 text-[9px] text-slate-400 font-extrabold rounded-lg">
              +{worker.skills.length - 3} more
            </span>
          ) : null}
        </div>

        {isPreview ? (
          <UnlockOverlay feature="identity" currentPlan={planSlug} compact />
        ) : null}
      </div>

      <div className="mt-5 flex gap-2 pt-4 border-t border-slate-50 items-center">
        <Link
          href={
            worker.contextJobId
              ? `/employer/candidates/${worker.id}?jobId=${worker.contextJobId}`
              : "/employer/jobs"
          }
          className="flex-1 h-9 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye size={14} />
          {isPreview ? "Preview profile" : "View profile"}
        </Link>
        <EmployerMessageAction
          planSlug={planSlug}
          messagingEnabled={messagingEnabled}
          variant="icon"
        />
      </div>
    </div>
  );
}
