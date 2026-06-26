"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, Eye, Receipt } from "lucide-react";
import { HiredWorker } from "@/types/employer/hired";

interface HiredWorkerCardProps {
  worker: HiredWorker;
}

export function HiredWorkerCard({ worker }: HiredWorkerCardProps) {
  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Date Formatter: "Joined Sep 2023"
  const formattedJoinDate = (() => {
    try {
      const date = new Date(worker.startDate);
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      return `Joined ${month} ${year}`;
    } catch {
      return "Joined";
    }
  })();

  // Style helper for Type Badge
  const getBadgeStyle = () => {
    switch (worker.employmentType) {
      case "full-time":
        return "bg-emerald-50 text-emerald-800 border-emerald-100";
      case "contract":
        return "bg-indigo-50 text-indigo-800 border-indigo-100";
      case "part-time":
        return "bg-amber-50 text-amber-800 border-amber-100";
      default:
        return "bg-slate-50 text-slate-800 border-slate-100";
    }
  };

  const getBadgeLabel = () => {
    switch (worker.employmentType) {
      case "full-time":
        return "FULL TIME";
      case "contract":
        return "CONTRACT";
      case "part-time":
        return "PART TIME";
      default:
        return "UNKNOWN";
    }
  };

  // Status Style helper
  const getStatusStyle = () => {
    switch (worker.status) {
      case "active":
        return { dot: "bg-emerald-500", text: "text-emerald-700 bg-emerald-50 border-emerald-100" };
      case "paused":
        return { dot: "bg-amber-500", text: "text-amber-700 bg-amber-50 border-amber-100" };
      case "terminated":
        return { dot: "bg-slate-400", text: "text-slate-700 bg-slate-50 border-slate-100" };
      default:
        return { dot: "bg-slate-400", text: "text-slate-700 bg-slate-50 border-slate-100" };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all duration-300 animate-fadeIn">
      {/* Left Area: Profile Details */}
      <div className="flex items-center gap-4 shrink-0 min-w-0 lg:max-w-md">
        <div className="relative w-14 h-14 rounded-2xl bg-emerald-50 border border-slate-100 shrink-0">
          {worker.avatarUrl ? (
            <Image
              src={worker.avatarUrl}
              alt={worker.name}
              fill
              className="rounded-2xl object-cover"
              sizes="56px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-extrabold text-base rounded-2xl">
              {initials}
            </div>
          )}
          {/* Online Dot */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
              worker.online ? "bg-emerald-500" : "bg-slate-300"
            }`}
            title={worker.online ? "Online" : "Offline"}
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-800 truncate mb-1">
            {worker.name}
          </h3>
          <p className="text-xs font-bold text-[#006e2f] truncate mb-2">
            {worker.role}
          </p>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 border rounded-lg text-[8px] font-black tracking-wider ${getBadgeStyle()}`}>
              {getBadgeLabel()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              {formattedJoinDate}
            </span>
          </div>
        </div>
      </div>

      {/* Mid Area: Contract Rates and Stats */}
      <div className="grid grid-cols-3 gap-4 lg:gap-8 flex-1 lg:max-w-xl py-3 lg:py-0 border-y lg:border-y-0 border-slate-50">
        <div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1.5">
            Salary
          </span>
          <span className="text-xs font-black text-slate-700 leading-none">
            ${worker.hourlyRate}/hr
          </span>
        </div>

        <div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1.5">
            Weekly Hours
          </span>
          <span className="text-xs font-black text-slate-700 leading-none">
            {worker.weeklyHours} hrs
          </span>
        </div>

        <div>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none block mb-1.5">
            Status
          </span>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full text-[9px] font-black capitalize leading-none ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {worker.status}
          </div>
        </div>
      </div>

      {/* Right Area: Action Buttons */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href={`/messages?id=${worker.id}`}
          className="h-9 px-4 border border-emerald-100 bg-[#f0fdf4]/50 hover:bg-[#f0fdf4] text-[#006e2f] font-bold text-xs rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <MessageSquare size={13} className="fill-[#f0fdf4]" />
          Message
        </Link>

        <Link
          href={`/employer/contracts/${worker.id}`}
          className="h-9 px-4 border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center cursor-pointer"
        >
          View Contract
        </Link>

        <button
          type="button"
          className="w-9 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-400 hover:text-slate-700 rounded-2xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          title="View Payments / Invoices"
        >
          <Receipt size={15} />
        </button>
      </div>
    </div>
  );
}
