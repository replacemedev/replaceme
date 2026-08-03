"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, RefreshCw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { reviewWorkerVerification } from "@/actions/admin-actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { VerifiedBadge } from "@/components/shared/VerifiedBadge";
import { formatFullName } from "@/lib/format/name";
import { COMMON_KYC_REJECTION_REASONS } from "@/types/verification";
import type {
  AdminVerificationDocument,
  AdminVerificationQueueRow,
} from "@/types/admin.types";
import {
  DocumentLightbox,
  ProfileDetailsCard,
  VerificationDocCard,
  formatKycDate,
  formatRegionCity,
} from "@/components/admin/identity/KycReviewParts";

type ReviewDecision = "approved" | "rejected" | "resubmission_required";

interface IdentityReviewDetailClientProps {
  worker: AdminVerificationQueueRow;
  documents: AdminVerificationDocument[];
}

export function IdentityReviewDetailClient({
  worker,
  documents,
}: IdentityReviewDetailClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState<{
    type: ReviewDecision;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [presetReason, setPresetReason] = useState("");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null
  );

  const name =
    formatFullName(
      worker.first_name,
      worker.middle_name,
      worker.last_name,
      worker.suffix
    ) ||
    worker.email ||
    "Unknown worker";

  const canDecide =
    worker.verification_status === "documents_submitted" ||
    worker.verification_status === "under_review" ||
    worker.verification_status === "resubmission_required" ||
    worker.verification_status === "rejected";

  const openDecision = (type: ReviewDecision) => {
    setDecision({ type });
    setReason("");
    setPresetReason("");
  };

  const handleDecision = () => {
    if (!decision) return;
    const needsReason =
      decision.type === "rejected" || decision.type === "resubmission_required";
    const finalReason = reason.trim();
    if (needsReason && finalReason.length < 3) {
      toast.error(
        "Please provide feedback for the worker (at least 3 characters)."
      );
      return;
    }

    startTransition(async () => {
      const result = await reviewWorkerVerification(
        worker.id,
        decision.type,
        finalReason || undefined
      );
      if (result.success) {
        toast.success(
          decision.type === "approved"
            ? "Worker verified"
            : decision.type === "resubmission_required"
              ? "Resubmission requested"
              : "Verification rejected"
        );
        if (result.emailSent === false) {
          toast.message("Decision saved", {
            description: result.emailError
              ? `Email not sent (${result.emailError}).`
              : "In-app notification sent; email could not be delivered.",
          });
        }
        setDecision(null);
        router.push("/admin/identity?tab=pending");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
              {name}
            </h1>
            <VerifiedBadge show={worker.is_verified} size="sm" />
            <StatusBadge status={worker.verification_status} />
          </div>
          <p className="text-sm text-slate-500 break-all">{worker.email}</p>
          <p className="text-xs text-slate-400">
            Submitted{" "}
            {new Date(worker.submitted_at).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            {worker.reviewer_name
              ? ` · Last reviewed by ${worker.reviewer_name}`
              : ""}
          </p>
        </div>

        {canDecide ? (
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              disabled={pending}
              onClick={() => openDecision("approved")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#006e2f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#005c26] disabled:opacity-50"
            >
              <Check className="h-4 w-4" aria-hidden />
              Approve
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => openDecision("resubmission_required")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Require resubmission
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => openDecision("rejected")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden />
              Reject
            </button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-[#ebfdf2]/60 px-4 py-3 flex gap-3 items-start">
        <ShieldCheck
          className="h-5 w-5 text-[#006e2f] shrink-0 mt-0.5"
          aria-hidden
        />
        <p className="text-sm text-slate-700 leading-relaxed">
          Sensitive ID images are encrypted in private storage. Opening this
          page logs an access audit trail. Match the ID photo and selfie against
          the profile fields before approving.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="min-w-0 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Uploaded ID &amp; selfie
          </h2>
          {documents.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-400">
              No documents on file.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {documents.map((doc) => (
                <VerificationDocCard
                  key={doc.id}
                  doc={doc}
                  onZoom={(src, alt) => setLightbox({ src, alt })}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="min-w-0">
          <ProfileDetailsCard
            fullName={name}
            birthDate={formatKycDate(worker.birth_date)}
            regionCity={formatRegionCity(
              worker.city,
              worker.region,
              worker.location
            )}
            addressLine1={worker.address_line_1}
            idType={worker.id_type}
            idNumber={worker.id_number}
            idExpirationDate={worker.id_expiration_date}
            idIssuingCountry={worker.id_issuing_country}
          />
        </section>
      </div>

      <ConfirmDialog
        open={decision !== null}
        title={
          decision?.type === "approved"
            ? "Approve verification?"
            : decision?.type === "resubmission_required"
              ? "Require resubmission?"
              : "Reject verification?"
        }
        description={
          decision?.type === "approved"
            ? `Mark ${name} as identity-verified. The worker will be notified by email.`
            : decision?.type === "resubmission_required"
              ? `Ask ${name} to correct and resubmit identity documents. A reason is required.`
              : `Reject identity documents for ${name}. A reason is required and the worker will be notified.`
        }
        confirmLabel={
          decision?.type === "approved"
            ? "Approve"
            : decision?.type === "resubmission_required"
              ? "Require resubmission"
              : "Reject"
        }
        variant={decision?.type === "rejected" ? "danger" : "default"}
        loading={pending}
        onCancel={() => {
          setDecision(null);
          setReason("");
          setPresetReason("");
        }}
        onConfirm={handleDecision}
      >
        {decision?.type !== "approved" ? (
          <div className="space-y-3 mt-2">
            <div>
              <label
                htmlFor="kyc-reason-preset"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Rejection reason
              </label>
              <select
                id="kyc-reason-preset"
                value={presetReason}
                onChange={(e) => {
                  const value = e.target.value;
                  setPresetReason(value);
                  if (value) setReason(value);
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select a reason…</option>
                {COMMON_KYC_REJECTION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="kyc-reason-detail"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Message to worker
              </label>
              <textarea
                id="kyc-reason-detail"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Shown to the worker so they can fix and resubmit."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y min-h-[80px]"
              />
            </div>
          </div>
        ) : null}
      </ConfirmDialog>

      {lightbox ? (
        <DocumentLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      ) : null}
    </div>
  );
}
