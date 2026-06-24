"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Edit, Share2, MapPin, Calendar, Clock, DollarSign, ExternalLink } from "lucide-react";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { WorkerProfile } from "@/types/worker-profile";

interface ProfileSidebarProps {
  profile: WorkerProfile;
  isOwner?: boolean;
}

export function ProfileSidebar({ profile, isOwner = false }: ProfileSidebarProps) {
  // Format Member Since date
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Calculate age from birth_year
  const currentYear = new Date().getFullYear();
  const age = profile.birth_year ? currentYear - profile.birth_year : null;
  const ageString = age && profile.birth_year ? `${age} (${profile.birth_year})` : "N/A";

  const fullName = profile.full_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Worker Profile";
  const initials = profile.first_name ? profile.first_name[0].toUpperCase() : "W";

  return (
    <div className="relative -mt-20 lg:-mt-32 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 text-center space-y-6 select-none z-10">
      
      {/* Avatar Container with overlapping placement */}
      <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-white shadow-md bg-slate-50 overflow-hidden flex items-center justify-center">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={fullName}
            fill
            className="object-cover"
            sizes="128px"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#ebfdf2] text-[#006e2f] font-bold text-3xl">
            {initials}
          </div>
        )}
        
        {/* Verified green checkmark dot */}
        <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white">
          <Check size={12} className="stroke-[3]" />
        </div>
      </div>

      {/* Name and Professional Title */}
      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight inline-flex items-center justify-center gap-1.5 flex-wrap">
          {fullName}
          <VerifiedBadge show={Boolean(profile.is_verified)} size="md" />
        </h3>
        <p className="text-sm font-semibold text-slate-500">
          {profile.professional_title || "Specialized Contractor"}
        </p>
      </div>

      {/* Badges row */}
      <div className="flex justify-center items-center gap-2">
        {profile.is_top_rated && (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-[#006e2f] bg-[#ebfdf2] border border-[#006e2f]/20 uppercase">
            Top Rated
          </span>
        )}
        {profile.is_remote && (
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200">
            Remote
          </span>
        )}
      </div>

      {/* Quick Micro-stats Grid */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-0.5 text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <DollarSign size={10} />
            <span>Rate</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800">
            ₱{profile.hourly_rate || 0}/hr
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-0.5 text-left">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            <Clock size={10} />
            <span>Avail.</span>
          </div>
          <p className="text-sm font-extrabold text-slate-800">
            {profile.availability || "Full-time"}
          </p>
        </div>
      </div>

      {/* Metadata list */}
      <div className="space-y-3.5 pt-2 border-t border-slate-100 text-left text-xs font-bold text-slate-600">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Location</span>
          <div className="flex items-center gap-1.5 text-slate-800">
            <span>{profile.location || "N/A"}</span>
            {isOwner && <Edit size={12} className="text-slate-300 hover:text-slate-500 cursor-pointer" />}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Member Since</span>
          <span className="text-slate-800">{memberSince}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Age</span>
          <div className="flex items-center gap-1.5 text-slate-800">
            <span>{ageString}</span>
            {isOwner && <Edit size={12} className="text-slate-300 hover:text-slate-500 cursor-pointer" />}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Portfolio</span>
          <div className="flex items-center gap-1.5 text-[#006e2f] hover:underline">
            {profile.portfolio_url ? (
              <a
                href={profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <span>View Site</span>
                <ExternalLink size={12} />
              </a>
            ) : (
              <span className="text-slate-400">N/A</span>
            )}
            {isOwner && <Edit size={12} className="text-slate-300 hover:text-slate-500 cursor-pointer" />}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        {isOwner ? (
          <Link
            href="/worker/dashboard/profile"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 font-bold text-white bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] rounded-xl transition-all duration-150 shadow-xs cursor-pointer"
          >
            <Edit size={14} />
            Edit Profile
          </Link>
        ) : (
          <button
            type="button"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 font-bold text-white bg-[#006e2f] hover:bg-[#005c26] active:bg-[#00421a] rounded-xl transition-all duration-150 shadow-xs cursor-pointer"
          >
            Message Candidate
          </button>
        )}

        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all duration-150 cursor-pointer"
        >
          <Share2 size={14} className="text-slate-400" />
          Share Profile
        </button>
      </div>

    </div>
  );
}
