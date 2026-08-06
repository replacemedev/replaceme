"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface MatchScoreBadgeProps {
  matchScore?: number;
  matchLabel?: "high" | "low" | string;
  isLoading?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  matchScore,
  matchLabel,
  isLoading = false,
  className = "",
}: MatchScoreBadgeProps) {
  const isHighMatch =
    matchLabel === "high" ||
    (typeof matchScore === "number" && matchScore >= 70);

  const matchPillStyle = isHighMatch
    ? "bg-emerald-500 text-white"
    : "bg-slate-100 text-slate-600 border border-slate-200/60";

  let matchText = "MATCH";
  if (typeof matchScore === "number") {
    matchText = isHighMatch ? `${matchScore}% MATCH` : "LOW MATCH";
  } else if (matchLabel) {
    matchText = matchLabel.toUpperCase() === "HIGH" ? "HIGH MATCH" : "LOW MATCH";
  }

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase transition-all shrink-0 ${matchPillStyle} ${className}`}
    >
      <span>{matchText}</span>
      {isLoading && (
        <Loader2
          className="h-3 w-3 animate-spin shrink-0 text-current"
          aria-hidden
        />
      )}
    </span>
  );
}
