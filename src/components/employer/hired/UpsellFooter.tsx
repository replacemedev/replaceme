"use client";

import React from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export function UpsellFooter() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm max-w-5xl mx-auto mt-8 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 mx-auto border border-slate-100 text-emerald-600">
        <UserPlus size={28} />
      </div>
      <h3 className="text-lg font-extrabold text-slate-800 mb-2">
        Need more talent?
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6 font-medium">
        Scale your operations instantly by browsing our curated list of world-class professionals ready to start.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex h-11 px-8 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-2xl items-center justify-center transition-colors shadow-sm cursor-pointer"
      >
        Browse Candidates
      </Link>
    </div>
  );
}
