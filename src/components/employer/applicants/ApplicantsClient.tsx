"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Unlock } from "lucide-react";
import { Applicant } from "@/types/employer/applicants";
import { ApplicantsToolbar } from "./ApplicantsToolbar";
import { ApplicantCard } from "./ApplicantCard";
import { LockedApplicantCard } from "./LockedApplicantCard";
import { unlockCandidate, getApplicants } from "@/actions/employer/applicants";
import { toast } from "sonner";

interface ApplicantsClientProps {
  initialApplicants: Applicant[];
  initialCreditsBalance: number;
  jobId: string;
  jobTitle: string;
}

export function ApplicantsClient({
  initialApplicants,
  initialCreditsBalance,
  jobId,
  jobTitle,
}: ApplicantsClientProps) {
  const router = useRouter();
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [creditsBalance, setCreditsBalance] = useState<number>(initialCreditsBalance);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [targetApplicant, setTargetApplicant] = useState<Applicant | null>(null);

  // Sync state if props change
  useEffect(() => {
    setApplicants(initialApplicants);
  }, [initialApplicants]);

  useEffect(() => {
    setCreditsBalance(initialCreditsBalance);
  }, [initialCreditsBalance]);

  // Handle status updates via ApplicationStatusDropdown (server action + router.refresh)

  // Trigger lightweight confirmation or redirect depending on credits balance
  const handleUnlockClick = (app: Applicant) => {
    setTargetApplicant(app);
    setModalOpen(true);
  };

  // Execute database unlock and state updates
  const handleUnlockSuccess = async () => {
    if (!targetApplicant) return;

    const toastId = toast.loading("Processing candidate profile unlock...");
    try {
      const result = await unlockCandidate(targetApplicant.id);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success("Profile unlocked successfully!", { id: toastId });
        setModalOpen(false);
        setTargetApplicant(null);

        // Fetch refreshed details from backend to pull unmasked candidate attributes
        const freshData = await getApplicants(jobId);
        setApplicants(freshData.applicants);
        setCreditsBalance(freshData.creditsBalance);
        router.refresh();
      }
    } catch (err) {
      toast.error("An unexpected error occurred during unlock.", { id: toastId });
    }
  };

  const handleChatWithCandidate = (candidateId: string) => {
    router.push(`/messages?id=${candidateId}`);
  };

  // Filter applicants list by search query
  const filteredApplicants = applicants.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.role.toLowerCase().includes(query) ||
      app.skills.some((s) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner and Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-100 pb-6">
        <div>
          {/* Breadcrumbs label */}
          <div className="text-xs font-black tracking-wider text-[#10b981] mb-1.5 uppercase">
            Applicant Pipeline
          </div>
          {/* Main Title matching design */}
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
            Job: {jobTitle}
          </h1>
        </div>

        {/* Dynamic Count Pill Badge */}
        <div className="bg-[#e6fbf2] text-[#10b981] font-bold text-sm px-4 py-2 rounded-full shadow-xs shrink-0 self-start md:self-auto">
          {applicants.length} Applicants Active
        </div>
      </div>

      {/* Credit balance display card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#10b981]" />
          <span className="text-sm font-semibold text-gray-600">
            Available Profile Unlock Balance:
          </span>
        </div>
        <span className="bg-[#e6fbf2] border border-[#10b981]/25 text-[#10b981] text-xs font-bold px-4 py-1.5 rounded-xl shadow-inner">
          {creditsBalance} Credits Remaining
        </span>
      </div>

      {/* Search and Filters Toolbar */}
      <ApplicantsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={filteredApplicants.length}
      />

      {/* Candidates Column Stack List (Matches design horizontal rows layout) */}
      {filteredApplicants.length > 0 ? (
        <div className="space-y-4">
          {filteredApplicants.map((app) =>
            app.isUnlocked ? (
              <ApplicantCard
                key={app.id}
                applicant={app}
                onMessageClick={() => handleChatWithCandidate(app.candidateId)}
              />
            ) : (
              <LockedApplicantCard
                key={app.id}
                applicant={app}
                onUnlock={() => handleUnlockClick(app)}
              />
            )
          )}
        </div>
      ) : (
        /* Empty results state */
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-xs">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No Candidates Found</h3>
          <p className="text-sm text-gray-400 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
            No applicant matches the filter criteria or search keyword. Try modifying your search query.
          </p>
        </div>
      )}

      {/* Lightweight Confirmation Modal / Out of Credits Modal */}
      {modalOpen && targetApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            {creditsBalance > 0 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#10b981] mb-2">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Unlock Candidate Profile</h3>
                  <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                    Are you sure you want to unlock <strong className="text-gray-800">{targetApplicant.name}</strong>? This will deduct 1 credit from your remaining balance of <strong className="text-gray-800">{creditsBalance} credits</strong>.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setTargetApplicant(null);
                    }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUnlockSuccess}
                    className="flex-1 py-3 bg-[#10b981] hover:bg-[#0d9668] rounded-xl text-sm font-bold text-white transition shadow-sm cursor-pointer"
                  >
                    Unlock Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-2">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Out of Credits</h3>
                  <p className="text-sm text-gray-500 font-medium mt-2 leading-relaxed">
                    You have run out of profile unlock credits. Please upgrade your subscription plan to unlock more candidate profiles.
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setTargetApplicant(null);
                    }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      setTargetApplicant(null);
                      router.push("/pricing");
                    }}
                    className="flex-1 py-3 bg-[#10b981] hover:bg-[#0d9668] rounded-xl text-sm font-bold text-white transition shadow-sm cursor-pointer"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
