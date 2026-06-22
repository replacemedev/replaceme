import React from "react";
import Link from "next/link";
import { Users } from "lucide-react";

export function WorkersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mb-4">
        <Users size={24} />
      </div>
      <p className="text-slate-500 font-medium text-sm mb-5">
        Your hires will appear here
      </p>
      <Link
        href="/resumes"
        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-colors shadow-xs"
      >
        BROWSE RESUMES
      </Link>
    </div>
  );
}
