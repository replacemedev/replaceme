"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { submitVerificationForReview } from "@/actions/verification";
import { DocumentDropzone } from "./DocumentDropzone";
import {
  VERIFICATION_DOCUMENT_TYPES,
  type VerificationDocumentRecord,
  type VerificationStatus,
} from "@/types/verification";

interface VerificationUploadPanelProps {
  documents: VerificationDocumentRecord[];
  verificationStatus: VerificationStatus;
  personalInfoComplete: boolean;
  canSubmitForReview: boolean;
}

function statusMessage(status: VerificationStatus): string | null {
  switch (status) {
    case "under_review":
      return "Your documents are under professional review. We'll notify you when complete.";
    case "approved":
      return "You're verified! Your badge is now visible across the platform.";
    case "rejected":
      return "Your previous submission needs updates. Please re-upload your documents.";
    default:
      return null;
  }
}

export function VerificationUploadPanel({
  documents,
  verificationStatus,
  personalInfoComplete,
  canSubmitForReview,
}: VerificationUploadPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const uploadsDisabled =
    verificationStatus === "under_review" || verificationStatus === "approved";

  const docMap = new Map(documents.map((d) => [d.documentType, d]));
  const banner = statusMessage(verificationStatus);

  return (
    <section className="space-y-5">
      {!personalInfoComplete && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Complete your{" "}
          <Link href="/worker/profile" className="font-bold underline">
            profile
          </Link>{" "}
          (name, email, professional title) before submitting verification.
        </div>
      )}

      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            verificationStatus === "approved"
              ? "border-[#006e2f]/30 bg-[#ebfdf2] text-[#0a4a29]"
              : verificationStatus === "rejected"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-900"
          }`}
        >
          {banner}
        </div>
      )}

      <div className="rounded-xl border border-emerald-100 bg-[#ebfdf2]/50 p-4 text-xs sm:text-sm text-emerald-950 flex items-start gap-2.5 shadow-sm">
        <span className="text-base shrink-0" aria-hidden="true">💡</span>
        <div>
          <strong className="font-bold text-emerald-900">Accepted IDs:</strong> Unified Multi-Purpose ID (UMID), Driver&apos;s License, Philippine Passport, National ID (PhilID), SSS/GSIS, PRC ID, or Postal ID.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {VERIFICATION_DOCUMENT_TYPES.map((type) => (
          <DocumentDropzone
            key={type}
            documentType={type}
            existing={docMap.get(type)}
            disabled={uploadsDisabled}
          />
        ))}
      </div>

      {canSubmitForReview && verificationStatus !== "under_review" && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await submitVerificationForReview();
                if (!result.success) {
                  toast.error(result.error ?? "Could not submit.");
                  return;
                }
                toast.success("Verification submitted for review.");
                router.refresh();
              });
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#006e2f] hover:bg-[#005c26] text-white text-sm font-extrabold uppercase tracking-wide disabled:opacity-60 cursor-pointer w-full md:w-auto"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            Submit for Review
          </button>
        </div>
      )}
    </section>
  );
}
