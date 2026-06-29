"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Bookmark, ArrowUpDown, BadgeCheck } from "lucide-react";
import { PinnedWorker } from "@/types/employer/pinned";
import { WorkerCard } from "./WorkerCard";
import { togglePin } from "@/actions/employer/pinned";
import { toast } from "sonner";
import { EMPLOYER_CARD } from "@/lib/employer/ui-tokens";

type SortKey = "name" | "rate" | "experience";

interface PinnedWorkerGridProps {
  initialPinnedWorkers: PinnedWorker[];
  planSlug: string;
  messagingEnabled?: boolean;
}

export function PinnedWorkerGrid({
  initialPinnedWorkers,
  planSlug,
  messagingEnabled = true,
}: PinnedWorkerGridProps) {
  const [workers, setWorkers] = useState<PinnedWorker[]>(initialPinnedWorkers);
  const [searchQuery, setSearchQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");

  useEffect(() => {
    setWorkers(initialPinnedWorkers);
  }, [initialPinnedWorkers]);

  const handleUnpin = async (workerId: string) => {
    const originalWorkers = [...workers];
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));

    const result = await togglePin(workerId);

    if (result.success && !result.pinned) {
      toast.success("Worker unpinned successfully.");
    } else {
      setWorkers(originalWorkers);
      toast.error(result.error || "Failed to unpin worker.");
    }
  };

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    let result = workers.filter((worker) => {
      const matchesSearch =
        !query ||
        worker.name.toLowerCase().includes(query) ||
        worker.role.toLowerCase().includes(query) ||
        worker.skills.some((skill) => skill.toLowerCase().includes(query));
      const matchesVerified = !verifiedOnly || worker.isVerified;
      return matchesSearch && matchesVerified;
    });

    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case "rate":
          return b.hourlyRate - a.hourlyRate;
        case "experience":
          return b.experienceYears - a.experienceYears;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [workers, searchQuery, verifiedOnly, sortKey]);

  return (
    <div className="space-y-6">
      <div
        className={`${EMPLOYER_CARD} flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search talent pool by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/30 focus:bg-white transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setVerifiedOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              verifiedOnly
                ? "bg-[#006e2f] text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Verified only
          </button>

          <label className="inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <ArrowUpDown size={13} className="text-slate-400" aria-hidden />
              <span>Sort by:</span>
            </span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="bg-transparent focus:outline-none cursor-pointer text-right sm:text-left flex-1 sm:flex-initial"
              aria-label="Sort talent pool"
            >
              <option value="name">Name</option>
              <option value="rate">Hourly rate</option>
              <option value="experience">Experience</option>
            </select>
          </label>

          <span className="text-xs text-slate-400 font-semibold border-l border-slate-100 pl-3 tabular-nums">
            <span className="font-bold text-slate-700">{filteredWorkers.length}</span>{" "}
            {filteredWorkers.length === 1 ? "worker" : "workers"}
          </span>
        </div>
      </div>

      {filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              planSlug={planSlug}
              messagingEnabled={messagingEnabled}
              onUnpin={() => handleUnpin(worker.id)}
            />
          ))}
        </div>
      ) : (
        <div className={`${EMPLOYER_CARD} p-12 text-center max-w-lg mx-auto`}>
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 mx-auto border border-slate-100">
            <Bookmark className="text-slate-400" size={24} aria-hidden />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-2">
            No pinned workers found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
            {searchQuery || verifiedOnly
              ? "No results match your filters. Try clearing search or the verified filter."
              : "Keep track of top talent by bookmarking professionals during search or review."}
          </p>
          {!searchQuery && !verifiedOnly ? (
            <Link
              href="/employer/jobs"
              className="inline-flex h-10 px-6 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-xl items-center transition-colors"
            >
              View job pipelines
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
