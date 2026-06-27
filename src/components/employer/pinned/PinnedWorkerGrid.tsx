"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, Bookmark } from "lucide-react";
import { PinnedWorker } from "@/types/employer/pinned";
import { WorkerCard } from "./WorkerCard";
import { togglePin } from "@/actions/employer/pinned";
import { toast } from "sonner";

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

  // Sync state if initial prop updates
  useEffect(() => {
    setWorkers(initialPinnedWorkers);
  }, [initialPinnedWorkers]);

  // Handle un-pin with client-side optimistic update
  const handleUnpin = async (workerId: string) => {
    const originalWorkers = [...workers];
    
    // Optimistically filter out the unpinned worker
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    
    const result = await togglePin(workerId);

    if (result.success && !result.pinned) {
      toast.success("Worker unpinned successfully.");
    } else {
      // Revert if action failed
      setWorkers(originalWorkers);
      toast.error(result.error || "Failed to unpin worker.");
    }
  };

  // Filter list of pinned workers based on search query (name, role, or skills)
  const filteredWorkers = workers.filter((worker) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      worker.name.toLowerCase().includes(query) ||
      worker.role.toLowerCase().includes(query) ||
      worker.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Toolbar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pinned workers by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:bg-white transition-all font-body-base"
          />
        </div>

        {/* Action Buttons & Totals */}
        <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              className="h-10 px-4 bg-white border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <SlidersHorizontal size={14} className="text-slate-400" />
              Filter
            </button>
            <button
              type="button"
              className="h-10 px-4 bg-white border border-slate-100 hover:border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <ArrowUpDown size={14} className="text-slate-400" />
              Sort
            </button>
          </div>

          <div className="text-xs text-slate-400 font-semibold border-l border-slate-100 pl-4 h-6 flex items-center">
            <span className="font-bold text-slate-700 mr-1">{filteredWorkers.length}</span>{" "}
            {filteredWorkers.length === 1 ? "Worker" : "Workers"}
          </div>
        </div>
      </div>

      {/* Grid List */}
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
        /* Empty State */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm max-w-lg mx-auto mt-6">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 mx-auto border border-slate-100">
            <Bookmark className="text-slate-400" size={24} />
          </div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-2">
            No pinned workers found
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
            {searchQuery
              ? "We couldn't find any results matching your search terms. Try refining your keywords."
              : "Keep track of top talent by bookmarking professionals during search or review."}
          </p>
          {!searchQuery ? (
            <Link
              href="/employer/jobs"
              className="inline-flex h-10 px-6 bg-[#006e2f] hover:bg-[#005c26] text-white font-bold text-xs rounded-xl items-center transition-colors shadow-sm"
            >
              View job pipelines
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
