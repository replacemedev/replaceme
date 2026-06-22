"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Zap, ShieldCheck, Check, Sparkles } from "lucide-react";

interface SubmissionCardsProps {
  isSubmitting: boolean;
}

export function SubmissionCards({ isSubmitting }: SubmissionCardsProps) {
  const { setValue } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">4. Choose Your Listing Path</h2>
        <p className="text-sm text-slate-500">
          Decide how quickly you want to start matching with remote talent.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Standard Option */}
        <div className="relative bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-slate-300 transition-all duration-300 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Standard Review</h3>
                <p className="text-xs text-slate-400">Free manual verification</p>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Listed on public job board</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Standard search result placement</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 font-medium">Approval takes 2 business days</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50">
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-slate-800">$0</span>
              <span className="text-xs text-slate-400 font-medium ml-1">forever</span>
            </div>

            <button
              type="submit"
              onClick={() => setValue("intent", "standard")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center h-12 w-full px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit with Free Review"}
            </button>
          </div>
        </div>

        {/* Premium Option */}
        <div className="relative bg-[#fafdfb] border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-md shadow-emerald-50/20 overflow-hidden">
          {/* Recommended Badge */}
          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
            <Sparkles size={10} />
            Recommended
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800">
                <Zap size={18} />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Premium Boost</h3>
                <p className="text-xs text-emerald-600 font-semibold">Instant verification & reach</p>
              </div>
            </div>

            <div className="h-px bg-emerald-100/50" />

            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Instant approval (skip the queue)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">Highlighted listing badge (3x views)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>Pushed to top of worker matching feeds</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-100/50">
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-slate-800">$49</span>
              <span className="text-xs text-slate-400 font-medium ml-1">per post</span>
            </div>

            <button
              type="submit"
              onClick={() => setValue("intent", "premium")}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center h-12 w-full px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Get Premium Placement"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
