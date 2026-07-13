"use client";

import React, { useState } from "react";
import { X, Loader2, Briefcase, Eye } from "lucide-react";

interface HireWorkerModalProps {
  open: boolean;
  onClose: () => void;
  candidateName: string;
  onConfirm: (employmentStatus: string, showHiredBadge: boolean) => void;
  isPending: boolean;
}

export function HireWorkerModal({
  open,
  onClose,
  candidateName,
  onConfirm,
  isPending,
}: HireWorkerModalProps) {
  const [employmentStatus, setEmploymentStatus] = useState("Full-time");
  const [showHiredBadge, setShowHiredBadge] = useState(true);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(employmentStatus, showHiredBadge);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-[calc(100vw-2rem)] mx-4 max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-slate-100 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-[#006e2f]">
              <Briefcase size={16} />
            </span>
            <h3 className="text-base font-extrabold text-slate-800">
              Hire Worker
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Candidate</p>
            <p className="text-sm font-black text-slate-900">{candidateName}</p>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">
              Employment Status
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </label>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
              <input
                type="checkbox"
                id="show-hired-badge-modal-checkbox"
                checked={showHiredBadge}
                onChange={(e) => setShowHiredBadge(e.target.checked)}
                className="w-4.5 h-4.5 rounded-md border-slate-350 text-[#006e2f] focus:ring-[#006e2f]/30 cursor-pointer mt-0.5 shrink-0"
              />
              <label htmlFor="show-hired-badge-modal-checkbox" className="select-none cursor-pointer">
                <span className="block text-xs font-bold text-slate-850">
                  Display 'Hired' badge on Worker's public profile
                </span>
                <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                  This badge is optional. Toggle off to hide the badge from public view while keeping status active.
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 rounded-xl px-4 text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-10 rounded-xl px-4 text-xs font-bold bg-[#006e2f] hover:bg-[#005c26] text-white disabled:opacity-50 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Hiring...
                </>
              ) : (
                "Confirm Hire"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
