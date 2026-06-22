"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { PricingPlan } from "@/types/employer/billing";

interface CompareTableProps {
  plans: PricingPlan[];
}

export function CompareTable({ plans }: CompareTableProps) {
  if (!plans || plans.length === 0) {
    return null;
  }

  // Find limits for each plan dynamically by matching name
  const getPlanData = (planName: string) => {
    return plans.find((p) => p.name.toLowerCase() === planName.toLowerCase());
  };

  const discovery = getPlanData("discovery");
  const essential = getPlanData("essential");
  const professional = getPlanData("professional");

  if (!discovery || !essential || !professional) {
    return null;
  }

  const rows = [
    {
      feature: "Job Posts",
      discovery: discovery.limits.jobs,
      essential: essential.limits.jobs,
      professional: professional.limits.jobs,
    },
    {
      feature: "Applicants per Job",
      discovery: discovery.limits.applicants,
      essential: essential.limits.applicants,
      professional: professional.limits.applicants,
    },
    {
      feature: "Approval Time",
      discovery: discovery.limits.approval,
      essential: essential.limits.approval,
      professional: professional.limits.approval,
      highlight: true, // green highlight for instant
    },
    {
      feature: "Candidate Contact",
      discovery: "x",
      essential: essential.limits.candidateContact,
      professional: professional.limits.candidateContact,
    },
    {
      feature: "View Identities",
      discovery: "x",
      essential: "check",
      professional: "check",
    },
    {
      feature: "Priority Support",
      discovery: "x",
      essential: "x",
      professional: "check",
    },
  ];

  const renderCell = (val: string, isHighlight = false) => {
    if (val === "check") {
      return (
        <div className="flex justify-center">
          <Check className="w-5 h-5 text-[#10b981] stroke-[3]" />
        </div>
      );
    }
    if (val === "x") {
      return (
        <div className="flex justify-center">
          <X className="w-5 h-5 text-red-500 stroke-[3]" />
        </div>
      );
    }
    if (val === "Instant" && isHighlight) {
      return <span className="text-[#10b981] font-semibold">{val}</span>;
    }
    return <span className="text-gray-700 font-medium">{val}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">Compare Features</h3>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-5 text-sm font-semibold text-gray-500 w-1/4">Feature</th>
              <th className="p-5 text-sm font-semibold text-gray-900 text-center w-1/4">Discovery</th>
              <th className="p-5 text-sm font-semibold text-[#10b981] text-center w-1/4">Essential</th>
              <th className="p-5 text-sm font-semibold text-gray-900 text-center w-1/4">Professional</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 text-sm font-semibold text-gray-600">{row.feature}</td>
                <td className="p-5 text-sm text-center">
                  {renderCell(row.discovery, row.highlight)}
                </td>
                <td className="p-5 text-sm text-center">
                  {renderCell(row.essential, row.highlight)}
                </td>
                <td className="p-5 text-sm text-center">
                  {renderCell(row.professional, row.highlight)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
