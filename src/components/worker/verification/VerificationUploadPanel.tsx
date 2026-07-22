"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { submitVerificationForReview } from "@/actions/verification";
import { patchWorkerProfile } from "@/actions/worker/profile";
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
  idType?: string | null;
  idNumber?: string | null;
  idExpirationDate?: string | null;
  idIssuingCountry?: string | null;
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
  idType,
  idNumber,
  idExpirationDate,
  idIssuingCountry,
}: VerificationUploadPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  const [editing, setEditing] = useState(false);
  const [localIdType, setLocalIdType] = useState(idType || "");
  const [localIdNumber, setLocalIdNumber] = useState(idNumber || "");
  const [localIdExpirationDate, setLocalIdExpirationDate] = useState(idExpirationDate || "");
  const [localIdIssuingCountry, setLocalIdIssuingCountry] = useState(idIssuingCountry || "");
  async function handleSaveDetails() {
    startSaveTransition(async () => {
      const result = await patchWorkerProfile({
        idType: localIdType || null,
        idNumber: localIdNumber || null,
        idExpirationDate: localIdExpirationDate || null,
        idIssuingCountry: localIdIssuingCountry || null,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Identity details saved.");
      setEditing(false);
      router.refresh();
    });
  }

  const uploadsDisabled =
    verificationStatus === "under_review" || verificationStatus === "approved";

  const docMap = new Map(documents.map((d) => [d.documentType, d]));
  const banner = statusMessage(verificationStatus);

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#006e2f]/20 focus:border-[#006e2f] transition-all";

  return (
    <section className="space-y-5">
      {!personalInfoComplete && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Complete your{" "}
          <Link href="/worker/profile" className="font-bold underline">
            profile
          </Link>{" "}
          (name, email, professional title, phone number, demographics, emergency contact, ID metadata) before submitting verification.
        </div>
      )}

      {banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${verificationStatus === "approved"
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

      {/* ID Identity Metadata Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Government ID Details</h3>
            <p className="text-[11px] text-slate-400 font-medium">Must match the uploaded government identification documents.</p>
          </div>
          {!uploadsDisabled && !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-[#006e2f] hover:underline"
            >
              Edit
            </button>
          ) : null}
        </div>

        {editing ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block space-y-1 text-xs font-bold text-slate-500">
                ID Type
                <select
                  value={localIdType}
                  onChange={(e) => setLocalIdType(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select ID Type...</option>
                  <option value="Passport">Passport</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="National ID">National ID</option>
                  <option value="UMID">UMID</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block space-y-1 text-xs font-bold text-slate-500">
                ID Number
                <input
                  type="text"
                  value={localIdNumber}
                  onChange={(e) => setLocalIdNumber(e.target.value)}
                  placeholder="ID Number"
                  className={inputClass}
                />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block space-y-1 text-xs font-bold text-slate-500">
                ID Expiration Date
                <input
                  type="date"
                  value={localIdExpirationDate}
                  onChange={(e) => setLocalIdExpirationDate(e.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="block space-y-1 text-xs font-bold text-slate-500">
                ID Issuing Country
                <input
                  type="text"
                  value={localIdIssuingCountry}
                  onChange={(e) => setLocalIdIssuingCountry(e.target.value)}
                  placeholder="e.g. Philippines"
                  className={inputClass}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setLocalIdType(idType || "");
                  setLocalIdNumber(idNumber || "");
                  setLocalIdExpirationDate(idExpirationDate || "");
                  setLocalIdIssuingCountry(idIssuingCountry || "");
                  setEditing(false);
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDetails}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#006e2f] rounded-lg hover:bg-[#005c26]"
              >
                {isSaving ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
            <div>
              <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ID Type</dt>
              <dd className="mt-1 text-sm font-bold text-slate-800">{idType || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ID Number</dt>
              <dd className="mt-1 text-sm font-bold text-slate-800">{idNumber || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expiration Date</dt>
              <dd className="mt-1 text-sm font-bold text-slate-800">{idExpirationDate || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Issuing Country</dt>
              <dd className="mt-1 text-sm font-bold text-slate-800">{idIssuingCountry || "—"}</dd>
            </div>
          </dl>
        )}
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
