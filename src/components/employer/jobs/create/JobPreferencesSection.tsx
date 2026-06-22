"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Sparkles, Mail, MailWarning, BadgeCheck, MapPin } from "lucide-react";
import Image from "next/image";

export function JobPreferencesSection() {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">3. Matching Preferences & Alerts</h2>
        <p className="text-sm text-slate-500">Configure how you receive candidates and preview candidate layouts.</p>
      </div>

      {/* Upsell Identity Preview Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/20 via-white to-slate-50/40 p-6 shadow-inner space-y-4">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800">
            <Sparkles size={16} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Premium Talent Preview</h3>
            <p className="text-xs text-slate-500">How candidates will see your brand and matches.</p>
          </div>
        </div>

        {/* Mock Candidate Card */}
        <div className="border border-slate-100 bg-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0a4a29] text-white flex items-center justify-center font-bold text-sm shrink-0">
              JD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-800">John Doe</h4>
                <BadgeCheck size={14} className="text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Senior React Developer • 5 yrs exp</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                <MapPin size={10} />
                <span>Remote (LatAm / Eastern Time)</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:justify-end">
            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[10px] font-semibold border border-slate-100">
              React
            </span>
            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[10px] font-semibold border border-slate-100">
              Next.js
            </span>
            <span className="px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md text-[10px] font-semibold border border-slate-100">
              TypeScript
            </span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Applicant Alert Frequency <span className="text-red-500">*</span>
        </label>
        
        <Controller
          name="notificationPreference"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option Daily */}
              <button
                type="button"
                onClick={() => field.onChange("daily")}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                  field.value === "daily"
                    ? "border-emerald-500 bg-emerald-50/10 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${field.value === "daily" ? "bg-emerald-100 text-emerald-800" : "bg-slate-50 text-slate-400"}`}>
                  <MailWarning size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-bold text-slate-800">Daily Digest</span>
                    <input
                      type="radio"
                      checked={field.value === "daily"}
                      onChange={() => {}}
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Receive one consolidated email notification with all matching applicants every morning.
                  </p>
                </div>
              </button>

              {/* Option Immediate */}
              <button
                type="button"
                onClick={() => field.onChange("immediate")}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                  field.value === "immediate"
                    ? "border-emerald-500 bg-emerald-50/10 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200"
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${field.value === "immediate" ? "bg-emerald-100 text-emerald-800" : "bg-slate-50 text-slate-400"}`}>
                  <Mail size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-bold text-slate-800">Real-time Alert</span>
                    <input
                      type="radio"
                      checked={field.value === "immediate"}
                      onChange={() => {}}
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Get an instant email notification the second a qualified worker matches or applies.
                  </p>
                </div>
              </button>
            </div>
          )}
        />
        {errors.notificationPreference && (
          <p className="text-red-500 text-xs mt-1">
            {errors.notificationPreference.message as string}
          </p>
        )}
      </div>
    </div>
  );
}
